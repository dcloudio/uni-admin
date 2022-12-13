<template>
	<!-- 对应页面： js报错 -->
	<view class="fix-top-window">
		<view class="uni-header">
			<uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
			<view class="uni-group hide-on-phone">
				<!-- <view class="uni-title">错误分析</view> -->
				<view class="uni-sub-title">开发者可以在这里快速查询应用最近出现的具体错误内容，了解错误概况信息，以便快速修复问题</view>
			</view>
		</view>
		<view class="uni-container">
			<view class="uni-stat--x flex p-1015">
				<uni-data-select collection="opendb-app-list" field="appid as value, name as text" orderby="text asc" :defItem="1" label="应用选择" v-model="query.appid" :clear="false" />
				<uni-data-select collection="opendb-app-versions" :where="versionQuery" class="ml-m" field="_id as value, version as text" orderby="text desc" label="版本选择" v-model="query.version_id" />
			</view>
			<view class="uni-stat--x flex">
				<uni-stat-tabs label="日期选择" :current="currentDateTab" :yesterday="false" mode="date"
					@change="changeTimeRange" />
				<uni-datetime-picker type="daterange" :end="new Date().getTime()" v-model="query.start_time"
					returnType="timestamp" :clearIcon="false" class="uni-stat-datetime-picker"
					:class="{'uni-stat__actived': currentDateTab < 0 && !!query.start_time.length}"
					@change="useDatetimePicker" />
			</view>
			<view class="uni-stat--x">
				<uni-stat-tabs label="平台选择" type="boldLine" mode="platform" v-model="query.platform_id" @change="changePlatform" />
			</view>
			<view class="uni-stat--x" style="padding: 15px 0;">
				<uni-stat-panel :items="panelData" class="uni-stat-panel" />
				<uni-stat-tabs type="box" v-model="chartTab" :tabs="chartTabs" class="mb-l" />
				<view class="uni-charts-box">
					<qiun-data-charts type="area" :chartData="chartData" :eopts="{notMerge:true}" echartsH5 echartsApp tooltipFormat="tooltipCustom" />
				</view>
			</view>

			<view class="uni-stat--x p-m">
				<view class="flex-between">
					<view class="uni-stat-card-header">信息列表</view>
					<view class="uni-group">
						<!-- #ifdef H5 -->
						<button v-if="sourceMapEnabled" class="uni-button" type="primary" size="mini"
							@click="openUploadPopup">上传
							sourceMap</button>
						<!-- #endif -->
					</view>
				</view>
				<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
					<uni-tr>
						<block v-for="(mapper, index) in fieldsMap" :key="index">
							<uni-th v-if="mapper.title" :key="index" align="center">
								<!-- #ifdef MP -->
								{{mapper.title}}
								<!-- #endif -->
								<!-- #ifndef MP -->
								<uni-tooltip>
									{{mapper.title}}
									<uni-icons v-if="mapper.tooltip" type="help" color="#666" />
									<template v-if="mapper.tooltip" v-slot:content>
										<view class="uni-stat-tooltip-s">
											{{mapper.tooltip}}
										</view>
									</template>
								</uni-tooltip>
								<!-- #endif -->
							</uni-th>
						</block>
						<uni-th align="center" v-if="sourceMapEnabled">
							操作
						</uni-th>
					</uni-tr>
					<uni-tr v-for="(item ,i) in tableData" :key="i">
						<block v-for="(mapper, index) in fieldsMap" :key="index">
							<uni-td v-if="mapper.field === 'count'" :key="mapper.field" align="center">
								<text class="link-btn" @click="navTo('detail', item)">
									{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
								</text>
							</uni-td>
							<uni-td v-else :key="mapper.field" align="center">
								{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
							</uni-td>
						</block>
						<uni-td v-if="sourceMapEnabled">
							<button size="mini" type="primary" style="white-space: nowrap;"
								@click="openErrPopup(item)">详 情</button>
						</uni-td>
					</uni-tr>
				</uni-table>
				<view class="uni-pagination-box">
					<uni-pagination show-icon show-page-size :page-size="options.pageSize"
						:current="options.pageCurrent" :total="options.total" @change="changePageCurrent"
						@pageSizeChange="changePageSize" />
				</view>
			</view>
		</view>

		<uni-popup ref="errMsg" type="center" :animation="false" :maskClick="true" @change="errMsgPopupChange">
			<view class="modal black-theme">
				<view class="modal-header">
					错误详情
				</view>
				<scroll-view scroll-x="true" scroll-y="true">
					<view class="modal-content" style="padding: 20px 30px;">
						<view v-if="msgLoading" style="margin: 150px 0;text-align: center;font-size: 14px;">
							<uni-load-more class="mb-m" :showText="false" status="loading" />
							<view>正在解析，请稍等...</view>
						</view>
						<!-- <pre>{{errMsg}}</pre> -->
						<text>{{errMsg}}</text>
					</view>
				</scroll-view>
				<view class="dialog-close" @click="closeErrPopup">
					<view class="dialog-close-plus" data-id="close"></view>
					<view class="dialog-close-plus dialog-close-rotate" data-id="close"></view>
				</view>
			</view>
		</uni-popup>

		<!-- #ifdef H5 -->
		<uni-drawer class="sourcemap-drawser" ref="upload" mode="right" :mask-click="true" :width="340">
			<view class="modal" style="max-width: none; min-width: auto;">
				<view class="modal-header">
					上传 sourceMap
				</view>
				<view class="modal-content" style="height: 300px;padding: 0;">
					<uni-data-select collection="opendb-app-list" field="appid as value, name as text"
						orderby="text asc" label="应用" v-model="uploadOptions.appid" />
					<uni-data-select collection="uni-stat-app-platforms" field="code as value, name as text"
						orderby="text asc" label="平台" v-model="uploadOptions.uni_platform" />
					<uni-data-select collection="opendb-app-versions" :where="uploadVersionQuery"
						field="version as value, version as text" orderby="text desc" label="版本"
						v-model="uploadOptions.version" />
					<view class="flex m-m">
						<view class="label-text">选择文件:</view>
						<button class="uni-button ml-m" type="primary" @click="choosefile">选择文件并上传</button>
					</view>
					<view v-if="!vaildate" class="upload-msg-warning">
						{{uploadMsg}}
					</view>
				</view>
				<view class="dialog-close" @click="closeUploadPopup">
					<view class="dialog-close-plus" style="background-color: #333;" data-id="close"></view>
					<view class="dialog-close-plus dialog-close-rotate" style="background-color: #333;" data-id="close">
					</view>
				</view>
			</view>
			<view class="upload-task-header">
				<text>上传任务：{{uploadSuccessTasks.length}}/{{uploadFile.tempFileTasks.length}}</text>
			</view>
			<scroll-view v-if="uploadFile.tempFileTasks.length" style="height: calc(100vh - 362px);" scroll-y="true">
				<view v-if="uploadFile.tempFileTasks.length > uploadSuccessTasks.length">
					<view class="upload-task-header">
						<text>正在上传</text>
					</view>
					<uploadTask :uploadTasks="sortUploadFileTempFileTasks"></uploadTask>
				</view>
				<view v-if="uploadSuccessTasks.length">
					<view class="upload-task-header">
						<text style="color:#42b983;">上传成功</text>
					</view>
					<uploadTask :uploadTasks="uploadSuccessTasks" :showProgress="false"></uploadTask>
				</view>
			</scroll-view>
		</uni-drawer>
		<!-- #endif -->

		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
	</view>
</template>

<script>
	import {
		mapfields,
		stringifyQuery,
		getTimeOfSomeDayAgo,
		division,
		format,
		formatDate,
		parseDateTime,
		fileToUrl,
		debounce,
		getAllDateCN,
		createUniStatQuery
	} from '@/js_sdk/uni-stat/util.js'
	import {
		fieldsMap,
		popupFieldsMap
	} from './fieldsMap.js'
	import uploadTask from './uploadTask.vue'
	import {
		stacktracey,
		uniStracktraceyPreset
	} from '@dcloudio/uni-stacktracey';
	import adminConfig from '@/admin.config.js'

	const appPlatforms = ['ios', 'android', 'app']

	const panelOption = [{
		title: '错误总数',
		value: 0,
		tooltip: '指应用在某个时间段内出现错误的总数'
	}, {
		title: '错误率',
		value: 0,
		tooltip: '时间范围内的总错误数/应用启动次数，如果小于0.01%，默认显示为0'
	}]

	export default {
		data() {
			return {
				uniStat: adminConfig.uniStat,
				fieldsMap,
				popupFieldsMap,
				query: {
					// type: "js",
					dimension: "day",
					appid: "",
					platform_id: '',
					uni_platform: '',
					version_id: '',
					start_time: []
				},
				uploadOptions: createUniStatQuery({
					appid: "",
					uni_platform: '',
				}),
				uploadMsg: '',
				options: {
					pageSize: 20,
					pageCurrent: 1, // 当前页
					total: 0, // 数据总量
				},
				loading: false,
				popupLoading: false,
				currentDateTab: 0,
				// currentChartTab: ,
				tableData: [],
				popupTableData: [],
				panelData: JSON.parse(JSON.stringify(panelOption)),
				chartData: {},
				chartTab: 'errorCount',
				chartTabs: [{
					_id: 'errorCount',
					name: '错误次数'
				}, {
					_id: 'errorRate',
					name: '错误率'
				}],
				errMsg: '',
				msgLoading: false,
				uploadFile: {
					tempFileTasks: [],
					tempFiles: [],
					clear() {
						this.tempFileTasks.length = this.tempFiles.length = 0
					}
				},
				uploadSuccessTaskNames: [],
				errorItem: ''
			}
		},
		components: {
			uploadTask
		},
		computed: {
			queryStr() {
				return stringifyQuery(this.query)
			},
			versionQuery() {
				const {
					appid,
					uni_platform
				} = this.query
				const query = stringifyQuery(createUniStatQuery({
					appid,
					uni_platform
				}))
				return query
			},
			uploadVersionQuery() {
				const {
					appid,
					uni_platform
				} = this.uploadOptions
				const query = stringifyQuery(createUniStatQuery({
					appid,
					uni_platform
				}))
				return query
			},
			vaildate() {
				// 检验 this.uploadOptions 所有项都有值
				const allItemHasVaule = Object.keys(this.uploadOptions).every(k => this.uploadOptions[k])
				if (allItemHasVaule && this.uploadMsg) {
					this.uploadMsg = ''
				}
				return allItemHasVaule
			},
			uploadSuccessTasks() {
				return this.uploadFile.tempFileTasks.filter(task => task.state === 1)
			},
			sortUploadFileTempFileTasks() {
				return this.uploadFile.tempFileTasks.filter(task => task.state !== 1).sort((a, b) => a.state - b.state)
			},
			sourceMapEnabled() {
				return !!this.uniStat.uploadSourceMapCloudSpaceId
			}
		},
		created() {
			this.parsedErrors = {}

			if (this.sourceMapEnabled) {
				// sourceMap 功能需初始化上传的目标云空间
				this.uploadSourcemapCloud = uniCloud.init({
					provider: 'tencent',
					spaceId: this.uniStat.uploadSourceMapCloudSpaceId
				})
			}
		},
		watch: {
			query: {
				deep: true,
				handler(val, old) {
					this.options.pageCurrent = 1 // 重置分页
					this.debounceGet()
				}
			},
			chartTab(val) {
				this.getChartData(this.queryStr)
			}
		},
		methods: {
			debounceGet: debounce(function() {
				this.getAllData(this.queryStr)
			}),
			useDatetimePicker(res) {
				this.currentDateTab = -1
			},
			changePlatform(id, index, name, item) {
				this.query.version_id = 0
				this.uploadOptions.uni_platform = item.code
				this.query.uni_platform = item.code
			},
			changeTimeRange(id, index) {
				this.currentDateTab = index
				const start = getTimeOfSomeDayAgo(id),
					end = getTimeOfSomeDayAgo(0) - 1
				this.query.start_time = [start, end]
			},
			changePageCurrent(e) {
				this.options.pageCurrent = e.current
				this.getTableData(this.queryStr)
			},

			changePageSize(pageSize) {
				this.options.pageSize = pageSize
				this.options.pageCurrent = 1 // 重置分页
				this.getTableData(this.queryStr)
			},

			getAllData(query) {
				this.getChartData(query)
				this.getTableData(query)
			},

			getChartData(query, field = 'day_count') {
				let querystr = stringifyQuery(this.query, false, ['uni_platform'])
				this.chartData = {}
				const {
					pageCurrent
				} = this.options
				const db = uniCloud.database()
				const [start_time, end_tiem] = this.query.start_time
				const timeAll = getAllDateCN(new Date(start_time), new Date(end_tiem))
				db.collection('uni-stat-error-result')
					.where(querystr)
					.groupBy('start_time')
					.groupField('sum(count) as total_day_count')
					.orderBy('start_time', 'desc')
					.get({
						getCount: true
					})
					.then(async res => {
						const count = res.result.count
						const resData = res.result.data
						let data = []


						timeAll.forEach(v => {
							let item = resData.find(item => item.start_time === v)
							if (item) {
								data.push(item)
							} else {
								data.push({
									start_time: v,
									total_day_count: 0
								})
							}
						})

						const options = {
							categories: [],
							series: [{
								name: '暂无数据',
								data: []
							}]
						}
						if (this.chartTab === 'errorCount') {
							const countLine = options.series[0] = {
								name: '错误次数',
								data: []
							}
							const xAxis = options.categories
							for (const item of data) {
								let date = item.start_time
								const x = formatDate(date, 'day')
								const countY = item[`total_${field}`]
								xAxis.push(x)
								countLine.data.push(countY)
							}
							this.chartData = options
						} else {
							let dayAppLaunchs = await this.getDayLaunch(querystr)
							const rateLine = options.series[0] = {
								name: '错误率(%)',
								data: [],
								lineStyle: {
									color: '#EE6666',
									width: 1,
								},
								itemStyle: {
									borderWidth: 1,
									borderColor: '#EE6666',
									color: '#EE6666'
								},
								areaStyle: {
									color: {
										colorStops: [{
											offset: 0,
											color: '#EE6666', // 0% 处的颜色
										}, {
											offset: 1,
											color: '#FFFFFF' // 100% 处的颜色
										}]
									}
								}
							}
							const xAxis = options.categories
							for (const item of data) {
								let date = item.start_time
								const x = formatDate(date, 'day')
								const countY = item[`total_${field}`]
								xAxis.push(x)
								if (dayAppLaunchs.length) {
									const day = dayAppLaunchs.find(day => day.start_time === item.start_time)
									const index = xAxis.indexOf(x)
									if (day) {
										let rateY = (countY * 100) / day.day_app_launch_count
										rateY = rateY.toFixed(2)
										rateLine.data[index] = rateY
									} else {
										rateLine.data[index] = 0
									}
								}
							}
							this.chartData = options
						}

					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {})
			},

			getTotalCount(query) {
				const db = uniCloud.database()
				return db.collection('uni-stat-error-result')
					.where(query)
					.groupBy('appid')
					.groupField('sum(count) as total_count')
					.get()
			},

			getTotalLaunch(query) {
				const db = uniCloud.database()
				return db.collection('uni-stat-result')
					.where(query)
					.groupBy('appid')
					.groupField('sum(app_launch_count) as total_app_launch_count')
					.get()
			},

			/**
			 * 从结果表里获取范围时间内的启动次数
			 * @param {Object} query
			 */
			async getDayLaunch(query) {
				const db = uniCloud.database()
				const res = await db.collection('uni-stat-result')
					.where(query)
					.groupBy('start_time')
					.groupField('sum(app_launch_count) as day_app_launch_count')
					.orderBy('start_time', 'asc')
					.get()
				return res.result.data || []
			},

			getTableData(query = stringifyQuery(this.query)) {

				let querystr = stringifyQuery(this.query, false, ['uni_platform'])
				const {
					pageCurrent
				} = this.options
				this.loading = true
				const db = uniCloud.database()
				const filterAppid = stringifyQuery(createUniStatQuery({
					appid: this.query.appid
				}))
				const mainTableTemp = db.collection('uni-stat-error-result').where(querystr).getTemp()
				const versions = db.collection('opendb-app-versions')
					.where(filterAppid)
					.getTemp()

				const platforms = db.collection('uni-stat-app-platforms')
					.getTemp()

				db.collection(mainTableTemp, versions, platforms)
					.orderBy('count', 'desc')
					.skip((pageCurrent - 1) * this.options.pageSize)
					.limit(this.options.pageSize)
					.get({
						getCount: true
					})
					.then(res => {
						const {
							count,
							data
						} = res.result
						const tempData = []
						this.panelData = JSON.parse(JSON.stringify(panelOption))
						for (const item of data) {
							item.last_time = parseDateTime(item.last_time, 'dateTime')
							item.msgTooltip = item.msg
							item.msg = !item.msg ? '' : item.msg.substring(0, 100) + '...'
							const v = item.version_id[0]
							const p = item.platform_id[0]
							item.version = v && v.version
							item.platform = p && p.name
							item.platform_code = p && p.code
							tempData.push(item)
						}
						this.getTotalCount(querystr).then(res => {
							const total = res.result.data[0]
							const total_count = total && total.total_count
							if (total_count) {
								tempData.forEach(item => item.total_count = Number(total_count))
								this.panelData[0].value = total_count
							}
							let launch_count = ''
							this.getTotalLaunch(querystr).then(res => {
								const total = res.result.data[0]
								launch_count = total && total.total_app_launch_count
								if (total_count && launch_count) {
									let errorRate = total_count / launch_count
									errorRate = (errorRate * 100).toFixed(2) + '%'
									this.panelData[1].value = errorRate
								}
							})

						}).finally(() => {
							this.tableData = []
							this.options.total = count
							tempData.forEach(item => mapfields(fieldsMap, item, item))
							this.tableData = tempData
						})

					}).catch((err) => {
						console.error(err)
						// err.message 错误信息
						// err.code 错误码
					}).finally(() => {
						this.loading = false
					})
			},

			navTo(url, item) {
				if (url.indexOf('http') > -1) {
					window.open(url)
				} else {
					if (item) {
						url = `${url}?error_hash=${item.hash}&create_time=${item.start_time}`
					}
					uni.navigateTo({
						url
					})
				}
			},

			getPlatform(platform_id) {
				const platforms = uni.getStorageSync('platform_last_data')
				let platform = Array.isArray(platforms) && platforms.find(p => p._id === platform_id).code

				// if (appPlatforms.indexOf(platform) !== -1) platform = 'app'

				return platform
			},

			getVersion(version_id) {
				const versions = uni.getStorageSync('uni-stat-app-versions_last_data')
				const version = Array.isArray(versions) && versions.find(v => v._id === version_id).text
				return version
			},
			closeErrPopup() {
				this.$refs.errMsg.close()
			},
			errMsgPopupChange(res) {
				if (res.show) {
					const err = this.errorItem.msgTooltip
					if (this.msgLoading) {
						this.closeErrPopup()
						return;
					}
					if (!err) {
						this.errMsg = '暂无错误数据'
					}
					this.errMsg = ''
					const oldMsg = this.parsedErrors[err]
					//  || oldMsg === err
					this.msgLoading = true
					this.parseError(this.errorItem)
					return
					if (!oldMsg) {
						this.msgLoading = true
						this.parseError(this.errorItem)
					} else {
						this.errMsg = oldMsg
					}
				} else {
					this.msgLoading = false
				}
			},
			parseError(item) {
				let {
					msgTooltip: err,
					appid,
					platform_code,
					version
				} = item

				let base = this.uniStat.cloudSourceMapUrl + `/${appid}/${platform_code}/${version}/`

				try {
					err = JSON.parse(err)
				} catch (e) {}

				console.log("originalErrMsg: ", err);

				stacktracey(err, {
					preset: uniStracktraceyPreset({
						base,
						uniPlatform: platform_code,
						splitThirdParty: true
					})
				}).then(res => {
					const {
						userError,
						thirdParty
					} = res
					const separate = userError.length && thirdParty.length ?
						`\n\n------------${platform_code.indexOf('mp-') !== -1 ? platform_code : 'uni-app'} runtime error------------\n\n` :
						''
					this.errMsg = `${userError}${separate}${thirdParty}`
					this.parsedErrors[err] = this.errMsg
				}).finally(() => {
					this.msgLoading = false
				});
			},
			openUploadPopup() {
				const {
					appid,
					uni_platform
				} = this.query

				this.uploadOptions = {
					appid,
					uni_platform
				}
				this.$refs.upload.open()
			},
			closeUploadPopup() {
				this.$refs.upload.close()
			},
			createUploadFileTask(prefix, fileDiskPath, filePath, onUploadProgress) {
				const cloudPath = prefix + fileDiskPath

				return this.uploadSourcemapCloud.uploadFile({
					filePath,
					cloudPath,
					onUploadProgress
				})
			},
			choosefile() {
				if (!this.vaildate) {
					this.uploadMsg = '请先将应用、平台、版本填写完整'
					return
				}
				const {
					appid,
					uni_platform,
					version
				} = this.uploadOptions

				const prefix = `__UNI__/uni-stat/sourcemap/${appid}/${uni_platform}/${version}/`

				// 原生 input 上传逻辑
				const inputEl = document.createElement('input')
				inputEl.type = 'file'
				inputEl.directory = true
				inputEl.webkitdirectory = true
				inputEl.click()
				inputEl.addEventListener('change', () => {
					this.uploadFile.clear()

					const fileList = inputEl.files; /* now you can work with the file list */
					if (!fileList.length) return

					Array.prototype.forEach.call(fileList, (file) => {
						const path = fileToUrl(file)
						this.uploadFile.tempFileTasks.push({
							fileDiskPath: file.webkitRelativePath.split('/').slice(1).join('/'),
							path,
							size: `${(file.size / 1024).toFixed(2)}kb`,
							name: file.name,
							state: 0,
							progress: 0
						})
						Object.defineProperty(file, 'path', {
							get() {
								return path
							},
						})
						this.uploadFile.tempFiles.push(file)
					})

					this.uploadFile.tempFileTasks.reduce((_uploadFilePromise, cur, curIndex) => {
						return _uploadFilePromise
							.then((msg) => {
								return new Promise((resolve, reject) => {
									// 已上传的文件
									if (this.uploadSuccessTaskNames.indexOf(cur.name) !== -1) {
										cur.progress = 1
										setTimeout(() => {
											cur.state = 1
											resolve()
										}, 200)
									} else {
										this.createUploadFileTask(
											prefix,
											cur.fileDiskPath,
											cur.path,
											(OnUploadProgressRes) => {
												const {
													loaded,
													total
												} = OnUploadProgressRes

												cur.progress = loaded / total
											}
										).then(() => {
											setTimeout(() => {
												this.uploadSuccessTaskNames
													.push(cur.name)
												cur.state = 1
												resolve()
											}, 500)
										}).catch((err) => {
											cur.state = -1
											reject(`${cur.name} 上传失败：` + JSON
												.stringify(err))
										})
									}
								})
							})
					}, Promise.resolve())
				})
			},
			createStr(maps, fn, prefix = 'total_') {
				const strArr = []
				maps.forEach(mapper => {
					if (field.hasOwnProperty('value')) {
						const fieldName = mapper.field
						strArr.push(`${fn}(${fieldName}) as ${prefix + fieldName}`)
					}
				})
				return strArr.join()
			},
			openErrPopup(item) {
				this.errorItem = item
				this.$refs.errMsg.open()
			}
		}
	}
</script>

<style>
	.flex-between {
		margin-bottom: 10px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.uni-stat-panel {
		box-shadow: unset;
		border-bottom: 1px solid #eee;
		padding: 0;
		margin: 0 15px;
	}

	.uni-stat-tooltip-s {
		width: 160px;
		white-space: normal;
	}

	.black-theme {
		background-color: #333;
		color: #fff;
	}

	.dialog-close {
		cursor: pointer;
		position: absolute;
		top: 0;
		right: 0;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		align-items: center;
		padding: 20px;
		margin-top: 10px;
	}

	.dialog-close-plus {
		width: 20px;
		height: 2px;
		background-color: #fff;
		border-radius: 2px;
		transform: rotate(45deg);
	}

	.dialog-close-rotate {
		position: absolute;
		transform: rotate(-45deg);
	}

	.upload-msg-warning {
		padding: 0px 15px;
		color: red;
		font-size: 14px;
	}

	::v-deep .sourcemap-drawser .uni-select {
		flex: 1;
	}

	::v-deep .sourcemap-drawser .uni-select .uni-select__input-text {
		width: 100%;
	}

	.upload-task-header {
		font-size: 14px;
		color: #666;
		padding: 15rpx 25rpx;
		border-top: 1px solid #eee;
		border-bottom: 1px solid #eee;
	}
</style>
