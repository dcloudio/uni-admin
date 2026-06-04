<template>
	<view 
		class="media-action-btn" 
		:class="[typeClass, sizeClass, { 'is-disabled': disabled }]" 
		@click.stop="onClick"
	>
		<uni-icons v-if="icon" :type="icon" :size="iconSize" :color="iconColor" class="btn-icon"></uni-icons>
		<view class="btn-text">
			<slot></slot>
		</view>
	</view>
</template>

<script>
export default {
	name: "media-button",
	props: {
		type: {
			type: String,
			default: "default" // primary | warn | default
		},
		size: {
			type: String,
			default: "small" // mini | small | normal
		},
		disabled: {
			type: Boolean,
			default: false
		},
		icon: {
			type: String,
			default: ""
		}
	},
	computed: {
		typeClass() {
			return `btn-type-${this.type}`;
		},
		sizeClass() {
			return `btn-size-${this.size}`;
		},
		iconSize() {
			return this.size === 'mini' ? 14 : 16;
		},
		iconColor() {
			if (this.disabled) return '#bfbfbf';
			if (this.type === 'primary' || this.type === 'warn') return '#fff';
			return '#595959';
		}
	},
	methods: {
		onClick(e) {
			if (this.disabled) return;
			if (e && typeof e.stopPropagation === 'function') {
				e.stopPropagation();
			}
			this.$emit("click", e);
		}
	}
};
</script>

<style lang="scss" scoped>
.media-action-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: 6px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	user-select: none;
	box-sizing: border-box;

	&.is-disabled {
		cursor: not-allowed;
		opacity: 0.6;
		filter: grayscale(20%);
	}

	.btn-icon {
		margin-right: 4px;
	}
	
	.btn-text {
		display: flex;
		align-items: center;
		justify-content: center;
	}
}

/* Sizes */
.btn-size-mini {
	padding: 0 12px;
	height: 28px;
	font-size: 13px;
}
.btn-size-small {
	padding: 0 16px;
	height: 32px;
	font-size: 13px;
}
.btn-size-normal {
	padding: 0 20px;
	height: 36px;
	font-size: 14px;
}

/* Types */
.btn-type-default {
	background-color: #fff;
	color: #595959;
	border: 1px solid #d9d9d9;
	
	&:hover:not(.is-disabled) {
		color: #1f1f1f;
		border-color: #bfbfbf;
		background-color: #fafafa;
	}
	
	&:active:not(.is-disabled) {
		background-color: #f0f0f0;
	}
}

.btn-type-primary {
	background-color: #1677ff;
	color: #fff;
	border: 1px solid #1677ff;
	box-shadow: 0 2px 0 rgba(22, 119, 255, 0.1);
	
	&:hover:not(.is-disabled) {
		background-color: #4096ff;
		border-color: #4096ff;
	}
	
	&:active:not(.is-disabled) {
		background-color: #0958d9;
		border-color: #0958d9;
	}
}

.btn-type-warn {
	background-color: #ff4d4f;
	color: #fff;
	border: 1px solid #ff4d4f;
	box-shadow: 0 2px 0 rgba(255, 77, 79, 0.1);
	
	&:hover:not(.is-disabled) {
		background-color: #ff7875;
		border-color: #ff7875;
	}
	
	&:active:not(.is-disabled) {
		background-color: #d9363e;
		border-color: #d9363e;
	}
}
</style>
