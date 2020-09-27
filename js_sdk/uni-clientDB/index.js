import parser from './parser.js'
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
    })
  }
}

const propList = ['db.Geo', 'db.command', 'command.aggregate']

function isProp (prev, key) {
  return propList.indexOf(`${prev}.${key}`) > -1
}

function getDbIns (content, prevStage, actionName) {
  const stage = new Stage(content, prevStage, actionName)
  return new Proxy(stage, {
    get (stage, key) {
      if (Object.prototype.hasOwnProperty.call(stage, key) || stage[key] || typeof key !== 'string') {
        return stage[key]
      }
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

const db = {
  env: new Proxy({}, {
    get (_, prop) {
      if (typeof prop === 'string') {
        return {
          $env: prop
        }
      } else {
        return {}[prop]
      }
    }
  }),
  action (actionName) {
    return new Proxy({}, {
      get (db, key, rec) {
        if (db[key]) {
          return db[key]
        }
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
  }
}

export default new Proxy(db, {
  get (db, key, rec) {
    if (db[key]) {
      return db[key]
    }
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
