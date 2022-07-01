<template>
	<view class="uni-container">
		<h2 class="text-separated" style="padding-bottom: 40rpx;">统一发布页管理</h2>

		<h3 class="text-separated" style="padding: 0 0 20rpx 0;">一、统一发布页功能介绍</h3>
		<view class="tip">
			<view class="flex-center-r">
				<h3 class="text-separated">App/小程序/网站做好后，如何告知你的用户？</h3>
				<text class="text-separated"
					style="font-size: 15px;">你需要开发App的下载页、小程序二维码的展示页面，这些内容最好汇总在统一入口，也就是发行平台。</text>
			</view>
		</view>

		<view style="margin-top: 20rpx;">
			<text class="text-separated" style="font-size: 16px;">自己从头开发这么一个发行平台的话：</text>

			<ul style="font-size: 15px;">
				<li class="text-separated">响应式布局，兼容PC/Mobile各种尺寸</li>
				<li class="text-separated">微信/微博浏览器判断不同逻辑，右上角提示通过浏览器打开</li>
				<li class="text-separated">PC上制作二维码，方便用户直接扫码下载</li>
				<li class="text-separated">如果小程序有多个版本，微信、支付宝、百度、QQ、快应用，那搞起来。。。</li>
			</ul>
		</view>

		<h3 class="text-separated" style="padding: 40rpx 0 20rpx 0;">二、生成下载发布页</h3>
		<view class="flex" style="margin-top: 20rpx;">
			<text style="font-size: 14px;">
				uni-portal 可根据当前应用管理所填写信息一键生成发布：
			</text>
			<button class="custom-button" size="mini" type="primary" @click="publish" style="margin: 0;">下载发布页</button>
		</view>

		<h3 class="text-separated" style="padding: 40rpx 0 20rpx 0;">三、上传部署发布页</h3>

		<view class="tip" style="border-color:cadetblue;">
			<view class="flex-center-r">
				<text class="text-separated" style="font-size: 15px;">统一发布页面是<view class="strong">静态HTML</view>
					页面，可以直接在本地浏览器中打开查看。您可以部署在任何服务器中以供访问。</text>
			</view>
		</view>

		<view style="margin-top: 20rpx;">
			<text class="text-separated" style="font-size: 16px;">
				推荐使用
				<a href="https://uniapp.dcloud.io/uniCloud/hosting" target="_blank" class="a-label">前端网页托管</a>
			</text>

			<ul style="font-size: 15px;">
				<li class="text-separated">免费的 CDN加速：不经过web server，页面和资源直接上cdn，就近访问，速度更快。</li>
				<li class="text-separated">省心：无需再购买虚拟机、安装操作系统、配置web服务器、处理负载均衡、处理大并发、处理DDoS攻击......您什么都不用管，只需上传您写的页面文件。
				</li>
			</ul>
		</view>

		<view style="margin-top: 20rpx;">
			<text class="text-separated" style="font-size: 16px;color: coral;">
				注意：
			</text>

			<ul style="font-size: 15px;">
				<li class="text-separated">
					静态页面上传到 <view class="strong">前端网页托管</view> 使用默认域名访问时，会有一定的限制。但是这些限制在
					<a href="https://uniapp.dcloud.io/uniCloud/hosting?id=domain" target="_blank"
						class="a-label">配置域名</a>
					后都就不存在了。
				</li>
				<li class="text-separated">如果遇到静态页面打开图片或者二维码不显示的情况，请在 <view class="strong">uniCloud Web 控制台</view>
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
