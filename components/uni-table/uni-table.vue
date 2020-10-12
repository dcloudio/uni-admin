<template>
	<view class="uni-table" :class="{'table--border':border, 'table--stripe':stripe}">
		<slot></slot>
	</view>
</template>

<script>
	export default {
		name: 'uniTable',
		options: {
			virtualHost: true
		},
		props: {
			data: {
				type: Array,
				default () {
					return []
				}
			},
			// 是否有竖线
			border: {
				type: Boolean,
				default: false
			},
			// 是否显示斑马线
			stripe:{
				type:Boolean,
				default:false
			}
		},
		data() {
			return {

			};
		}
	}
</script>

<style lang="scss">
	.uni-table {
		width: 100%;
		display: table;
        box-sizing: border-box;
		/deep/ .uni-table-tr:nth-child(n+2) {
			&:hover {
				background-color: #f5f7fa;
			}
		}
	}

	.table--border {
		border-top: 1px #eee solid;
		border-left: 1px #eee solid;
	}
	
	.table--stripe {
		/deep/ .uni-table-tr:nth-child(2n+3) {
			background-color: #fafafa;
		}
		
	
	}
</style>
