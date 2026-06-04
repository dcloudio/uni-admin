<template>
	<view class="media-input-wrap" :class="{ 'is-focus': isFocused }">
		<input
			class="media-input-inner"
			:type="type"
			:value="innerValue"
			:placeholder="placeholder"
			placeholder-class="media-input-placeholder"
			@input="onInput"
			@focus="onFocus"
			@blur="onBlur"
		/>
		<view class="clear-icon" v-if="innerValue && showClear" @click="onClear">
			<uni-icons type="clear" color="#bfbfbf" size="16"></uni-icons>
		</view>
	</view>
</template>

<script>
export default {
	name: "media-input",
	props: {
		value: {
			type: [String, Number],
			default: ""
		},
		modelValue: {
			type: [String, Number],
			default: ""
		},
		type: {
			type: String,
			default: "text"
		},
		placeholder: {
			type: String,
			default: ""
		},
		showClear: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			isFocused: false
		};
	},
	computed: {
		innerValue() {
			// 兼容 Vue 2 的 value 和 Vue 3 的 modelValue
			return this.modelValue !== "" ? this.modelValue : this.value;
		}
	},
	methods: {
		onInput(e) {
			const val = e.detail.value;
			this.$emit("input", val);
			this.$emit("update:modelValue", val);
		},
		onFocus(e) {
			this.isFocused = true;
			this.$emit("focus", e);
		},
		onBlur(e) {
			this.isFocused = false;
			this.$emit("blur", e);
		},
		onClear() {
			this.$emit("input", "");
			this.$emit("update:modelValue", "");
			this.$emit("clear");
			this.$emit("blur");
		}
	}
};
</script>

<style lang="scss" scoped>
.media-input-wrap {
	display: flex;
	align-items: center;
	width: 100%;
	height: 36px;
	box-sizing: border-box;
	border: 1px solid #d9d9d9;
	border-radius: 6px;
	background-color: #fff;
	transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
	position: relative;

	&.is-focus {
		border-color: #1677ff;
		box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
	}

	&:hover:not(.is-focus) {
		border-color: #40a9ff;
	}
}

.media-input-inner {
	flex: 1;
	height: 100%;
	padding: 0 12px;
	font-size: 13px;
	color: #1f1f1f;
	background: transparent;
	border: none;
	outline: none;
}

.media-input-placeholder {
	color: #bfbfbf;
	font-size: 13px;
}

.clear-icon {
	padding: 0 8px;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	opacity: 0.8;
	transition: opacity 0.2s;

	&:hover {
		opacity: 1;
	}
}
</style>