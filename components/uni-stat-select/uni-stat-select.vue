<template>
	<view class="uni-stat__select">
		<span v-if="label" class="label-text">{{label + '：'}}</span>
		<view :class="{'uni-stat__actived': current}">
			<view class="uni-combox">
				<view class="uni-combox__input-box" @click="toggleSelector">
					<view v-if="current" class="uni-combox__input-text">{{current}}</view>
					<view v-else class="uni-combox__input-text uni-combox__input-placeholder">{{placeholder}}</view>
					<uni-icons :type="showSelector? 'top' : 'bottom'" size="14" color="#999" />
				</view>
				<view class="uni-select--mask" v-if="showSelector" @click="toggleSelector" />
				<view class="uni-combox__selector" v-if="showSelector">
					<view class="uni-popper__arrow"></view>
					<scroll-view scroll-y="true" class="uni-combox__selector-scroll">
						<view class="uni-combox__selector-empty" v-if="renderData.length === 0">
							<text>{{emptyTips}}</text>
						</view>
						<view v-else class="uni-combox__selector-item" v-for="(item,index) in renderData" :key="index"
							@click="change(item)">
							<text>{{formatItemName(item)}}</text>
						</view>
					</scroll-view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "uni-stat-select",
		data() {
			return {
				showSelector: false,
				current: '',
				renderData: [],
				apps: [],
				channels: []
			};
		},
		props: {
			value: {
				type: String,
				default: ''
			},
			modelValue: {
				type: String,
				default: ''
			},
			mode: {
				type: String,
				default: ''
			},
			query: {
				type: [Object, String],
				default () {
					return {}
				}
			},
			data: {
				type: Array,
				default () {
					return []
				}
			},
			label: {
				type: String,
				default: 'label'
			},
			placeholder: {
				type: String,
				default: '请选择'
			},
			emptyTips: {
				type: String,
				default: '无选项'
			}
		},
		mounted() {
			this.init(this.mode)
		},
		watch: {
			mode: {
				immediate: true,
				handler(val) {
					this.init(val)
				}
			},
			query: {
				immediate: true,
				handler(val) {
					this.init(this.mode)
				}
			},
			renderData: {
				immediate: true,
				handler(val) {
					if (val.length) {
						const defOption = val.filter(item => item.value === this.value)
						const text = defOption.length ? defOption[0].text : ''
						this.current = text ? (this.mode === 'app' ? `${text} (${this.value})` : text) : ''
					}
				}
			}
		},
		methods: {
			init(mode) {
				if (mode === 'app') {
					this.getApps()
				} else if (mode === 'channel') {
					this.getChannels()
				} else if (mode === 'version') {
					this.getVersions()
				} else {
					this.renderData = this.data
				}
			},
			change(item) {
				this.showSelector = false
				console.log(1111, item)
				this.current = this.mode === 'app' ? `${item.text} (${item.value})` : item.text
				this.$emit('change', item.value)
				this.$emit('input', item.value)
				this.$emit('update:modelValue', item.value)
			},
			getApps() {
				const db = uniCloud.database()
				const apps = db.collection('opendb-app-list').field('appid, name').get().then(res => {
					this.apps = res.result.data
					this.renderData = []
					res.result.data.forEach(item => {
						this.renderData.push({
							value: item.appid,
							text: item.name
						})
					})
					// this.renderData.unshift('全部')
				})
			},
			getChannels() {
				const db = uniCloud.database()
				const channels = db.collection('opendb-app-channels').where(this.query).get().then(res => {
					this.channels = res.result.data
					this.renderData = []
					res.result.data.forEach(item => {
						this.renderData.push({
							value: item._id,
							text: item.channel_name,
							channel_code: item.channel_code
						})
					})
				})
			},
			getVersions() {
				const db = uniCloud.database()
				const versions = db.collection('opendb-stat-app-versions').where(this.query).get().then(res => {
					this.versions = res.result.data
					this.renderData = []
					res.result.data.forEach(item => {
						this.renderData.push({
							value: item._id,
							text: item.version
						})
					})
				})
			},
			toggleSelector() {
				this.showSelector = !this.showSelector
			},
			formatItemName(item) {
				let { text, value, channel_code} = item
				channel_code = channel_code ? `(${channel_code})` : ''
				return this.mode === 'app'
				 ? `${text}(${value})`
				 : (
					text
					? text
					: `未命名${channel_code}`
				 )
			}
		}
	}
</script>

<style>
	.uni-stat__select {
		display: flex;
		align-items: center;
		padding: 15px;
		cursor: pointer;
	}

	.uni-stat__actived {
		outline: 1px solid #2979ff;
	}

	.label-text {
		font-size: 14px;
		color: #666;
		margin: auto 0;
		margin-right: 5px;
	}

	.uni-combox {
		font-size: 14px;
		border: 1px solid #DCDFE6;
		box-sizing: border-box;
		border-radius: 4px;
		padding: 0 5px;
		position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		user-select: none;
		/* #endif */
		flex-direction: row;
		align-items: center;
		border-bottom: solid 1px #DDDDDD;
	}

	.uni-combox__label {
		font-size: 16px;
		line-height: 22px;
		padding-right: 10px;
		color: #999999;
	}

	.uni-combox__input-box {
		min-height: 34px;
		position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex: 1;
		flex-direction: row;
		align-items: center;
	}

	.uni-combox__input {
		flex: 1;
		font-size: 14px;
		height: 22px;
		line-height: 22px;
	}

	.uni-combox__input-plac {
		font-size: 14px;
		color: #999;
	}

	.uni-combox__selector {
		/* #ifndef APP-NVUE */
		box-sizing: border-box;
		/* #endif */
		position: absolute;
		top: calc(100% + 12px);
		left: 0;
		width: 100%;
		background-color: #FFFFFF;
		border: 1px solid #EBEEF5;
		border-radius: 6px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
		z-index: 2;
		padding: 4px 0;
	}

	.uni-combox__selector-scroll {
		/* #ifndef APP-NVUE */
		max-height: 200px;
		box-sizing: border-box;
		/* #endif */
	}

	.uni-combox__selector-empty,
	.uni-combox__selector-item {
		/* #ifndef APP-NVUE */
		display: flex;
		cursor: pointer;
		/* #endif */
		line-height: 36px;
		font-size: 14px;
		text-align: center;
		/* border-bottom: solid 1px #DDDDDD; */
		padding: 0px 10px;
	}

	.uni-combox__selector-item:hover {
		background-color: #f9f9f9;
	}

	.uni-combox__selector-empty:last-child,
	.uni-combox__selector-item:last-child {
		/* #ifndef APP-NVUE */
		border-bottom: none;
		/* #endif */
	}

	/* picker 弹出层通用的指示小三角 */
	.uni-popper__arrow,
	.uni-popper__arrow::after {
		position: absolute;
		display: block;
		width: 0;
		height: 0;
		border-color: transparent;
		border-style: solid;
		border-width: 6px;
	}

	.uni-popper__arrow {
		filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.03));
		top: -6px;
		left: 10%;
		margin-right: 3px;
		border-top-width: 0;
		border-bottom-color: #EBEEF5;
	}

	.uni-popper__arrow::after {
		content: " ";
		top: 1px;
		margin-left: -6px;
		border-top-width: 0;
		border-bottom-color: #fff;
	}

	.uni-combox__input-text {
		width: 280px;
		color: #333;
		white-space: nowrap;
		text-overflow: ellipsis;
		-o-text-overflow: ellipsis;
		overflow: hidden;
	}

	.uni-combox__input-placeholder {
		color: #666;
	}

	.uni-select--mask {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
	}
</style>
