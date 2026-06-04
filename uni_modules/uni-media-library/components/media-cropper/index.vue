<template>
	<uni-popup ref="popup" type="center" :mask-click="false">
		<view class="media-cropper-dialog">
			<view class="cropper-header">
				<view class="cropper-title">图片裁剪</view>
				<view class="cropper-close" @click="close">
					<uni-icons type="closeempty" size="20" color="#8c8c8c"></uni-icons>
				</view>
			</view>
			<view class="cropper-body">
				<view class="cropper-stage" :id="stageId">
					<img :id="imageId" class="cropper-image" :src="imageUrl" alt="" @load="onImageRendered" @error="onImageError" />
					<view
						v-if="!initializing"
						class="cropper-frame"
						:style="frameStyle"
						@mousedown="startMove"
						@touchstart="startMove"
					>
						<view class="frame-grid"></view>
						<view class="resize-handle handle-nw" @mousedown.stop="startResize($event, 'nw')" @touchstart.stop="startResize($event, 'nw')"></view>
						<view class="resize-handle handle-ne" @mousedown.stop="startResize($event, 'ne')" @touchstart.stop="startResize($event, 'ne')"></view>
						<view class="resize-handle handle-sw" @mousedown.stop="startResize($event, 'sw')" @touchstart.stop="startResize($event, 'sw')"></view>
						<view class="resize-handle handle-se" @mousedown.stop="startResize($event, 'se')" @touchstart.stop="startResize($event, 'se')"></view>
					</view>
					<view class="cropper-loading" v-if="initializing">
						<uni-icons class="loading-icon" type="spinner-cycle" size="26" color="#fff"></uni-icons>
						<text>图片加载中</text>
					</view>
				</view>
				<view class="preset-panel">
					<view class="preset-title">尺寸</view>
					<view
						class="preset-item"
						:class="{ active: selectedPreset.value === preset.value }"
						v-for="preset in presets"
						:key="preset.value"
						@click="selectPreset(preset)"
					>
						<view class="preset-shape">
							<view class="preset-shape-inner" :style="getPresetShapeStyle(preset)"></view>
						</view>
						<text>{{ preset.label }}</text>
					</view>
				</view>
			</view>
			<view class="cropper-footer">
				<media-button type="default" size="small" @click="close">取消</media-button>
				<media-button type="primary" size="small" :disabled="processing || initializing" @click="exportCrop">
					{{ processing ? '上传中' : '裁剪并上传' }}
				</media-button>
			</view>
		</view>
	</uni-popup>
</template>

<script>
import MediaButton from '../media-button/index.vue'

export default {
	name: 'media-cropper',
	components: {
		MediaButton
	},
	emits: ['confirm'],
	props: {
		imageUrl: {
			type: String,
			default: ''
		},
		fileName: {
			type: String,
			default: 'image'
		}
	},
	data() {
		return {
			presets: [
				{ label: '自由', value: 'free', free: true },
				{ label: '1:1', value: '1-1', width: 1, height: 1 },
				{ label: '3:2', value: '3-2', width: 3, height: 2 },
				{ label: '16:9', value: '16-9', width: 16, height: 9 },
				{ label: '2:3', value: '2-3', width: 2, height: 3 },
				{ label: '6:19', value: '6-19', width: 6, height: 19 }
			],
			selectedPreset: { label: '自由', value: 'free', free: true },
			naturalSize: { width: 0, height: 0 },
			stageRect: { width: 0, height: 0 },
			imageRect: { left: 0, top: 0, width: 0, height: 0 },
			cropBox: { left: 0, top: 0, width: 0, height: 0 },
			dragState: null,
			processing: false,
			initializing: false,
			cropperId: `media-cropper-${Date.now()}-${Math.round(Math.random() * 100000)}`
		}
	},
	computed: {
		stageId() {
			return `${this.cropperId}-stage`
		},
		imageId() {
			return `${this.cropperId}-image`
		},
		frameStyle() {
			return {
				left: `${this.cropBox.left}px`,
				top: `${this.cropBox.top}px`,
				width: `${this.cropBox.width}px`,
				height: `${this.cropBox.height}px`
			}
		}
	},
	beforeDestroy() {
		this.unbindDragEvents()
	},
	destroyed() {
		this.unbindDragEvents()
	},
	methods: {
		open() {
			this.selectedPreset = this.presets[0]
			this.initializing = true
			this.naturalSize = { width: 0, height: 0 }
			this.cropBox = { left: 0, top: 0, width: 0, height: 0 }
			this.imageRect = { left: 0, top: 0, width: 0, height: 0 }
			this.$refs.popup.open()
		},
		close() {
			this.unbindDragEvents()
			this.processing = false
			this.initializing = false
			this.$refs.popup.close()
		},
		selectPreset(preset) {
			if (this.initializing) return
			this.selectedPreset = preset
			this.resetCropBox()
		},
		onImageRendered() {
			if (!this.initializing) return
			setTimeout(() => {
				this.initializeCropper()
			}, 350)
		},
		onImageError() {
			this.initializing = false
			uni.showToast({ title: '图片加载失败', icon: 'none' })
		},
		initializeCropper() {
			// #ifdef H5
			const imageEl = document.getElementById(this.imageId)
			if (!imageEl || !imageEl.complete || !imageEl.naturalWidth || !imageEl.naturalHeight) return
			this.naturalSize = {
				width: imageEl.naturalWidth,
				height: imageEl.naturalHeight
			}
			if (!this.measureStage()) {
				this.initializing = false
				uni.showToast({ title: '图片初始化失败', icon: 'none' })
				return
			}
			this.resetCropBox()
			this.initializing = false
			// #endif
		},
		measureStage() {
			// #ifdef H5
			const stage = document.getElementById(this.stageId)
			const imageEl = document.getElementById(this.imageId)
			if (!stage || !this.naturalSize.width || !this.naturalSize.height) return false

			const rect = stage.getBoundingClientRect()
			const imageRect = imageEl?.getBoundingClientRect ? imageEl.getBoundingClientRect() : null
			if (!imageRect || imageRect.width <= 0 || imageRect.height <= 0) return false

			this.stageRect = { width: rect.width, height: rect.height }
			this.imageRect = {
				left: imageRect.left - rect.left,
				top: imageRect.top - rect.top,
				width: imageRect.width,
				height: imageRect.height
			}
			return true
			// #endif
			return false
		},
		resetCropBox() {
			if (!this.imageRect.width || !this.imageRect.height) return

			const bounds = this.getCropBounds()
			const maxWidth = bounds.width * 0.82
			const maxHeight = bounds.height * 0.82
			let width = maxWidth
			let height = maxHeight

			if (!this.selectedPreset.free) {
				const ratio = this.selectedPreset.width / this.selectedPreset.height
				height = width / ratio

				if (height > maxHeight) {
					height = maxHeight
					width = height * ratio
				}
			}

			width = Math.max(24, width)
			height = Math.max(24, height)
			this.cropBox = {
				left: bounds.left + (bounds.width - width) / 2,
				top: bounds.top + (bounds.height - height) / 2,
				width,
				height
			}
		},
		getCropBounds() {
			return {
				left: this.imageRect.left,
				top: this.imageRect.top,
				width: this.imageRect.width,
				height: this.imageRect.height
			}
		},
		getPresetShapeStyle(preset) {
			if (preset.free) {
				return {
					width: '28px',
					height: '22px',
					borderStyle: 'dashed'
				}
			}
			const ratio = preset.width / preset.height
			const width = ratio >= 1 ? 28 : Math.max(8, 28 * ratio)
			const height = ratio >= 1 ? Math.max(8, 28 / ratio) : 28
			return {
				width: `${width}px`,
				height: `${height}px`
			}
		},
		getPointer(event) {
			const point = event.touches?.[0] || event.changedTouches?.[0] || event
			return {
				x: point.clientX,
				y: point.clientY
			}
		},
		startMove(event) {
			event.preventDefault()
			const pointer = this.getPointer(event)
			this.dragState = {
				type: 'move',
				startX: pointer.x,
				startY: pointer.y,
				startBox: { ...this.cropBox }
			}
			this.bindDragEvents()
		},
		startResize(event, direction) {
			event.preventDefault()
			const pointer = this.getPointer(event)
			this.dragState = {
				type: 'resize',
				direction,
				startX: pointer.x,
				startY: pointer.y,
				startBox: { ...this.cropBox }
			}
			this.bindDragEvents()
		},
		bindDragEvents() {
			// #ifdef H5
			document.addEventListener('mousemove', this.onDrag)
			document.addEventListener('mouseup', this.stopDrag)
			document.addEventListener('touchmove', this.onDrag, { passive: false })
			document.addEventListener('touchend', this.stopDrag)
			// #endif
		},
		unbindDragEvents() {
			// #ifdef H5
			document.removeEventListener('mousemove', this.onDrag)
			document.removeEventListener('mouseup', this.stopDrag)
			document.removeEventListener('touchmove', this.onDrag)
			document.removeEventListener('touchend', this.stopDrag)
			// #endif
		},
		onDrag(event) {
			if (!this.dragState) return
			event.preventDefault()
			const pointer = this.getPointer(event)
			const dx = pointer.x - this.dragState.startX
			const dy = pointer.y - this.dragState.startY

			if (this.dragState.type === 'move') {
				this.moveCropBox(dx, dy)
				return
			}

			this.resizeCropBox(dx, dy)
		},
		stopDrag() {
			this.dragState = null
			this.unbindDragEvents()
		},
		moveCropBox(dx, dy) {
			const box = this.dragState.startBox
			this.cropBox = this.clampCropBox({
				...box,
				left: box.left + dx,
				top: box.top + dy
			})
		},
		resizeCropBox(dx, dy) {
			const box = this.dragState.startBox
			const direction = this.dragState.direction
			const bounds = this.getCropBounds()
			const minWidth = Math.min(32, bounds.width)
			const minHeight = Math.min(32, bounds.height)
			const widthDelta = direction.includes('w') ? -dx : dx
			const heightDelta = direction.includes('n') ? -dy : dy
			const fixedRight = box.left + box.width
			const fixedBottom = box.top + box.height
			const maxWidth = direction.includes('w') ? fixedRight - bounds.left : bounds.left + bounds.width - box.left
			const maxHeight = direction.includes('n') ? fixedBottom - bounds.top : bounds.top + bounds.height - box.top
			let width = Math.min(Math.max(minWidth, box.width + widthDelta), maxWidth)
			let height = Math.min(Math.max(minHeight, box.height + heightDelta), maxHeight)
			let left = direction.includes('w') ? fixedRight - width : box.left
			let top = direction.includes('n') ? fixedBottom - height : box.top

			if (!this.selectedPreset.free) {
				const ratio = this.selectedPreset.width / this.selectedPreset.height
				const rawWidth = box.width + widthDelta
				const rawHeight = box.height + heightDelta
				if (Math.abs(widthDelta) > Math.abs(heightDelta * ratio)) {
					width = rawWidth
					height = width / ratio
				} else {
					height = rawHeight
					width = height * ratio
				}
				width = Math.max(minWidth, width)
				height = Math.max(minHeight, height)

				const scale = Math.min(
					1,
					maxWidth / width,
					maxHeight / height
				)
				width = Math.max(minWidth, width * scale)
				height = width / ratio
				if (height > maxHeight) {
					height = maxHeight
					width = height * ratio
				}
				left = direction.includes('w') ? box.left + box.width - width : box.left
				top = direction.includes('n') ? box.top + box.height - height : box.top
			}

			this.cropBox = this.clampCropBox({ left, top, width, height }, direction)
		},
		clampCropBox(box, direction = '') {
			const bounds = this.getCropBounds()
			let width = Math.min(box.width, bounds.width)
			let height = Math.min(box.height, bounds.height)

			if (!this.selectedPreset.free) {
				const ratio = this.selectedPreset.width / this.selectedPreset.height
				if (width / height > ratio) {
					width = height * ratio
				} else {
					height = width / ratio
				}
			}

			let left = box.left
			let top = box.top
			if (direction.includes('w')) {
				left = Math.min(Math.max(left, bounds.left), box.left + box.width - width)
			} else {
				left = Math.min(Math.max(left, bounds.left), bounds.left + bounds.width - width)
			}

			if (direction.includes('n')) {
				top = Math.min(Math.max(top, bounds.top), box.top + box.height - height)
			} else {
				top = Math.min(Math.max(top, bounds.top), bounds.top + bounds.height - height)
			}

			return { left, top, width, height }
		},
		exportCrop() {
			// #ifdef H5
			if (this.processing) return
			if (!this.imageUrl) return
			if (!this.cropBox.width || !this.cropBox.height || !this.imageRect.width || !this.imageRect.height) {
				this.initializeCropper()
				uni.showToast({ title: '图片还在准备中', icon: 'none' })
				return
			}

			this.processing = true
			const image = new Image()
			image.crossOrigin = 'anonymous'
			image.onload = () => {
				const scaleX = image.naturalWidth / this.imageRect.width
				const scaleY = image.naturalHeight / this.imageRect.height
				const sx = (this.cropBox.left - this.imageRect.left) * scaleX
				const sy = (this.cropBox.top - this.imageRect.top) * scaleY
				const sw = this.cropBox.width * scaleX
				const sh = this.cropBox.height * scaleY

				const canvas = document.createElement('canvas')
				canvas.width = Math.round(sw)
				canvas.height = Math.round(sh)
				const ctx = canvas.getContext('2d')
				try {
					ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
					const mimeType = this.getOutputMimeType()
					canvas.toBlob((blob) => {
						if (!blob) {
							this.processing = false
							uni.showToast({ title: '裁剪失败', icon: 'none' })
							return
						}

						this.$emit('confirm', {
							blob,
							width: canvas.width,
							height: canvas.height,
							fileName: this.getDownloadName(),
							mimeType,
							fileType: this.getOutputFileType(),
							preset: this.selectedPreset
						})
					}, mimeType, 0.88)
				} catch (e) {
					this.processing = false
					console.error('Export cropped image failed', e)
					uni.showToast({ title: '图片不支持裁剪上传', icon: 'none' })
				}
			}
			image.onerror = () => {
				this.processing = false
				uni.showToast({ title: '图片加载失败', icon: 'none' })
			}
			image.src = this.imageUrl
			// #endif

			// #ifndef H5
			uni.showToast({ title: '当前端暂不支持导出', icon: 'none' })
			// #endif
		},
		getDownloadName() {
			const name = String(this.fileName || 'image').replace(/\.[^.]+$/, '')
			return `${name}-${this.selectedPreset.label.replace(':', 'x')}.${this.getOutputFileType()}`
		},
		getOutputMimeType() {
			return 'image/jpeg'
		},
		getOutputFileType() {
			return 'jpg'
		},
		completeUpload() {
			this.processing = false
			this.close()
		},
		failUpload() {
			this.processing = false
		}
	}
}
</script>

<style lang="scss" scoped>
.media-cropper-dialog {
	width: min(880px, calc(100vw - 48px));
	height: min(620px, calc(100vh - 48px));
	background: #fff;
	border-radius: 8px;
	box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.cropper-header {
	height: 56px;
	padding: 0 16px;
	box-sizing: border-box;
	border-bottom: 1px solid #f0f0f0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-shrink: 0;
}

.cropper-title {
	font-size: 15px;
	font-weight: 600;
	color: #1f1f1f;
}

.cropper-close {
	width: 32px;
	height: 32px;
	border-radius: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: background-color .2s;

	&:hover {
		background: #f5f5f5;
	}
}

.cropper-body {
	flex: 1;
	min-height: 0;
	display: flex;
	background: #fafafa;
}

.cropper-stage {
	flex: 1;
	min-width: 0;
	margin: 16px;
	padding: 8px;
	box-sizing: border-box;
	border-radius: 8px;
	background: #202124;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.cropper-image {
	width: auto;
	height: auto;
	max-width: 100%;
	max-height: 100%;
	display: block;
	box-sizing: border-box;
}

.cropper-loading {
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 10px;
	background: rgba(0, 0, 0, .18);
	color: #fff;
	font-size: 13px;
	z-index: 3;

	.loading-icon {
		animation: rotate 1s linear infinite;
	}
}

.cropper-frame {
	position: absolute;
	border: 2px solid #fff;
	box-shadow: 0 0 0 999px rgba(0, 0, 0, .45), 0 8px 24px rgba(0, 0, 0, .24);
	box-sizing: border-box;
	cursor: move;
	user-select: none;
	touch-action: none;
}

.frame-grid {
	position: absolute;
	inset: 0;
	pointer-events: none;
	background:
		linear-gradient(to right, transparent 33.333%, rgba(255, 255, 255, .42) 33.333%, rgba(255, 255, 255, .42) calc(33.333% + 1px), transparent calc(33.333% + 1px), transparent 66.666%, rgba(255, 255, 255, .42) 66.666%, rgba(255, 255, 255, .42) calc(66.666% + 1px), transparent calc(66.666% + 1px)),
		linear-gradient(to bottom, transparent 33.333%, rgba(255, 255, 255, .42) 33.333%, rgba(255, 255, 255, .42) calc(33.333% + 1px), transparent calc(33.333% + 1px), transparent 66.666%, rgba(255, 255, 255, .42) 66.666%, rgba(255, 255, 255, .42) calc(66.666% + 1px), transparent calc(66.666% + 1px));
}

.resize-handle {
	position: absolute;
	width: 12px;
	height: 12px;
	background: #fff;
	border: 2px solid #1677ff;
	border-radius: 50%;
	box-sizing: border-box;
	z-index: 2;
	box-shadow: 0 1px 4px rgba(0, 0, 0, .2);
}

.handle-nw {
	left: -7px;
	top: -7px;
	cursor: nwse-resize;
}

.handle-ne {
	right: -7px;
	top: -7px;
	cursor: nesw-resize;
}

.handle-sw {
	left: -7px;
	bottom: -7px;
	cursor: nesw-resize;
}

.handle-se {
	right: -7px;
	bottom: -7px;
	cursor: nwse-resize;
}

.preset-panel {
	width: 110px;
	padding: 16px 12px;
	border-left: 1px solid #f0f0f0;
	background: #fff;
	box-sizing: border-box;
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
}

.preset-title {
	font-size: 12px;
	color: #8c8c8c;
	margin-bottom: 12px;
	flex-shrink: 0;
}

.preset-item {
	flex: 1;
	min-height: 60px;
	padding: 8px 10px;
	border-radius: 6px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8px;
	font-size: 13px;
	color: #595959;
	cursor: pointer;
	transition: background-color .2s, color .2s;

	&:hover {
		background: #f5f5f5;
		color: #1f1f1f;
	}

	&.active {
		background: #f0f5ff;
		color: #1677ff;
		font-weight: 500;
	}
}

.preset-shape {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.preset-shape-inner {
	border: 1px solid currentColor;
	border-radius: 2px;
	background: rgba(22, 119, 255, .08);
	box-sizing: border-box;
}

.cropper-footer {
	height: 56px;
	padding: 0 16px;
	box-sizing: border-box;
	border-top: 1px solid #f0f0f0;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 8px;
	flex-shrink: 0;
}

@keyframes rotate {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

@media screen and (max-width: 760px) {
	.media-cropper-dialog {
		width: calc(100vw - 24px);
		height: calc(100vh - 24px);
	}

	.cropper-body {
		flex-direction: column;
	}

	.cropper-stage {
		margin: 12px;
	}

	.preset-panel {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 8px;
		overflow-x: auto;
		border-left: none;
		border-top: 1px solid #f0f0f0;
		padding: 10px 12px;
	}

	.preset-title {
		margin-bottom: 0;
		flex-shrink: 0;
	}

	.preset-item {
		flex-shrink: 0;
		flex: none;
		width: 64px;
	}
}
</style>
