<template>
  <view class="uni-stat--tab">
    <view v-for="(item, index) in tabs" :key="index" @click="change(index)"
    	class="uni-stat--tab-item"
    	:class="[index === tabIndex ? `uni-stat--tab-item-${type}-active` : '' , `uni-stat--tab-item-${type}`]">
    	{{item}}
    </view>
  </view>
</template>

<script>
  export default {
    name:"uni-stat-tabs",
    data() {
      return {
        tabIndex: 0
      };
    },
	props:{
		type: {
			type: String,
			default: 'line'
		},
		tabs: {
			type: Array,
			default: () => {
				return []
			}
		}
	},
	methods: {
		change(index) {
			console.log(',,,,,,,,,', index);
			this.tabIndex = index
		}
	}
  }
</script>

<style lang="scss">
.uni-stat {

		&--tab {
			display: flex;
			flex-wrap: wrap;

			&-item {
				font-size: 14px;
				color: #666;
				text-align: center;
				cursor: pointer;
				box-sizing: border-box;

				&-line {
					margin-right: 30px;
					padding: 2px 0;
					border-bottom: 1px solid transparent;

					&-active {
						color: $uni-color-primary;
						border-bottom: 1px solid $uni-color-primary;
					}
				}

				&-boldLine {
					margin-right: 30px;
					padding: 2px 0;
					border-bottom: 2px solid transparent;

					&-active {
						color: $uni-color-primary;
						box-sizing: border-box;
						border-bottom: 2px solid $uni-color-primary;
					}
				}

				&-box {
					padding: 5px 15px;
					border: 1px solid #eee;
					margin: 0;

					&:not(:last-child) {
						border-right-color: transparent;
					}


					&-active {
						box-sizing: border-box;
						border: 1px solid $uni-color-primary !important;
					}
				}
			}

		}
	}
</style>
