<template>
	<view class="editor-toolbar-tool-box" ref="main">
		<uni-tooltip>
			<view ref="editorToolbarTool" class="editor-toolbar-tool" :class="{disabled: disabled, active: active, [type]: true, split: split}"
						@click="click">
				<template v-if="type === 'button'">
					<slot></slot>
				</template>
				<template v-else-if="type === 'dropdown'">
					<template v-if="split">
						<view class="main-icon">
							<slot :select="slotData"></slot>
						</view>
						<view class="drop-icon" data-type="drop">
							<uni-icons class="down" type="bottom" size="15" data-type="drop"></uni-icons>
						</view>
					</template>
					<template v-else>
						<slot :select="slotData"></slot>
						<uni-icons class="down" type="bottom" size="15"></uni-icons>
					</template>
				</template>
			</view>
			<template v-if="tooltip.content" v-slot:content class="tooltip">
				<view class="content">
					<text class="text">{{ tooltip.content }}</text>
				</view>
				<view class="key" v-if="tooltip.key">
					<text>{{ tooltip.key.join('+') }}</text>
				</view>
			</template>
		</uni-tooltip>
		<uni-transition class="editor-toolbar-popup" :mode-class="['fade']" :style="popupStyle" :show="showPopup">
			<slot name="popup" v-bind:change="change">
				<view class="editor-toolbar-popup-scroll">
					<view class="editor-toolbar-popup-scroll-item" v-for="(item) in popupItems" :key="item.text"
								@click="change(item)">
						<uni-icons class="icon" v-if="item.icon" :style="item.iconStyle" custom-prefix="editor-icon"
											 :type="item.icon" size="24px"></uni-icons>
            <view class="text">
              <text class="val" :style="item.style">{{ item.text }}</text>
              <text class="default" v-if="defaultVal && item.value === defaultVal">默认值</text>
            </view>
						<uni-icons type="checkmarkempty" v-if="item.active" class="active" size="18" color="#666666"></uni-icons>
					</view>
				</view>
			</slot>
		</uni-transition>
	</view>
</template>

<script>
export default {
	name: "toolbar-tool-base",
	emits: ['change'],
	props: {
		type: {
			type: String,
			default() {
				// tool 类型；button 按钮，dropdown 下拉
				return 'button'
			}
		},
		split: Boolean,
		disabled: Boolean,
    active: [Boolean, String, Number, Array],
    defaultVal: [Boolean, String, Number, Array],
		items: Array,
		popupStyle: String,
		tooltip: {
			type: Object,
			default() {
				return {
					key: '',
					content: ''
				}
			}
		}
	},
	data() {
		return {
			showPopup: false,
			slotData: {}
		}
	},
  computed: {
    popupItems () {
      if (!this.items) return []

      const activeItems = this.items.filter(item => item.active)

      if (activeItems.length) {
        return this.items
      } else {
        return this.items.map(item => {
          if (item.value === this.defaultVal) {
            item.active = true
          }
          return item
        })
      }
    }
  },
  mounted () {
    // 防止焦点失效
    if (this.$refs.editorToolbarTool) {
      this.$refs.editorToolbarTool.$el && this.$refs.editorToolbarTool.$el.addEventListener('mousedown', this.mousedownPreventDefault, {passive: false})
    }
  },
  unmounted () {
    if (this.$refs.editorToolbarTool) {
      this.$refs.editorToolbarTool.$el && this.$refs.editorToolbarTool.$el.removeEventListener('mousedown', this.mousedownPreventDefault, {passive: false})
    }
  },
	methods: {
    mousedownPreventDefault (e) {
      e.preventDefault()
    },
		hide(e) {
			if (this.$refs.main && !this.$refs.main.$el.contains(e.target)) {
				this.showPopup = false
			}
		},
		click(e) {
			const {type} = e.target.dataset
			if (!this.disabled) {
				if ((this.items && this.items.length) || type === 'drop') {
					this.dropdownClick()
				} else {
					this.buttonClick()
				}
			}
		},
		buttonClick() {
			this.$emit('change')
		},
		dropdownClick() {
			this.showPopup = !this.showPopup

			// #ifdef H5
			if (this.showPopup) {
				document.addEventListener('click', this.hide, false)
			} else {
				document.removeEventListener('click', this.hide, false)
			}
			// #endif
		},
		change(e) {
			this.slotData = e
			this.$emit('change', e)
			this.showPopup = false

			// #ifdef H5
			document.removeEventListener('click', this.hide, false)
			// #endif
		},
	}
}
</script>

<style scoped lang="scss">
// #ifdef H5
@import '@/uni_modules/uni-cms/common/style/editor-icon.css';
// #endif
.editor-toolbar-tool-box {
	position: relative;
	-webkit-user-select: none;

	::v-deep .uni-tooltip-popup {
		text-align: center;
		left: 50%;
		transform: translateX(-50%);
		line-height: 1.35;
		font-size: 14px;
		padding: 8px;
		white-space: nowrap;

		.key {
			color: #999;
		}
    .content > .text {
      white-space: nowrap;
    }
	}
}
.editor-toolbar-tool {
	-webkit-user-select: none;
	cursor: pointer;
	padding: 3px;
	border-radius: 4px;
	border: transparent solid 1px;
	transition: border-color .3s;
	margin: 0 2px;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		border: #e5e5e5 solid 1px;
	}

	&:active {
		background: #e8e8e8;
	}

	&.dropdown {
		display: flex;
		align-items: center;

		&.split {
			padding: 0;
			background: transparent;
			align-items: stretch;

			&:hover {
				.drop-icon::before {
					background: #e8e8e8;
				}
			}

			.main-icon, .drop-icon {
				&:active {
					background: #e8e8e8;
				}
			}

			.main-icon {
				padding: 3px;
				display: flex;
				align-items: center;
			}

			.drop-icon {
				padding: 3px;
				position: relative;
				display: flex;
				align-items: center;

				&:before {
					content: '';
					position: absolute;
					left: 0;
					top: 0;
					bottom: 0;
					width: 1px;
					transition: background .3s;
				}
			}
		}
	}

	&.disabled {
    color: #999;
		::v-deep .uni-icons {
			color: #999!important;
		}
	}

	&.active {
		background: #e8e8e8;
	}
}

.editor-toolbar-mask {
	position: fixed;
	z-index: 1002;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
}

.editor-toolbar-popup {
	position: absolute;
	top: 100%;
	left: 0;
	background: #ffffff;
	min-width: 100px;
	height: auto;
	z-index: 1003;
	border-radius: 4px;
	box-shadow: 0 2px 8px 0 rgba(0, 0, 0, .15);

	&-scroll {
		padding: 10px;
	}

	&-scroll-item {
		padding: 5px 10px;
		display: flex;
		align-items: center;
		border-radius: 4px;
		cursor: pointer;
		position: relative;
		padding-right: 24px;
		margin-right: 5px;

		&:hover {
			background: #ededed;
		}

		.active {
			position: absolute;
			top: 50%;
			right: 10px;
			transform: translateY(-50%);
			z-index: 1;
		}

		.icon {
			width: 24px;
			height: 24px;
		}

    .text {
      display: flex;
      align-items: center;
      .default {
        font-size: 13px;
        color: #999;
        margin-left: 5px;
      }
    }
	}
}


@media (max-width: 768px) {
	.editor-toolbar-popup {
		top: auto;
		bottom: 50px;

		&-scroll {
			padding: 10px;
			display: flex;
			align-items: center;
		}

		&-scroll-item {
			padding: 3px;
			display: flex;
			align-items: center;
			border-radius: 4px;
			cursor: pointer;

			&:hover {
				background: #ededed;
			}

			.active, .text {
				display: none
			}
		}
	}
}
</style>
