<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
			<view class="uni-group">
				<input class="uni-search" type="text" v-model="query" @confirm="search" :placeholder="$t('common.placeholder.query')" />
				<button class="uni-button hide-on-phone" type="default" size="mini" @click="search">{{$t('common.button.search')}}</button>
				<button class="uni-button" type="primary" size="mini" @click="navigateTo('./add')">{{$t('common.button.add')}}</button>
				<button class="uni-button" type="warn" size="mini" :disabled="!selectedIndexs.length"
					@click="delTable">{{$t('common.button.batchDelete')}}</button>
				<!-- #ifdef H5 -->
				<!-- #ifndef VUE3 -->
				<download-excel class="hide-on-phone" :fields="exportExcel.fields" :data="exportExcelData"
					:type="exportExcel.type" :name="exportExcel.filename">
					<button class="uni-button" type="primary" size="mini">{{$t('common.button.exportExcel')}}</button>
				</download-excel>
				<!-- #endif -->
				<!-- #endif -->
			</view>
		</view>
		<view class="uni-container">
			<unicloud-db ref="udb" collection="opendb-app-list" field="appid,name,description,create_date"
				:where="where" page-data="replace" :orderby="orderby" :getcount="true" :page-size="options.pageSize"
				:page-current="options.pageCurrent" v-slot:default="{data,pagination,loading,error,options}"
				:options="options" loadtime="manual" @load="onqueryload">
				<uni-table ref="table" :loading="loading || addAppidLoading" :emptyText="error.message || $t('common.empty')"
					border stripe type="selection" @selection-change="selectionChange" class="table-pc">
					<uni-tr>
						<uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'appid')"
							sortable @sort-change="sortChange($event, 'appid')">AppID</uni-th>
						<uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'name')"
							sortable @sort-change="sortChange($event, 'name')">应用名称</uni-th>
						<uni-th align="center" width="380" filter-type="search" @filter-change="filterChange($event, 'description')"
							sortable @sort-change="sortChange($event, 'description')">应用描述</uni-th>
						<uni-th align="center" filter-type="timestamp"
							@filter-change="filterChange($event, 'create_date')" sortable
							@sort-change="sortChange($event, 'create_date')">创建时间</uni-th>
						<uni-th align="center">操作</uni-th>
					</uni-tr>
					<uni-tr v-for="(item,index) in data" :key="index">
						<uni-td align="center">{{item.appid}}</uni-td>
						<uni-td align="center">{{item.name}}</uni-td>
						<uni-td align="center">{{item.description}}</uni-td>
						<uni-td align="center">
							<uni-dateformat :threshold="[0, 0]" :date="item.create_date"></uni-dateformat>
						</uni-td>
						<uni-td align="center">
							<view v-if="item.appid === appid">
								-
							</view>
							<view v-else class="uni-group">
								<button @click="navigateTo('./edit?id='+item._id, false)" class="uni-button" size="mini"
									type="primary">{{$t('common.button.edit	')}}</button>
								<button @click="confirmDelete(item._id)" class="uni-button" size="mini"
									type="warn">{{$t('common.button.delete')}}</button>
							</view>
						</uni-td>
					</uni-tr>
				</uni-table>

				<view class="uni-pagination-box">
					<!-- #ifndef MP -->
					<picker class="select-picker" mode="selector" :value="pageSizeIndex" :range="pageSizeOption"
						@change="changeSize">
						<button type="default" size="mini" :plain="true">
							<text>{{pageSizeOption[pageSizeIndex]}} {{$t('common.piecePerPage')}}</text>
							<uni-icons class="select-picker-icon" type="arrowdown" size="12" color="#999"></uni-icons>
						</button>
					</picker>
					<!-- #endif -->
					<uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current"
						:total="pagination.count" @change="onPageChanged" />
				</view>
			</unicloud-db>
		</view>

		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
	</view>
</template>

<script>
	import {
		enumConverter,
		filterToWhere
	} from '../../../js_sdk/validator/opendb-app-list.js';
	import {
		mapState
	} from 'vuex'

	const db = uniCloud.database()
	// 表查询配置
	const dbOrderBy = '' // 排序字段
	const dbSearchFields = [] // 模糊搜索字段，支持模糊搜索的字段列表
	// 分页配置
	const pageSize = 20
	const pageCurrent = 1

	const orderByMapping = {
		"ascending": "asc",
		"descending": "desc"
	}

	export default {
		data() {
			return {
				query: '',
				where: '',
				orderby: dbOrderBy,
				orderByFieldName: "",
				selectedIndexs: [],
				pageSizeIndex: 0,
				pageSizeOption: [20, 50, 100, 500],
				options: {
					pageSize,
					pageCurrent,
					filterData: {},
					...enumConverter
				},
				imageStyles: {
					width: 64,
					height: 64
				},
				exportExcel: {
					"filename": "opendb-app-list.xls",
					"type": "xls",
					"fields": {
						"AppID": "appid",
						"应用名称": "name",
						"应用描述": "description",
						"创建时间": "create_date"
					}
				},
				exportExcelData: [],
				addAppidLoading: true
			}
		},
		onLoad() {
			this._filter = {}
		},
		onReady() {
			this.$refs.udb.loadData()
		},
		computed: {
			...mapState('app', ['appName', 'appid'])
		},
		watch: {
			pageSizeIndex: {
				immediate: true,
				handler(val, old) {
					this.options.pageSize = this.pageSizeOption[val]
					this.options.pageCurrent = 1
					this.$nextTick(() => {
						this.loadData()
					})
				}
			}
		},
		methods: {
			onqueryload(data) {
				if (!data.find(item => item.appid === this.appid)) {
					this.addCurrentAppid({
						appid: this.appid,
						name: this.appName,
						description: "admin 管理后台",
						create_date: Date.now()
					})
				} else {
					this.addAppidLoading = false
				}
				this.exportExcelData = data
			},
			changeSize(e) {
				this.pageSizeIndex = e.detail.value
			},
			addCurrentAppid(app) {
				// 使用 clientDB 提交当前 appid
				db.collection('opendb-app-list').add(app).then((res) => {
					this.loadData()
					setTimeout(() => {
						uni.showModal({
							content: `检测到数据库中无当前应用, 已自动添加应用: ${this.appName}`,
							showCancel:false
						})
					}, 500)
				}).catch((err) => {

				}).finally(() => {
					this.addAppidLoading = false
				})
			},
			getWhere() {
				const query = this.query.trim()
				if (!query) {
					return ''
				}
				const queryRe = new RegExp(query, 'i')
				return dbSearchFields.map(name => queryRe + '.test(' + name + ')').join(' || ')
			},
			search() {
				const newWhere = this.getWhere()
				this.where = newWhere
				this.loadData()
			},
			loadData(clear = true) {
				this.$refs.udb.loadData({
					clear
				})
			},
			onPageChanged(e) {
				this.selectedIndexs.length = 0
				this.$refs.table.clearSelection()
				this.$refs.udb.loadData({
					current: e.current
				})
			},
			navigateTo(url, clear) {
				// clear 表示刷新列表时是否清除页码，true 表示刷新并回到列表第 1 页，默认为 true
				uni.navigateTo({
					url,
					events: {
						refreshData: () => {
							this.loadData(clear)
						}
					}
				})
			},
			// 多选处理
			selectedItems() {
				var dataList = this.$refs.udb.dataList
				return this.selectedIndexs.map(i => dataList[i]._id)
			},
			// 批量删除
			delTable() {
				console.warn("删除应用，只能删除应用表 opendb-app-list 中的应用数据记录，不能删除与应用关联的其他数据，例如：使用升级中心 uni-upgrade-center 等插件产生的数据（应用版本数据等）")
				this.$refs.udb.remove(this.selectedItems(), {
					success: (res) => {
						this.$refs.table.clearSelection()
					}
				})
			},
			// 多选
			selectionChange(e) {
				this.selectedIndexs = e.detail.index
			},
			confirmDelete(id) {
				console.warn("删除应用，只能删除应用表 opendb-app-list 中的应用数据记录，不能删除与应用关联的其他数据，例如：使用升级中心 uni-upgrade-center 等插件产生的数据（应用版本数据等）")
				this.$refs.udb.remove(id, {
					success: (res) => {
						this.$refs.table.clearSelection()
					}
				})
			},
			sortChange(e, name) {
				this.orderByFieldName = name;
				if (e.order) {
					this.orderby = name + ' ' + orderByMapping[e.order]
				} else {
					this.orderby = ''
				}
				this.$refs.table.clearSelection()
				this.$nextTick(() => {
					this.$refs.udb.loadData()
				})
			},
			filterChange(e, name) {
				this._filter[name] = {
					type: e.filterType,
					value: e.filter
				}
				let newWhere = filterToWhere(this._filter, db.command)
				if (Object.keys(newWhere).length) {
					this.where = newWhere
				} else {
					this.where = ''
				}
				this.$nextTick(() => {
					this.$refs.udb.loadData()
				})
			}
		}
	}
</script>

<style>
</style>
