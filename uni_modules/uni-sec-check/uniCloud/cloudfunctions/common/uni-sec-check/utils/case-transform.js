const {
  hasOwn
} = require('./utils')
const {
  isPlainObject
} = require('./type')

const isSnakeCase = /_(\w)/g
const isCamelCase = /[A-Z]/g

function snake2camel(value) {
  return value.replace(isSnakeCase, (_, c) => (c ? c.toUpperCase() : ''))
}

function camel2snake(value) {
  return value.replace(isCamelCase, str => '_' + str.toLowerCase())
}

function parseObjectKeys(obj, type) {
  let parserReg, parser
  switch (type) {
    case 'snake2camel':
      parser = snake2camel
      parserReg = isSnakeCase
      break
    case 'camel2snake':
      parser = camel2snake
      parserReg = isCamelCase
      break
  }
  for (const key in obj) {
    if (hasOwn(obj, key)) {
      if (parserReg.test(key)) {
        const keyCopy = parser(key)
        obj[keyCopy] = obj[key]
        delete obj[key]
        if (isPlainObject(obj[keyCopy])) {
          obj[keyCopy] = parseObjectKeys(obj[keyCopy], type)
        } else if (Array.isArray(obj[keyCopy])) {
          obj[keyCopy] = obj[keyCopy].map((item) => {
            return parseObjectKeys(item, type)
          })
        }
      }
    }
  }
  return obj
}

function snake2camelRecursive(obj) {
  return parseObjectKeys(obj, 'snake2camel')
}

function camel2snakeRecursive(obj) {
  return parseObjectKeys(obj, 'camel2snake')
}

module.exports = {
  snake2camelRecursive,
  camel2snakeRecursive
}
