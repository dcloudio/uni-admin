<template>
	<view>
		<toolbarTool type="button" @change="$refs.popup.open()" :active="active" :disabled="disabled" :tooltip="{content: '添加链接'}">
			<uni-icons custom-prefix="editor-icon" type="icon-link" size="24px"></uni-icons>
		</toolbarTool>
		<uni-popup ref="popup" type="center">
			<view class="popup-body">
				<uni-forms label-width="90px">
					<uni-forms-item label="链接地址" name="link">
						<uni-easyinput v-model="link" />
					</uni-forms-item>
				</uni-forms>
				<view class="popup-body-btn-group">
					<button class="btn" size="mini" @click="$refs.popup.close()">取消</button>
					<button class="btn" size="mini" type="primary" @click="change">确定</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import ToolbarTool from "./base.vue";

export default {
	name: "tool-link",
	emits: ['change'],
	props: {
		active: [Boolean, String],
    disabled: Boolean
	},
	data () {
		return {
			link: ''
		}
	},
	watch: {
		active (newValue) {
			this.link = newValue
		}
	},
	components: {
		ToolbarTool
	},
	methods: {
		change () {
			this.$emit('change', {
				type: 'link',
				value: this.link
			})
			this.$refs.popup.close()
		}
	}
}
</script>

<style scoped lang="scss">
@import '@/uni_modules/uni-cms/common/style/editor-icon.css';
.popup-body {
	padding: 20px;
	border-radius: 5px;
	background: #fff;
	width: 350px;

	&-btn-group {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		.btn {
			margin: 0 5px;
			&:last-child {
				margin-right: 0;
			}
		}
	 }
}
</style>
