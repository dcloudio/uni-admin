<template>
	<view class="btn-wrap">
		<view class="free-media-button" @click="showMenu = !showMenu">
			<image-library-logos :provider="provider" />
			<text class="ri-arrow-down-s-line dropdown-icon"></text>
		</view>
		<view class="list-panel" v-if="showMenu">
			<view
				class="list-panel__item"
				v-for="provider in providers"
				:key="provider.provider"
				@click="onChange(provider.provider)"
			>
				<image-library-logos :provider="provider.provider" />
				<text>{{ provider.name }}</text>
			</view>
			<view class="mask" @click="showMenu = false"></view>
		</view>
	</view>
</template>

<script>
import ImageLibraryLogos from '../image-library-logos'

export default {
	name: "free-media-button",
	emits: ['onChange', 'onLoad'],
	components: {
		ImageLibraryLogos
	},
	props: {
		provider: {
			type: String,
			default: () => 'internal'
		}
	},
	data () {
		return {
			providers: [{
				provider: 'internal',
				name: '媒体库'
			}],
			showMenu: false
		}
	},
	mounted () {
		this.loadFreeImageLibraryProviders()
	},
	methods: {
		onChange (provider) {
			this.showMenu = false

			this.$emit('onChange', provider)
		},
		async loadFreeImageLibraryProviders () {
			const uniMediaLibraryCo = uniCloud.importObject('uni-media-library-co', {
				customUI: true
			})

			const result = await uniMediaLibraryCo.getImageLibraryProviders()

			this.providers = [...this.providers, ...result.data]

			this.$emit('onLoad', this.providers)
		}
	}
}
</script>

<style scoped lang="scss">
@import "../../font/remixicon.css";

.btn-wrap {
	position: relative;
}
.free-media-button {
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	height: 40px;
	padding: 0 10px;
	border-radius: 4px;
	background-color: #f5f5f5;
	transition: background-color .3s;
	&:hover {
		background-color: #ebebeb;
	}
	.dropdown-icon {
		font-size: 20px;
		line-height: 1;
		margin-right: 0;
		color: currentColor;
	}
}
.list-panel {
	width: 200px;
	position: absolute;
	top: 100%;
	left: 0;
	background: #fff;
	border: #e4e4e7 solid 1px;
	border-radius: 4px;
	z-index: 9;
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, .1), 0 2px 4px -2px rgba(0, 0, 0, .1);
	padding: 5px;

	&__title {
		font-size: 14px;
		font-weight: bold;
		padding: 10px;
		border-bottom: #f4f4f5 solid 1px;
	}
	&__item {
		padding: 8px;
		font-size: 13px;
		display: flex;
		align-items: center;
		gap: 5px;
		cursor: pointer;
		border-radius: 4px;
		&:hover {
			background: #f4f4f5;
		}
	}
}
.mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: -1;
}
</style>
