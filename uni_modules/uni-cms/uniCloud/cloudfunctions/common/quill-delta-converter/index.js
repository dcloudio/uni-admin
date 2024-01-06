const {
  QuillDeltaToHtmlConverter: QuillDeltaToHtmlConverterBase,
  BlockGroup,
  ListGroup,
  BlotBlock,
} = require('./core')

const jsonRules = {
  list(list) {
    const firstItem = list.items[0];

    return {
      type: "list",
      data: {
        type: firstItem.item.op.attributes.list,
        items: list.items.map((item) => jsonRules.listItem(item)),
      },
      attributes: firstItem.item.op.attributes,
      class: attributes2class(firstItem.item.op.attributes, 'block'),
      style: attributes2style(firstItem.item.op.attributes, 'block'),
    };
  },
  listItem(listItem) {
    // listItem.item.op.attributes.indent = 0;
    const inlines = jsonRules.inlines(listItem.item.op, listItem.item.ops, false).map((v) => v.ops)

    return {
      data: inlines[0] || [],
      children: listItem.innerList ? jsonRules.list(listItem.innerList): [],
    }
  },
  block (op, ops) {
    const type = ops[0].insert.type

    if (type === 'text') {
      return jsonRules.inlines(op, ops)
    }

    return {
      type: ops[0].insert.type,
      data: ops.map(bop => jsonRules.inline(bop)),
      attributes: op.attributes,
      class: attributes2class(op.attributes, 'block'),
      style: attributes2style(op.attributes, 'block'),
    }
  },
  inlines(op = {}, ops, isInlineGroup = true) {
    const opsLen = ops.length - 1;
    const br = {
      type: 'br'
    }
    const texts = ops.reduce((acc, op, i) => {
      if (i > 0 && i === opsLen && op.isJustNewline()) {
        acc[acc.length - 1].op = op
        return acc;
      }

      if (!acc[acc.length - 1]) {
        acc.push({ops: [], op: {}});
      }

      if (op.isJustNewline()) {
        const nextOp = ops[i + 1];
        acc[acc.length - 1].op = op
        if (nextOp && nextOp.isJustNewline()) {
          acc.push({ops: [br], op: {}});
        } else {
          acc.push({ops: [], op: {}});
        }
        return acc;
      } else {
        acc[acc.length - 1].ops.push(jsonRules.inline(op));
        return acc;
      }
    }, []);

    if (!isInlineGroup) {
      return texts;
    }

    return texts.map((v) => {
      return {
        type: "paragraph",
        data: v.ops,
        class: attributes2class(op.attributes || v.op.attributes, 'block'),
        style: attributes2style(op.attributes || v.op.attributes, 'block'),
      };
    });
  },
  inline (op) {
    const data = {
      value: op.insert.value,
      attributes: op.attributes,
      class: attributes2class(op.attributes, 'inline'),
      style: attributes2style(op.attributes, 'inline'),
    }

    if (op.isCustomEmbed()) {
      return {
        type: op.insert.type,
        data
      }
    }

    if (op.isLink()) {
      return {
        type: 'link',
        data
      }
    }

    return {
      type: op.isImage() ? "image": "text",
      data
    }
  },
  blotBlock (op) {
    return {
      type: op.insert.type,
      data: {
        value: op.insert.value,
        attributes: op.attributes,
        class: attributes2class(op.attributes, 'block'),
        style: attributes2style(op.attributes, 'block'),
      }
    }
  }
};

function  attributes2style(attributes, type) {
  if (!attributes) return ''
  // 定义允许的属性
  const allowAttr = {
    inline: ['align', 'color', 'background', 'font', 'fontSize', 'fontStyle', 'fontVariant', 'fontWeight', 'fontFamily', 'lineHeight', 'letterSpacing', 'textDecoration', 'textIndent', 'wordWrap', 'wordBreak', 'whiteSpace'],
    block: ['align', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'lineHeight', 'textIndent']
  }[type]

  // 定义属性适配器
  const adp = {
    align: 'text-align',
  }

  // 如果不支持该类型的属性，则抛出错误
  if (!allowAttr) throw new Error('type not supported')

  // 将属性转换为style
  return allowAttr.reduce((res, item) => {
    // 如果属性为空，则返回空字符串
    if (!attributes) return res
    // 如果属性不为undefined，则将属性名和属性值添加到style列表中
    if (attributes[item] !== undefined) {
      // 如果属性适配器中存在该属性，则使用适配器中的属性名
      // 否则，将属性名转换为短横线连接的形式
      res.push(`${adp[item] || item.replace(/([A-Z])/g, (s, m) => `-${m.toLowerCase()}`)}: ${attributes[item]}`)
    }
    return res

  }, []).join(';')
}
function attributes2class(attributes, type) {
  if (!attributes) return ''
  // 定义允许的属性
  const allowAttr = {
    inline: ['bold', 'italic', 'underline', 'strike', 'ins', 'link'],
    block: ['header', 'list']
  }[type]

  // 如果不支持该类型的属性，则抛出错误
  if (!allowAttr) throw new Error('type not supported')

  // 将属性转换为class列表
  const classList = allowAttr.reduce((res, item) => {
    // 如果属性为空，则返回空字符串
    if (!attributes || item === "link") return res
    // 如果属性为true，则将属性名添加到class列表中
    if (attributes[item] === true) {
      res.push(item)
      // 如果属性不为undefined，则将属性名和属性值添加到class列表中
    } else if (attributes[item] !== undefined) {
      res.push(`${item}-${attributes[item]}`)
    }
    return res

  }, [])

  // 如果属性中包含link，则添加link类
  if ('link' in attributes) {
    classList.push('link')
  }

  return classList.join(' ')
}
class QuillDeltaToJSONConverter {
  constructor(deltaOps) {

    this.deltaPreHandler(deltaOps)

    this.deltaOps = deltaOps
    this.converter = new QuillDeltaToHtmlConverterBase(this.deltaOps, {
      multiLineParagraph: false,
    });
  }

  deltaPreHandler (deltaOps) {
    for (const op of deltaOps) {
      if (typeof op.insert === 'string') continue

      if (!op.attributes) {
        op.attributes = {}
      }

      const insertType = Object.keys(op.insert)
      const blockRenderList = ['divider', 'unlockContent', 'mediaVideo']

      if (insertType && insertType.length > 0 && blockRenderList.includes(insertType[0])) {
        op.attributes.renderAsBlock = true
      }
    }
  }

  convert () {
    const opsGroups = this.converter.getGroupedOps();

    return [].concat.apply(
      [],
      opsGroups.map((group) => {
        // console.log(JSON.stringify(group), '--------------------group------------------------------')
        switch (group.constructor) {
          case ListGroup:
            return jsonRules.list(group);
          case BlockGroup:
            return jsonRules.block(group.op, group.ops)
          case BlotBlock:
            return jsonRules.blotBlock(group.op, group.ops)
          default:
            return jsonRules.inlines(group.op, group.ops);
        }
      })
    ).filter(op => op.data instanceof Array ? op.data.length : op.data);
  }
}

class QuillDeltaToHtmlConverter extends QuillDeltaToHtmlConverterBase {
  constructor(deltaOps) {
    super(deltaOps, {
      multiLineParagraph: false,
      inlineStyles: true,
    });

    // this.renderCustomWith(function (customOp, contextOp) {
    //   console.log(customOp, contextOp)
    // })
  }
}

exports.QuillDeltaToHtmlConverter = QuillDeltaToHtmlConverter
exports.QuillDeltaToJSONConverter = QuillDeltaToJSONConverter
