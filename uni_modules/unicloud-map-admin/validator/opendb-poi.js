// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "visible": {
    "rules": [
      {
        "format": "bool"
      }
    ],
    "title": "是否显示",
    "label": "是否显示"
  },
	"type": {
	  "rules": [
	    {
	      "format": "string"
	    }
	  ],
	  "title": "类型",
	  "label": "类型"
	},
  "icon": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "图标",
    "label": "图标"
  },
  "location": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "object"
      }
    ],
    "title": "地理位置",
    "label": "地理位置"
  },
  "title": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "title": "名称",
    "label": "名称"
  },
  "tel": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "电话",
    "label": "电话"
  },
  "province": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "省",
    "label": "省"
  },
  "city": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "市",
    "label": "市"
  },
  "district": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "区/县",
    "label": "区/县"
  }
}

const enumConverter = {}

function filterToWhere(filter, command) {
  let where = {}
  for (let field in filter) {
    let { type, value } = filter[field]
    switch (type) {
      case "search":
        if (typeof value === 'string' && value.length) {
          where[field] = new RegExp(value)
        }
        break;
      case "select":
        if (value.length) {
          let selectValue = []
          for (let s of value) {
            selectValue.push(command.eq(s))
          }
          where[field] = command.or(selectValue)
        }
        break;
      case "range":
        if (value.length) {
          let gt = value[0]
          let lt = value[1]
          where[field] = command.and([command.gte(gt), command.lte(lt)])
        }
        break;
      case "date":
        if (value.length) {
          let [s, e] = value
          let startDate = new Date(s)
          let endDate = new Date(e)
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
      case "timestamp":
        if (value.length) {
          let [startDate, endDate] = value
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
    }
  }
  return where
}

export { validator, enumConverter, filterToWhere }
