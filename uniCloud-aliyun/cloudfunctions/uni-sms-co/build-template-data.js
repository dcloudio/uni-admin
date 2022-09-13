module.exports = (templateData, user) => {
  const data = {}
  for (const template of templateData) {
    const isDynamic = /\{.*?\}/.test(template.value)

    // 仅支持uni-id-users
    if (isDynamic) {
      const [collection, field] = template.value.replace(/\{|\}/g, '').split('.')
      data[template.field] = collection === 'uni-id-users' ? user[field] || template.value: template.value
    } else {
      data[template.field] = template.value
    }
    // switch (template.type) {
    //   case 'static':
    //     data[template.field] = template.value
    //   break
    //   case 'dynamic':
    //     data[template.field] = user[template.value] || ''
    //   break
    //   default:
    //     throw new Error(`template type [${template.type}] not supported`)
    // }
  }

  return data
}
