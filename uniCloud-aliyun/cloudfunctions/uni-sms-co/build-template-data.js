module.exports = (templateData, user) => {
  const data = {}
  for (const template of templateData) {
    const isDynamic = /\{.*?\}/.test(template.value)

    if (isDynamic) {
      const value = template.value.replace(/\{|\}/g, '')
      data[template.field] = user[value] || ''
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
