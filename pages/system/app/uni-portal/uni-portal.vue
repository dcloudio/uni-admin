<template>
	<view class="uni-container">
		<!-- <h2 class="text-separated" style="padding-bottom: 40rpx;">统一发布页管理</h2> -->

		<h3 class="text-separated" style="padding: 0 0 20rpx 0;">步骤1：了解“统一发布页”</h3>
		<view class="tip">
			<view class="flex-center-r">
				<h3 class="text-separated">App/小程序/网站做好后，如何告知你的用户？</h3>
				<!-- 		<text class="text-separated"
					style="font-size: 15px;">你需要开发App的下载页、小程序二维码的展示页面，这些内容最好汇总在统一入口，也就是发行平台。</text> -->
			</view>
		</view>

		<view style="margin-top: 20rpx;">
			<view class="" style="font-size: 16px;">
				<text class="text-separated">
					你需要为自己的业务制作一个名片，名片上统一展现：App 的下载地址、小程序二维码、H5访问链接等，也就是
				</text>
				<text class="strong">“统一发布页” </text>。
			</view>

			<view class="">
				<text class="text-separated" style="font-size: 16px;">
					而你自己从头开发这么一个“统一发布页”，工作量是巨大的，因为你需要兼容pc/mobile，你需要自动识别浏览器环境等。
				</text>
			</view>

			<view class="">
				<text class="strong">uni-portal </text>
				<text class="text-separated">是 uni-app 提供的一套开箱即用的“统一发布页”，它可以帮你实现：</text>
			</view>

			<ul style="font-size: 15px;">
				<li class="text-separated">响应式布局，兼容PC/Mobile各种尺寸</li>
				<li class="text-separated">微信/微博浏览器判断不同逻辑，在不同平台给出正确的App下载引导，比如：右上角提示通过浏览器打开。</li>
				<li class="text-separated">PC上显示二维码，方便用户直接扫码下载</li>
				<li class="text-separated">支持多个平台，包括：微信、支付宝、百度、QQ、快应用等</li>
			</ul>

			<view class="">
				<!-- #ifdef H5 -->
				<text class="text-separated" style="font-size: 16px;">
					uni-app 官方示例的发布页就是基于uni-portal制作的，
					<a class="a-label" href="https://hellouniapp.dcloud.net.cn/portal" target="_blank">快速体验</a>
				</text>
				<!-- #endif -->
			</view>

		</view>

		<h3 class="text-separated" style="padding: 40rpx 0 20rpx 0;">步骤2：获取“统一发布页”</h3>
		<view class="flex" style="margin-top: 20rpx;font-size: 14px;">
			<text class="strong">uni-portal </text>
			<text> 可根据「应用管理」中所填写的应用信息，一键生成发布页：
			</text>
			<button class="custom-button" size="mini" type="primary" @click="publish"
				style="margin: 0;">生成并下载发布页</button>
		</view>

		<h3 class="text-separated" style="padding: 40rpx 0 20rpx 0;">步骤3：上传“统一发布页”</h3>

		<view style="margin-top: 20rpx;">
			<view class="flex-center-r">
				<text class="text-separated" style="font-size: 14px;">
					步骤2下载的“统一发布页”，是静态HTML页面，你可以直接在本地浏览器中打开访问。
				</text>
			</view>
			<view class="flex-center-r">
				<text class="text-separated" style="font-size: 14px;">
					接下来，你可以将该静态HTML文件上传部署到任何服务器，让你的用户能够访问到该页面并顺利获取App/小程序。
				</text>
			</view>
			<view class="flex-center-r">
				<text class="text-separated" style="font-size: 14px;">
					但我们更推荐你将该静态HTML上传到<a href="https://uniapp.dcloud.io/uniCloud/hosting" target="_blank"
						class="a-label">前端网页托管</a>中，因为前端网页托管提供了如下优势服务：
				</text>
			</view>

			<ul style="font-size: 15px;">
				<li class="text-separated">更快速：不经过web server，页面和资源直接上cdn，网络就近访问，速度更快。</li>
				<li class="text-separated">更安全：不存在传统服务器各种操作系统、web server的漏洞，不用天天想着打补丁。不怕DDoS攻击，永远打不垮的服务。</li>
				<li class="text-separated">更省心：无需再购买虚拟机、安装操作系统、配置web服务器、处理负载均衡、处理大并发、处理DDoS攻击......您什么都不用管，只需上传您写的页面文件
				</li>
				<li class="text-separated">更便宜：uniCloud由DCloud联合阿里云和腾讯云推出，享受云厂商政策优惠。
				</li>
			</ul>
		</view>

		<view style="margin-top: 20rpx;">
			<text class="text-separated" style="font-size: 16px;color: coral;">
				注意：
			</text>

			<ul style="font-size: 15px;">
				<li class="text-separated">
					前端网页托管使用默认域名访问时，会有一定的访问频次限制。但是这些限制在
					<a href="https://uniapp.dcloud.io/uniCloud/hosting?id=domain" target="_blank"
						class="a-label">配置域名</a>
					后可解除。
				</li>
				<li class="text-separated">
					如果遇到静态页面打开图片或者二维码不显示的情况，请在
					<a href="https://unicloud.dcloud.net.cn/login" class="a-label">uniCloud Web 控制台</a>
					配置跨域设置。
				</li>
			</ul>
		</view>
	</view>
</template>

<script>
	var download = function(content, filename) {
		var eleLink = document.createElement('a');
		eleLink.download = filename;
		eleLink.style.display = 'none';
		var blob = new Blob([content]);
		eleLink.href = URL.createObjectURL(blob);
		document.body.appendChild(eleLink);
		eleLink.click();
		document.body.removeChild(eleLink);
	};

	export default {
		data() {
			return {
				id: ''
			}
		},
		onLoad({
			id
		}) {
			this.id = id
		},
		methods: {
			publish() {
				if (!this.id) {
					uni.showModal({
						content: '页面出错，请返回重进',
						showCancel: false,
						success(res) {
							uni.redirectTo({
								url: '/pages/system/app/list'
							})
						}
					})
					return
				}
				this.$request('createPublishHtml', {
					id: this.id
				}, {
					functionName: 'uni-portal',
					showModal: false
				}).then(res => {
					// #ifdef H5
					if ('download' in document.createElement('a')) {
						download(res.body, 'index.html');
					} else {
						uni.showToast({
							icon: 'error',
							title: '浏览器不支持',
							duration: 800
						})
					}
					// #endif
				}).catch((res) => {
					uni.showModal({
						content: res.errMsg,
						showCancel: false
					})
				})
			}
		}
	}
</script>

<style lang="scss">
	h3 {
		font-size: 16px;
	}

	.strong {
		padding: 10rpx;
		display: inline-block;
		color: #c7254e;
	}

	.a-label {
		text-decoration: none;
		color: #0366d6;
		font-weight: bold;
		padding: 10rpx;
	}

	.text-separated {
		line-height: 2em;
		color: #2c3e50;
	}

	.tip {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		background-color: #f3f5f7;
		color: #2c3e50;
		padding: 10px;
		font-size: 32rpx;

		border: {
			color: #409EFF;
			left-width: 8px;
			left-style: solid;
		}

		text {
			margin-right: 15px;
		}

		.custom-button {
			margin-left: 0px;
		}
	}
</style>
