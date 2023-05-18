export default function (Quill) {
  const { Scope, Attributor } = Quill.import('parchment')
  const config = {
    scope: Scope.INLINE
  }
  const font = ['font', 'fontSize', 'fontStyle', 'fontVariant', 'fontWeight', 'fontFamily']
  const result = {}
  font.forEach(name => {
    result[`formats/${name}`] = new Attributor.Style(name, name.replace(/[A-Z]/g, str => '-' + str.toLowerCase()), config)
  })

  return result
}
