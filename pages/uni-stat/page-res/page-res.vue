<template>
	<view class="fix-top-window">
		<view class="uni-header">				<uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
			<view class="uni-group">
				<!-- <view class="uni-title">受访页</view> -->
				<view class="uni-sub-title hide-on-phone">受访页数据分析</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex">
				<uni-data-select collection= "opendb-app-list" field="appid as value, name as text" label="应用选择" v-model="query.appid" :clear="false" />
			</view>
			<view class="uni-stat--x">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id"
					@change="changePlatform" />
				<uni-data-select collection="uni-stat-app-channels" field="_id as value, channel_name as text, channel_code" label="渠道选择" v-model="query.channel_id" />
			</view>
			<view class="uni-stat--x flex">
				<uni-stat-tabs label="日期选择" :current="currentDateTab" mode="date" @change="changeTimeRange" />
				<uni-datetime-picker type="daterange" :end="new Date().getTime()"  v-model="query.start_time" returnType="timestamp"
					:clearIcon="false" class="uni-stat-datetime-picker"
					:class="{'uni-stat__actived': currentDateTab < 0 && !!query.start_time.length}"
					@change="useDatetimePicker" />
			</view>
			<uni-stat-panel :items="panelData" />
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
							<uni-td v-if="mapper.title && index === 1" :key="mapper.title" class="uni-stat-edit--x">
								{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
								<uni-icons type="compose" color="#2979ff" size="25" class="uni-stat-edit--btn"
									@click="inputDialogToggle(item.path, item.title)" />
							</uni-td>
							<uni-td v-else :key="mapper.title" align="center">
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
		format
	} from '@/js_sdk/uni-stat/util.js'
	import fieldsMap from './fieldsMap.js'
	export default {
		data() {
			return {
				fieldsMap,
				query: {
					dimension: "day",
					appid: '',
					platform_id: '',
					channel_id: '',
					start_time: [],
				},
				options: {
					pageCurrent: 1, // 当前页
					total: 0, // 数据总量
					pageSizeIndex: 0, // 与 pageSizeRange 一起计算得出 pageSize
					pageSizeRange: [10, 20, 50, 100],
				},
				loading: false,
				currentDateTab: 0,
				tableData: [],
				panelData: fieldsMap.filter(f => f.hasOwnProperty('value')),
				queryId: '',
				updateValue: ''
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
			}
		},
		watch: {
			query: {
				deep: true,
				handler(val) {
					this.options.pageCurrent = 1 // 重置分页
					const query = stringifyQuery(val)
					this.getAllData(query)
				}
			}
		},
		methods: {
			useDatetimePicker() {
				this.currentDateTab = -1
			},
			changePlatform() {
				this.query.channel_id = ''
			},
			changeTimeRange(id, index) {
				this.currentDateTab = index
				const start = getTimeOfSomeDayAgo(id),
					end = getTimeOfSomeDayAgo(0) - 1
				this.query.start_time = [start, end]
			},
			changePageCurrent(e) {
				this.options.pageCurrent = e.current
				this.getTableData(this.query)
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
				this.getPanelData(query)
				this.getTableData(query)
			},

			getTableData(query) {
				query = stringifyQuery(this.query)
				const {
					pageCurrent
				} = this.options
				this.loading = true
				const db = uniCloud.database()
				const filterAppid = stringifyQuery({
					appid: this.query.appid
				})
				const mainTableTemp = db.collection( 'uni-stat-pages')
					.where(filterAppid)
					.field('_id, title, path')
					.getTemp()
				const subTableTemp = db.collection( 'uni-stat-page-result')
					.where(query)
					.getTemp()

				db.collection(subTableTemp, mainTableTemp)
					.field(
						`${stringifyField(fieldsMap)}, stat_date, page_id`
					)
					.groupBy("page_id")
					.groupField(stringifyGroupField(fieldsMap))
					.orderBy('visit_times', 'desc')
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
						this.options.total = count
						this.tableData = []
						for (const item of data) {
							const lines = item.page_id
							if (Array.isArray(lines)) {
								delete(item.page_id)
								const line = lines[0]
								if (line && Object.keys(line).length) {
									for (const key in line) {
										if (key !== '_id') {
											item[key] = line[key]
										}
									}

								}
							}
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

			getPanelData(query = stringifyQuery(this.query)) {
				const db = uniCloud.database()
				const subTable = db.collection( 'uni-stat-page-result')
					.where(query)
					.field(stringifyField(fieldsMap))
					.groupBy('appid')
					.groupField(stringifyGroupField(fieldsMap))
					.orderBy('start_time', 'desc ')
					.get()
					.then(res => {
						const items = res.result.data[0]
						this.panelData = []
						this.panelData = mapfields(fieldsMap, items)
					})
			},

			inputDialogToggle(url, title) {
				this.queryId = url
				this.updateValue = title
				this.$refs.inputDialog.open()
			},

			editName(value) {
				// 使用 clientDB 提交数据
				const db = uniCloud.database()
				db.collection( 'uni-stat-pages')
					.where({
						url: this.queryId
					})
					.update({
						title: value
					})
					.then((res) => {
						uni.showToast({
							title: '修改成功'
						})
						this.getTableData()
					}).catch((err) => {
						uni.showModal({
							content: err.message || '请求服务失败',
							showCancel: false
						})
					}).finally(() => {
						uni.hideLoading()
					})
			}
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
