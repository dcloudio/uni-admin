Î<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
			<view class="uni-group">
				<!-- <view class="uni-title">事件分析管理</view> -->
				<view class="uni-sub-title hide-on-phone">分析用户自定义事件
					<uni-link href="https://ask.dcloud.net.cn/article/36304" text="自定义事件说明>>"></uni-link>
				</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex">
				<uni-data-select collection="opendb-app-list" field="appid as value, name as text" orderby="text asc"
					:defItem="1" label="应用选择" v-model="query.appid" :clear="false" />
								<uni-data-select collection="uni-stat-app-versions" :where="versionQuery" field="_id as value, version as text" orderby="text asc" label="版本选择" v-model="query.version_id" />
        <view class="flex">
					<uni-stat-tabs label="日期选择" :current="currentDateTab" mode="date" @change="changeTimeRange" />
					<uni-datetime-picker type="daterange" :end="new Date().getTime()" v-model="query.create_time"
						returnType="timestamp" :clearIcon="false" class="uni-stat-datetime-picker"
						:class="{'uni-stat__actived': currentDateTab < 0 && !!query.create_time.length}"
						@change="useDatetimePicker" />
				</view>
			</view>
			<view class="uni-stat--x">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id"
					@change="changePlatform" />
				<uni-data-select v-if="query.platform_id && query.platform_id.indexOf('==') === -1"
					:localdata="channelData" label="渠道选择" v-model="query.channel_id"></uni-data-select>
			</view>
			<view class="uni-stat--x p-m">
				<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
					<uni-tr>
						<template v-for="(mapper, index) in fieldsMap">
							<uni-th v-if="mapper.title" :key="index" align="center">
								{{mapper.title}}
							</uni-th>
						</template>
					</uni-tr>
					<uni-tr v-for="(item ,i) in tableData" :key="i">
						<template v-for="(mapper, index) in fieldsMap">
							<!-- <uni-td v-if="mapper.title && index === 1" :key="mapper.title" class="uni-stat-edit--x">
								{{item[mapper.field] ? item[mapper.field] : '-'}}
								<uni-icons type="compose" color="#2979ff" size="25" class="uni-stat-edit--btn"
									@click="inputDialogToggle(item.event_key, item.event_name)" />
							</uni-td> -->
							<uni-td align="center">
								{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
							</uni-td>
						</template>
					</uni-tr>
				</uni-table>
				<view class="uni-pagination-box">
					<picker class="select-picker" mode="selector" :value="options.pageSizeIndex"
						:range="options.pageSizeRange" @change="changePageSize">
						<button type="default" size="mini" :plain="true">
							<text>{{pageSize}} 条/页</text>
							<uni-icons class="select-picker-icon" type="arrowdown" size="12" color="#999"></uni-icons>
						</button>
					</picker>
					<uni-pagination show-icon :page-size="pageSize" :current="options.pageCurrent"
						:total="options.total" @change="changePageCurrent" />
				</view>
			</view>
		</view>
		<uni-popup ref="inputDialog" type="dialog" :maskClick="true">
			<uni-popup-dialog ref="inputClose" mode="input" title="请编辑名称" v-model="updateValue" placeholder="请输入内容"
				@confirm="editName"></uni-popup-dialog>
		</uni-popup>

		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
	</view>
</template>

<script>
	import {
		mapfields,
		stringifyQuery,
		stringifyField,
		stringifyGroupField,
		getTimeOfSomeDayAgo,
		division,
		format,
		parseDateTime,
		debounce
	} from '@/js_sdk/uni-stat/util.js'
	import fieldsMap from './fieldsMap.js'
	export default {
		data() {
			return {
				fieldsMap,
				query: {
					appid: '',
					platform_id: '',
					channel_id: '',
					version_id: '',
					create_time: [],
				},
				options: {
					pageCurrent: 1, // 当前页
					total: 0, // 数据总量
					pageSizeIndex: 0, // 与 pageSizeRange 一起计算得出 pageSize
					pageSizeRange: [10, 20, 50, 100],
				},
				loading: false,
				currentDateTab: 1,
				tableData: [],
				panelData: [],
				queryId: '',
				updateValue: '',
				channelData: []
			}
		},
		computed: {
			pageSize() {
				const {
					pageSizeRange,
					pageSizeIndex
				} = this.options
				return pageSizeRange[pageSizeIndex]
			},
			channelQuery() {
				const platform_id = this.query.platform_id
				return stringifyQuery({
					platform_id
				})
			},
      versionQuery() {
      				const { appid, platform_id } = this.query
      				const query = stringifyQuery({
      					appid,
      					platform_id
      				})
      				return query
      			}
		},
		created() {
			this.debounceGet = debounce(() => this.getAllData())
			this.getChannelData()
		},
		watch: {
			query: {
				deep: true,
				handler(val) {
					this.options.pageCurrent = 1 // 重置分页
					this.debounceGet()
				}
			}
		},
		methods: {
			useDatetimePicker() {
				this.currentDateTab = -1
			},
			changeAppid(id) {
				this.getChannelData(id, false)
			},
			changePlatform(id) {
				this.getChannelData(null, id)
        this.query.version_id = 0
			},
			changeTimeRange(id, index) {
				this.currentDateTab = index
				const start = getTimeOfSomeDayAgo(id),
					end = getTimeOfSomeDayAgo(0) - 1
				this.query.create_time = [start, end]
			},
			changePageCurrent(e) {
				this.options.pageCurrent = e.current
				this.getTableData()
			},

			changePageSize(e) {
				const {
					value
				} = e.detail
				this.options.pageCurrent = 1 // 重置分页
				this.options.pageSizeIndex = value
				this.getTableData()
			},

			getAllData(query) {
				this.getTableData(query)
			},

			getTableData(query = stringifyQuery(this.query)) {
				const {
					pageCurrent
				} = this.options
				this.loading = true
				const db = uniCloud.database()
				// const filterAppid = stringifyQuery({
				// 	appid: this.query.appid
				// })
				// const mainTableTemp = db.collection('uni-stat-events').where(filterAppid).getTemp()
				// const subTableTemp = db.collection('uni-stat-event-result')
				// 	.where(query)
				// 	.getTemp()

				db.collection('uni-stat-event-logs', 'uni-stat-app-platforms')
					.where(query)
					.orderBy('create_time', 'desc')
					.skip((pageCurrent - 1) * this.pageSize)
					.limit(this.pageSize)
					.get({
						getCount: true
					})
					.then(res => {
						const {
							count,
							data
						} = res.result
						this.tableData = []
						this.options.total = count
						for (const item of data) {
							item.create_time = parseDateTime(item.create_time, 'dateTime')
							item.platform = item.platform && item.platform[0].name
							mapfields(fieldsMap, item, item)
							this.tableData.push(item)
						}
					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			getChannelData(appid, platform_id) {
				this.query.channel_id = ''
				const db = uniCloud.database()
				const condition = {}
				//对应应用
				appid = appid ? appid : this.query.appid
				if (appid) {
					condition.appid = appid
				}
				//对应平台
				platform_id = platform_id ? platform_id : this.query.platform_id
				if (platform_id) {
					condition.platform_id = platform_id
				}

				let platformTemp = db.collection('uni-stat-app-platforms')
					.field('_id, name')
					.getTemp()

				let channelTemp = db.collection('uni-stat-app-channels')
					.where(condition)
					.field('_id, channel_name, create_time, platform_id')
					.getTemp()

				db.collection(channelTemp, platformTemp)
					.orderBy('platform_id', 'asc')
					.get()
					.then(res => {
						let data = res.result.data
						let channels = []
						if (data.length > 0) {
							let channelName
							for (let i in data) {
								channelName = data[i].channel_name ? data[i].channel_name : '默认'
								if (data[i].platform_id.length > 0) {
									channelName = data[i].platform_id[0].name + '-' + channelName
								}
								channels.push({
									value: data[i]._id,
									text: channelName
								})
							}
						}
						this.channelData = channels
					})
					.catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {})

			},

			// inputDialogToggle(queryId, updateValue) {
			// 	this.queryId = queryId
			// 	this.updateValue = updateValue
			// 	this.$refs.inputDialog.open()
			// },

			// editName(value) {
			// 	// 使用 clientDB 提交数据
			// 	const db = uniCloud.database()
			// 	db.collection('uni-stat-events')
			// 		.where({
			// 			event_key: this.queryId
			// 		})
			// 		.update({
			// 			event_name: value
			// 		})
			// 		.then((res) => {
			// 			uni.showToast({
			// 				title: '修改成功'
			// 			})
			// 			this.getTableData()
			// 		}).catch((err) => {
			// 			uni.showModal({
			// 				content: err.message || '请求服务失败',
			// 				showCancel: false
			// 			})
			// 		}).finally(() => {
			// 			uni.hideLoading()
			// 		})
			// }

		}

	}
</script>

<style>
	.uni-stat-edit--x {
		display: flex;
		justify-content: space-between;
	}

	.uni-stat-edit--btn {
		cursor: pointer;
	}
</style>
