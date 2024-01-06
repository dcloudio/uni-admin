// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema

const validator = {
    "user_id": {
        "rules": [
            {
                "required": true
            },
            {
                "format": "string"
            }
        ],
        "defaultValue": {
            "$env": "uid"
        },
        "label": "作者"
    },
    "category_id": {
        "rules": [
            {
                "format": "string"
            }
        ],
        "title": "分类",
        "label": "分类"
    },
    "content": {
        "rules": [
            {
                "required": true
            }
        ],
        "label": "文章内容",
        "title": "文章内容"
    },
    "excerpt": {
        "rules": [
            {
                "format": "string"
            }
        ],
        "label": "摘要",
        "title": "文章摘录"
    },
    "article_status": {
        "rules": [
            {
                "format": "int"
            },
            {
                "range": [
                    {
                        "value": 0,
                        "text": "草稿箱"
                    },
                    {
                        "value": 1,
                        "text": "已发布"
                    }
                ]
            }
        ],
        "title": "文章状态",
        "defaultValue": 0,
        "label": "文章状态"
    },
    "view_count": {
        "rules": [
            {
                "format": "int"
            }
        ],
        "title": "阅读数量",
        "label": "阅读数量"
    },
    "is_sticky": {
        "rules": [
            {
                "format": "bool"
            }
        ],
        "title": "是否置顶",
        "label": "是否置顶"
    },
    "is_essence": {
        "rules": [
            {
                "format": "bool"
            }
        ],
        "title": "阅读加精",
        "label": "阅读加精"
    },
    "comment_status": {
        "rules": [
            {
                "format": "int"
            },
            {
                "range": [
                    {
                        "value": 0,
                        "text": "关闭"
                    },
                    {
                        "value": 1,
                        "text": "开放"
                    }
                ]
            }
        ],
        "title": "开放评论",
        "label": "开放评论"
    },
    "publish_date": {
        "rules": [
            {
                "format": "timestamp"
            }
        ],
        "title": "发表时间",
        "defaultValue": {
            "$env": "now"
        },
        "label": "发表时间"
    }
}

const enumConverter = {
    "article_status_valuetotext": {
        "0": "草稿箱",
        "1": "已发布"
    },
    "comment_status_valuetotext": {
        "0": "关闭",
        "1": "开放"
    }
}

/**
 * 将筛选条件转换为 where 对象
 * @param {Object} filter - 筛选条件
 * @param {Object} command - 数据库操作命令
 * @returns {Object} where 对象
 */
function filterToWhere(filter, command) {
    let where = {}
    for (let field in filter) {
        let {type, value} = filter[field]
        switch (type) {
            case "search":
                // 如果是搜索类型，将正则表达式作为 where 对象的属性值
                if (typeof value === 'string' && value.length) {
                    where[field] = new RegExp(value)
                }
                break;
            case "select":
                // 如果是选择类型，将选择的值作为 where 对象的属性值
                if (value.length) {
                    let selectValue = []
                    for (let s of value) {
                        selectValue.push(command.eq(s))
                    }
                    where[field] = command.or(selectValue)
                }
                break;
            case "range":
                // 如果是范围类型，将范围值作为 where 对象的属性值
                if (value.length) {
                    let gt = value[0]
                    let lt = value[1]
                    where[field] = command.and([command.gte(gt), command.lte(lt)])
                }
                break;
            case "date":
                // 如果是日期类型，将日期范围作为 where 对象的属性值
                if (value.length) {
                    let [s, e] = value
                    let startDate = new Date(s)
                    let endDate = new Date(e)
                    where[field] = command.and([command.gte(startDate), command.lte(endDate)])
                }
                break;
            case "timestamp":
                // 如果是时间戳类型，将时间戳范围作为 where 对象的属性值
                if (value.length) {
                    let [startDate, endDate] = value
                    where[field] = command.and([command.gte(startDate), command.lte(endDate)])
                }
                break;
        }
    }
    return where
}

export {validator, enumConverter, filterToWhere}
