export default function (Quill) {
  const { Scope, Attributor } = Quill.import('parchment')
  const config = {
    scope: Scope.BLOCK
  }
  const textIndentStyle = new Attributor.Style('text', 'text-indent', config)
  return {
    'formats/textIndent1': textIndentStyle
  }
}
