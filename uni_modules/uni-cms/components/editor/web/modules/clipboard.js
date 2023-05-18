export default function CustomClipboard (Quill) {
	const Delta = Quill.import('delta')
	const Clipboard = Quill.import('modules/clipboard')
	class CustomClipboard extends Clipboard {
		onPaste(e) {
			const top = window.pageYOffset;
			const left = window.pageXOffset;

			if (e.defaultPrevented || !this.quill.isEnabled()) return;
			let range = this.quill.getSelection();
			let delta = new Delta().retain(range.index);
			this.container.style.top = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0).toString() + 'px';
			this.container.focus();
			setTimeout(() => {
				this.quill.selection.update(Quill.sources.SILENT);
				delta = delta.concat(this.convert()).delete(range.length);
				this.quill.updateContents(delta, Quill.sources.USER);
				this.quill.setSelection(delta.length() - range.length, Quill.sources.SILENT);
				let bounds = this.quill.getBounds(delta.length() - range.length, Quill.sources.SILENT);
				this.quill.scrollingContainer.scrollTop = bounds.top;

				// scroll window to previous position after paste
				window.scrollTo({top, left});
			}, 1);
		}
	}

	return {
		'modules/clipboard': CustomClipboard
	}
}
