<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
			<view class="uni-group">
				<view class="uni-sub-title hide-on-phone"></view>
			</view>
		</view>
		<view class="uni-container">

		<!--
			<view class="uni-stat--x p-1015" v-if="$hasRole('admin')">
				<view class="uni-stat-card-header">统计设置</view>
				<view class="mt10 uni-stat-text">
					<view class="flex">
						<text>定时任务模式</text>
						<radio-group @change="statModeChange" class="flex">
							<label class="uni-radio-cell flex" v-for="(item, index) in statModeList" :key="item.value">
								<view>
									<radio :value="item.value" :checked="statSetting.mode === item.value" />
								</view>
								<uni-tooltip>
									<view class="uni-stat--sum-item-title">
										{{ item.text }}
										<uni-icons class="ml-s" type="help" color="#606266" />
									</view>
									<template v-slot:content>
										<view class="uni-stat-tooltip-s" v-if="item.value === 'open'">
											<view> 设置uni统计定时跑批任务始终运行。 </view>
											<view> 每小时至少消耗15+次数据库读写操作次数，数据量越多，消耗次数越多。 </view>
										</view>
										<view class="uni-stat-tooltip-s" v-else-if="item.value === 'close'">
											<view> 设置uni统计定时跑批任务始终关闭。 </view>
											<view> 由于定时任务无法动态关闭，故此关闭功能为逻辑关闭（即定时任务运行后会马上结束，不执行后续逻辑，减少数据库读写次数） </view>
											<view> 故每小时仍会消耗1次数据库读操作次数。 </view>
										</view>
										<view class="uni-stat-tooltip-s" v-else-if="item.value === 'auto'">
											<view> 设置uni统计定时跑批任务根据设备访问数据自动动态调整开关。 </view>
											<view> 若{{ statSetting.day}} 天（可自由设置天数）内无设备访问数据，则uni统计定时跑批任务自动关闭，有设备访问数据产生时，则uni统计定时跑批任务会自动继续执行。 </view>
										</view>
									</template>
								</uni-tooltip>
							</label>
						</radio-group>
						<view class="flex" v-if="statSetting.mode === 'auto'">
							<text>若</text>
							<uni-number-box v-model="statSetting.day" :min="1" :max="31" @change="statModeDayChange()" class="ml-s"></uni-number-box>
							<text class="ml-s">天内无设备访问数据，则uni统计定时任务不再运行，若期间有设备访问数据，则uni统计定时任务会继续执行。</text>
						</view>
						<text class="uni-a" @click="toUrl('https://uniapp.dcloud.net.cn/uni-stat-v2.html')">详细说明</text>
					</view>
				</view>
			</view>
			-->

			<uni-notice-bar v-if="!deviceTableData.length && !userTableData.length && !query.platform_id && !loading" showGetMore showIcon class="mb-m pointer" text="暂无数据, 统计相关功能需开通 uni 统计后才能使用, 如未开通, 点击查看具体流程" @click="navTo('https://uniapp.dcloud.io/uni-stat-v2.html')" />

			<view class="uni-stat--x mb-m">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id" />
			</view>
			<!-- <uni-stat-panel :items="panelData" :contrast="true" /> -->
			<view class="uni-stat--x p-m">
				<view class="uni-stat-card-header">设备概览</view>
				<uni-table :loading="loading" border stripe emptyText="暂无数据">
					<uni-tr>
						<!-- <uni-th align="center">操作</uni-th> -->
						<block v-for="(mapper, index) in deviceTableFields" :key="index">
							<uni-th v-if="mapper.title" :key="index" align="center">
								{{mapper.title}}
							</uni-th>
						</block>
					</uni-tr>
					<uni-tr v-for="(item ,i) in deviceTableData" :key="i">
						<block v-for="(mapper, index) in deviceTableFields" :key="index">
							<uni-td v-if="mapper.field === 'appid'" align="center">
								<view v-if="item.appid" @click="navTo('/pages/uni-stat/device/overview/overview', item.appid)"
									class="link-btn-color">
									{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
								</view>
								<view v-else @click="navTo('/pages/system/app/add')" class="link-btn-color">
									需添加此应用的 appid
								</view>
							</uni-td>
							<uni-td v-else :key="index" align="center">
								{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
							</uni-td>
						</block>
					</uni-tr>
				</uni-table>
			</view>
			<view class="uni-stat--x p-m">
				<view class="uni-stat-card-header">注册用户概览</view>
				<uni-table :loading="loading" border stripe emptyText="暂无数据">
					<uni-tr>
						<block v-for="(mapper, index) in userTableFields" :key="index">
							<uni-th v-if="mapper.title" :key="index" align="center">
								{{mapper.title}}
							</uni-th>
						</block>
					</uni-tr>
					<uni-tr v-for="(item ,i) in userTableData" :key="i">
						<block v-for="(mapper, index) in userTableFields" :key="index">
							<uni-td v-if="mapper.field === 'appid'" align="center">
								<view v-if="item.appid" @click="navTo('/pages/uni-stat/user/overview/overview', item.appid)"
									class="link-btn-color">
									{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
								</view>
								<view v-else @click="navTo('/pages/system/app/add')" class="link-btn-color">
									需添加此应用的 appid
								</view>
							</uni-td>
							<uni-td v-else :key="index" align="center">
								{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
							</uni-td>
						</block>
					</uni-tr>
				</uni-table>
			</view>
			<!-- <view class="uni-pagination-box">
				<uni-pagination show-icon :page-size="pageSize" :current="pageCurrent" :total="tableData.length" />
			</view> -->
		</view>

		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
	</view>
</template>

<script>
	import {
		stringifyQuery,
		stringifyField,
		stringifyGroupField,
		getTimeOfSomeDayAgo,
		division,
		format,
		parseDateTime,
		getFieldTotal,
		debounce
	} from '@/js_sdk/uni-stat/util.js'

	import {
		deviceFeildsMap,
		userFeildsMap
	} from './fieldsMap.js'

	export default {
		data() {
			return {
				query: {
					platform_id: '',
					start_time: [getTimeOfSomeDayAgo(1), new Date().getTime()]
				},
				deviceTableData: [],
				userTableData: [],
				// panelData: panelOption,
				// 每页数据量
				pageSize: 10,
				// 当前页
				pageCurrent: 1,
				// 数据总量
				total: 0,
				loading: false,
				statSetting:{
					mode:"",
					day:7
				},
				statModeList:[
					{"value": "open","text": "开启"	},
					{"value": "close","text": "关闭"	},
					{"value": "auto","text": "节能" },
				]
			}
		},
		onReady() {
			this.getApps(this.queryStr, deviceFeildsMap, 'device')
			this.getApps(this.queryStr, userFeildsMap, 'user');
			// if (this.$hasRole("admin")) {
			// 	this.getStatSetting();
			// 	this.debounceSetStatSetting = debounce(() => {
			// 		this.setStatSetting();
			// 	}, 300);
			// }
		},
		watch: {
			query: {
				deep: true,
				handler(newVal) {
					this.getApps(this.queryStr, deviceFeildsMap, 'device')
					this.getApps(this.queryStr, userFeildsMap, 'user')
				}
			}
		},
		computed: {
			queryStr() {
				const defQuery = `(dimension == "hour" || dimension == "day")`
				return stringifyQuery(this.query) + ' && ' + defQuery
			},

			deviceTableFields() {
				return this.tableFieldsMap(deviceFeildsMap)
			},
			userTableFields() {
				return this.tableFieldsMap(userFeildsMap)
			}
		},
		methods: {
			tableFieldsMap(fieldsMap) {
				let tableFields = []
				const today = []
				const yesterday = []
				const other = []
				for (const mapper of fieldsMap) {
					if (mapper.field) {
						if (mapper.hasOwnProperty('value')) {
							const t = JSON.parse(JSON.stringify(mapper))
							const y = JSON.parse(JSON.stringify(mapper))
							if (mapper.field !== 'total_users' && mapper.field !== 'total_devices') {
								t.title = '今日' + mapper.title
								t.field = mapper.field + '_value'
								y.title = '昨日' + mapper.title
								y.field = mapper.field + '_contrast'
								today.push(t)
								yesterday.push(y)
							} else {
								t.field = mapper.field + '_value'
								other.push(t)
							}
						} else {
							tableFields.push(mapper)
						}
					}
				}
				tableFields = [...tableFields, ...today, ...yesterday, ...other]
				return tableFields
			},

			getApps(query, fieldsMap, type = "device") {
				this.loading = true
				const db = uniCloud.database()
				const appList = db.collection('opendb-app-list').getTemp()
				const appDaily = db.collection('uni-stat-result')
					.where(query)
					.getTemp()

				db.collection(appDaily, appList)
					.field(
						`${stringifyField(fieldsMap, '', 'value')},stat_date,appid,dimension`
					)
					.groupBy(`appid,dimension,stat_date`)
					.groupField(stringifyGroupField(fieldsMap, '', 'value'))
					.orderBy(`appid`, 'desc')
					.get()
					.then((res) => {
						let {
							data
						} = res.result
						this[`${type}TableData`] = []
						if (!data.length) return
						let appids = [],
							todays = [],
							yesterdays = [],
							isToday = parseDateTime(getTimeOfSomeDayAgo(0), '', ''),
							isYesterday = parseDateTime(getTimeOfSomeDayAgo(1), '', '')
						for (const item of data) {
							const {
								appid,
								name
							} = item.appid && item.appid[0] || {}
							item.appid = appid
							item.name = name

							if (appids.indexOf(item.appid) < 0) {
								appids.push(item.appid)
							}
							if (item.dimension === 'hour' && item.stat_date === isToday) {
								todays.push(item)
							}
							if (item.dimension === 'day' && item.stat_date === isYesterday) {
								yesterdays.push(item)
							}
						}
						const keys = fieldsMap.map(f => f.field).filter(Boolean)
						for (const appid of appids) {
							const rowData = {}
							const t = todays.find(item => item.appid === appid)
							const y = yesterdays.find(item => item.appid === appid)
							for (const key of keys) {
								if (key === 'appid' || key === 'name') {
									rowData[key] = t && t[key]
								} else {
									const value = t && t[key]
									const contrast = y && y[key]
									rowData[key + '_value'] = format(value)
									rowData[key + '_contrast'] = format(contrast)
								}
							}
							this[`${type}TableData`].push(rowData)

							if (appid) {
								// total_users 不准确，置空后由 getFieldTotal 处理, appid 不存在时暂不处理
								t[`total_${type}s`] = 0
								const query = JSON.parse(JSON.stringify(this.query))
								query.start_time = [getTimeOfSomeDayAgo(0), new Date().getTime()]
								query.appid = appid
								getFieldTotal.call(this, query, `total_${type}s`).then(total => {
									this[`${type}TableData`].find(item => item.appid === appid)[
										`total_${type}s_value`] = total
								})
							}
						}
					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			navTo(url, id) {
				if (url.indexOf('http') > -1) {
					window.open(url)
				} else {
					if (id) {
						url = `${url}?appid=${id}`
					}
					uni.navigateTo({
						url
					})
				}
			},
			
			toUrl(url){
				// #ifdef H5
				window.open(url,"_blank");
				// #endif
			},
			statModeChange(e){
				let mode = e.detail.value;
				this.statSetting.mode = mode;
				this.setStatSetting();
			},
			statModeDayChange(){
				this.debounceSetStatSetting();
			},
			// 获取统计配置
			async getStatSetting(){
				const db = uniCloud.database();
				let res = await db.collection('opendb-tempdata').doc("uni-stat-setting").get({getOne:true});
				let data = res.result.data;
				if (!data) {
					this.statSetting.mode = "open";
					await db.collection('opendb-tempdata').add({
						_id:"uni-stat-setting",
						value: this.statSetting,
						expired: 0
					})
				} else {
					this.statSetting = data.value;
				}
			},
			// 设置统计配置
			async setStatSetting(){
				const db = uniCloud.database();
				let res = await db.collection('opendb-tempdata').doc("uni-stat-setting").update({
					value: this.statSetting
				});
			},
			
		}

	}
</script>

<style>
	.uni-stat-card-header {
		display: flex;
		justify-content: space-between;
		color: #555;
		font-size: 14px;
		font-weight: 600;
		padding: 10px 0;
		margin-bottom: 15px;
	}
	.uni-table-scroll {
		min-height: auto;
	}
	.link-btn-color {
		color: #007AFF;
		cursor: pointer;
	}
	.uni-stat-text{
		color: #606266;
	}
	.mt10{
		margin-top: 10px;
	}
	.uni-radio-cell{
		margin: 0 10px;
	}
	.uni-stat-tooltip-s {
		width: 400px;
		white-space: normal;
	}
	.uni-a{
		cursor: pointer;
		text-decoration: underline;
		color: #555;
		font-size: 14px;
	}
</style>
