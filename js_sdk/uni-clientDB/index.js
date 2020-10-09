import parser from './parser.js'
import {
  getSafeProxy
} from './utils'

const authCallBacks = {}

class Stage {
  constructor (content, prevStage, actionName) {
    this.content = content
    this.prevStage = prevStage
    this.actionName = actionName
  }

  toJSON () {
    let tempStage = this
    const stages = [tempStage.content]
    while (tempStage.prevStage) {
      tempStage = tempStage.prevStage
      stages.push(tempStage.content)
    }
    return {
      $db: stages.reverse().map((item) => {
        return {
          $method: item.$method,
          $param: item.$param
        }
      })
    }
  }

  get () {
    return this._send('get', Array.from(arguments))
  }

  count () {
    return this._send('count', Array.from(arguments))
  }

  add () {
    return this._send('add', Array.from(arguments))
  }

  remove () {
    return this._send('remove', Array.from(arguments))
  }

  update () {
    return this._send('update', Array.from(arguments))
  }

  end () {
    return this._send('end', Array.from(arguments))
  }

  set () {
    throw new Error('客户端禁止使用set方法')
  }

  _send (method, param) {
    const command = this.toJSON()
    command.$db.push({
      $method: method,
      $param: param
    })
    return uniCloud.callFunction({
      name: 'uni-clientDB',
      data: {
        action: this.actionName,
        command
      }
    }).then(res => {
      const {
        token,
        tokenExpired
      } = res.result
      if (token && tokenExpired) {
        authCallBacks.refreshToken.forEach(func => {
          func({
            token,
            tokenExpired
          })
        })
      }
      return Promise.resolve(res)
    }).catch(err => {
      return Promise.reject(err)
    })
  }
}

const propList = ['db.Geo', 'db.command', 'command.aggregate']

function isProp (prev, key) {
  return propList.indexOf(`${prev}.${key}`) > -1
}

function getDbIns (content, prevStage, actionName) {
  const stage = new Stage(content, prevStage, actionName)
  return getSafeProxy(stage, {
    get (stage, key) {
      let prevMethod = 'db'
      if (stage && stage.content) {
        prevMethod = stage.content.$method
      }
      if (isProp(prevMethod, key)) {
        return getDbIns({
          $method: key
        }, stage, actionName)
      }
      return function () {
        return getDbIns({
          $method: key,
          $param: parser(Array.from(arguments))
        }, stage, actionName)
      }
    }
  })
}

function getDbClass ({
  path,
  method
}) {
  return class {
    constructor () {
      this.param = Array.from(arguments)
    }

    toJSON () {
      return {
        $newDb: [
          ...path.map(prop => { return { $method: prop } }),
          {
            $method: method,
            $param: this.param
          }]
      }
    }
  }
}

const db = {
  auth: {
    on: (event, func) => {
      authCallBacks[event] = authCallBacks[event] || []
      if (authCallBacks[event].indexOf(func) > -1) {
        return
      }
      authCallBacks[event].push(func)
    },
    off: (event, func) => {
      authCallBacks[event] = authCallBacks[event] || []
      const index = authCallBacks[event].indexOf(func)
      if (index === -1) {
        return
      }
      authCallBacks[event].splice(index, 1)
    }
  },
  env: getSafeProxy({}, {
    get (env, prop) {
      return {
        $env: prop
      }
    }
  }),
  action (actionName) {
    return getSafeProxy({}, {
      get (db, key) {
        if (isProp('db', key)) {
          return getDbIns({
            $method: key
          }, null, actionName)
        }
        return function () {
          return getDbIns({
            $method: key,
            $param: parser(Array.from(arguments))
          }, null, actionName)
        }
      }
    })
  },
  Geo: getSafeProxy({}, {
    get (Geo, key) {
      return getDbClass({
        path: ['Geo'],
        method: key
      })
    }
  }),
  get serverDate () {
    return getDbClass({
      path: [],
      method: 'serverDate'
    })
  },
  get RegExp () {
    return getDbClass({
      path: [],
      method: 'RegExp'
    })
  }
}

export default getSafeProxy(db, {
  get (db, key) {
    if (isProp('db', key)) {
      return getDbIns({
        $method: key
      })
    }
    return function () {
      return getDbIns({
        $method: key,
        $param: parser(Array.from(arguments))
      })
    }
  }
})
