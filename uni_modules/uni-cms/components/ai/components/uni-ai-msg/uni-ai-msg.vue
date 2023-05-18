<template>
	<view class="rich-text-box" :class="{'show-cursor':showCursor}" ref="rich-text-box">
		<rich-text v-if="nodes&&nodes.length" space="nbsp" :nodes="nodes"></rich-text>

		<!-- #ifdef H5 -->
		<view class="copy-box" :style="{left,top}">
			<text class="copy" @click="copy">复制</text>
			<!-- <view v-if="left != '-100px'" class="copy-mask" @click="left = '-100px'"></view> -->
		</view>
		<!-- #endif -->
	</view>
</template>

<script>
	import MarkdownIt from '../../static/markdown-it.min.js';
	// hljs是由 Highlight.js 经兼容性修改后的文件，请勿直接升级。否则会造成uni-app-vue3-Android下有兼容问题
	import hljs from "../../static/highlight-uni.min.js";
	import parseHtml from '../../static/html-parser.js';

	const markdownIt = MarkdownIt({
		html: true,
		highlight: function(str, lang) {
			try {
				return '<pre class="hljs" style="padding: 5px 8px;margin: 5px 0;overflow: auto;"><code>' +
					hljs.highlightAuto(str).value +
					'</code></pre>';
			} catch (__) {}

			return '<pre class="hljs" style="padding: 5px 8px;margin: 5px 0;overflow: auto;"><code>' +
				markdownIt.utils.escapeHtml(str) + '</code></pre>';
		}
	})

	export default {
		name: "msg",
		data() {
			return {
				left: "-100px",
				top: "-100px"
			};
		},
		mounted() {
			// #ifdef H5
			// web端限制不选中文字时出现系统右键菜单
			let richTextBox = this.$refs['rich-text-box']
			if (richTextBox) {
				richTextBox.$el.addEventListener('contextmenu', (e) => {
					if (!document.getSelection().toString()) {
						// console.log(e);
						this.top = e.y + 'px'
						this.left = e.x + 'px'

						// console.log(e.x);
						// console.log(e.y);
						e.preventDefault()
					}
				})
			}

			document.addEventListener('click', () => {
				this.left = "-100px"
			})

			// #endif
		},
		props: {
			md: {
				type: String,
				default () {
					return ''
				}
			},
			showCursor: {
				type: [Boolean, Number],
				default () {
					return false
				}
			}
		},
		computed: {
			html() {
				if(this.md.split("```").length%2){
					return markdownIt.render(this.md + ' \n <span class="cursor">|</span>');
				}else{
					return markdownIt.render(this.md) + ' \n <span class="cursor">|</span>';
				}
			},
			nodes() {
				// return this.html
				// console.log('parseHtml(this.html)',parseHtml(this.html));
				return parseHtml(this.html)
			}
		},
		methods: {
			// #ifdef H5
			copy() {
				uni.setClipboardData({
					data: this.md,
					showToast: false,
				})
				this.left = "-100px"
			}
			// #endif
		}
	}
</script>

<style lang="scss">
	/* #ifndef VUE3 && APP-PLUS */
	@import "./uni-ai-msg.scss";
	/* #endif */
</style>
