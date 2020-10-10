<template>
	<view class="uni-table-th" :class="{'table--border':border}" :style="{width:width + 'px','text-align':align}">
		<slot></slot>
	</view>
</template>

<script>
	export default {
		name: 'uniTableTh',
		options: {
			virtualHost: true
		},
		props: {
			width: {
				type: [String, Number],
				default: ''
			},
			align: {
				type: String,
				default: 'left'
			}
		},
		data() {
			return {
				border:false
			};
		},
		created() {
			this.root = this.getTable()
			this.border = this.root.border
			console.log(this.border);
		},
		methods:{
			/**
			 * 获取父元素实例
			 */
			getTable() {
				let parent = this.$parent;
				let parentName = parent.$options.name;
				while (parentName !== 'uniTable') {
					parent = parent.$parent;
					if (!parent) return false;
					parentName = parent.$options.name;
				}
				return parent;
			},
		}
	}
</script>

<style lang="scss">
	.uni-table-th {
		padding: 12px 10px;
		display: table-cell;
		// text-align: center;
		color: #333;
		font-weight: 500;
		border-bottom: 1px #eee solid;
		font-size: 14px;
	}
	.table--border {
		border-right: 1px #eee solid;
	}
</style>
