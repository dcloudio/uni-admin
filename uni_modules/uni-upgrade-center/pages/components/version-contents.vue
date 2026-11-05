<template>
	<view class="version-contents">
		<!-- 同宽文本直接撑开高度，包含初始内容和末尾空行。 -->
		<view class="version-contents__measure" aria-hidden="true">{{ modelValue + '\u200b' }}</view>
		<textarea class="version-contents__input" :value="modelValue" :disabled="disabled" :maxlength="-1"
			placeholder="更新内容 (可换行)" @input="$emit('update:modelValue', $event.detail.value)" />
	</view>
</template>

<script setup>
	defineProps({
		modelValue: { type: String, default: '' },
		disabled: { type: Boolean, default: false }
	})
	defineEmits(['update:modelValue'])
</script>

<style scoped>
	.version-contents {
		position: relative;
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
		border: 1px solid #e5e5e5;
		border-radius: 5px;
		font-size: 14px;
		line-height: 20px;
		color: #666;
	}

	.version-contents__measure {
		min-height: 60px;
		padding: 10px;
		visibility: hidden;
		white-space: pre-wrap;
		word-break: break-all;
		overflow-wrap: break-word;
	}

	.version-contents__input {
		position: absolute;
		top: 10px;
		left: 10px;
		width: calc(100% - 20px);
		height: calc(100% - 20px);
		padding: 0;
		box-sizing: content-box;
		font-size: inherit;
		line-height: inherit;
		white-space: pre-wrap;
		word-break: break-all;
		overflow-wrap: break-word;
	}
</style>
