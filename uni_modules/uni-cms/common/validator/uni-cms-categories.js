// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "name": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "label": "名称"
  },
  "description": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "描述"
  },
  "icon": {
    "rules": [
      {
        "format": "string"
      },
      {
        "pattern": "^(http://|https://|/|./|@/)\\S"
      }
    ],
    "label": "图标地址"
  },
  "sort": {
    "rules": [
      {
        "format": "number"
      }
    ],
    "label": "排序"
  }
}

const enumConverter = {}

function filterToWhere(filter, command) {
  // 初始化 where 对象
  let where = {}
  // 遍历 filter 对象
  for (let field in filter) {
    // 获取当前 field 的 type 和 value
    let { type, value } = filter[field]
    // 根据 type 进行不同的处理
    switch (type) {
      // 如果是 search 类型
      case "search":
        // 如果 value 是字符串且长度不为 0
        if (typeof value === 'string' && value.length) {
          // 使用正则表达式进行模糊匹配
          where[field] = new RegExp(value)
        }
        break;
      // 如果是 select 类型
      case "select":
        // 如果 value 长度不为 0
        if (value.length) {
          // 初始化 selectValue 数组
          let selectValue = []
          // 遍历 value 数组
          for (let s of value) {
            // 将每个值转换为 eq 查询条件
            selectValue.push(command.eq(s))
          }
          // 使用 or 进行多条件查询
          where[field] = command.or(selectValue)
        }
        break;
      // 如果是 range 类型
      case "range":
        // 如果 value 长度不为 0
        if (value.length) {
          // 获取范围的起始值和结束值
          let gt = value[0]
          let lt = value[1]
          // 使用 and 进行多条件查询
          where[field] = command.and([command.gte(gt), command.lte(lt)])
        }
        break;
      // 如果是 date 类型
      case "date":
        // 如果 value 长度不为 0
        if (value.length) {
          // 获取日期范围的起始值和结束值
          let [s, e] = value
          let startDate = new Date(s)
          let endDate = new Date(e)
          // 使用 and 进行多条件查询
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
      // 如果是 timestamp 类型
      case "timestamp":
        // 如果 value 长度不为 0
        if (value.length) {
          // 获取时间戳范围的起始值和结束值
          let [startDate, endDate] = value
          // 使用 and 进行多条件查询
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
    }
  }
  // 返回 where 对象
  return where
}


export { validator, enumConverter, filterToWhere }
