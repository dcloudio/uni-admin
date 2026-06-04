<template>
	<view>
		<view class="uni-header">
			<view class="uni-group">
				<view class="uni-title"></view>
        <!-- ::TODO 仅在演示系统中展示 -->
        <!-- #ifdef H5 -->
<!--        <view class="uni-sub-title preview-tip">-->
<!--          本演示系统对应的内容请在-->
<!--          <view class="mp-preview">-->
<!--            <text>小程序</text>-->
<!--            <view class="qr">-->
<!--              <image class="img" src="https://web-assets.dcloud.net.cn/unidoc/zh/202304121203155.jpg" />-->
<!--            </view>-->
<!--          </view>-->
<!--          中查看，相关文档<a href="https://uniapp.dcloud.net.cn/uniCloud/uni-cms.html" target="_blank">详见</a>-->
<!--        </view>-->
        <!-- #endif -->
			</view>
			<view class="uni-group">
				<input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="请输入搜索内容" />
				<button class="uni-button" type="default" size="mini" @click="search">搜索</button>
				<button v-if="hasPermission('CREATE_UNI_CMS_ARTICLE')" class="uni-button" type="primary" size="mini" @click="navigateTo('../add/add')">新增</button>
				<button v-if="hasPermission('DELETE_UNI_CMS_ARTICLE')" class="uni-button" type="warn" size="mini" :disabled="!selectedIndexs.length" @click="delTable">
					批量删除
				</button>
				<download-excel class="hide-on-phone" :fields="exportExcel.fields" :data="exportExcelData"
					:type="exportExcel.type" :name="exportExcel.filename">
					<button class="uni-button" type="primary" size="mini">导出 Excel</button>
				</download-excel>
			</view>
		</view>
		<view class="uni-container">
			<unicloud-db ref="udb" :collection="collectionList" :where="where" page-data="replace" :orderby="orderby"
				:getcount="true" :page-size="options.pageSize" :page-current="options.pageCurrent"
				v-slot:default="{ pagination, loading, error, options }" :options="options" loadtime="manual"
				@load="onqueryload">
				<uni-table ref="table" :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe
					type="selection" @selection-change="selectionChange">
					<uni-tr>
						<uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'thumbnail')"
							sortable @sort-change="sortChange($event, 'thumbnail')">封面大图
						</uni-th>
						<uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'title')" sortable
							@sort-change="sortChange($event, 'title')">标题
						</uni-th>
						<uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'excerpt')"
							sortable @sort-change="sortChange($event, 'excerpt')">摘要
						</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'user_id')">作者</uni-th>
						<uni-th
                align="center"
                filter-type="select"
                :filter-data="options.filterData.categories"
                @filter-change="filterChange($event, 'category_id._id')"
            >分类</uni-th>
						<uni-th align="center" filter-type="select"
							:filter-data="options.filterData.article_status_localdata"
							@filter-change="filterChange($event, 'article_status')">文章状态
						</uni-th>
						<!--						<uni-th align="center" sortable @sort-change="sortChange($event, 'is_sticky')">是否置顶</uni-th>-->
						<!--						<uni-th align="center" sortable @sort-change="sortChange($event, 'is_essence')">阅读加精</uni-th>-->
						<uni-th align="center" filter-type="range" @filter-change="filterChange($event, 'view_count')"
							sortable @sort-change="sortChange($event, 'view_count')">阅读数量
						</uni-th>
						<!--						<uni-th align="center" filter-type="range" @filter-change="filterChange($event, 'like_count')" sortable @sort-change="sortChange($event, 'like_count')">点赞数</uni-th>-->
						<!--            <uni-th align="center" filter-type="range" @filter-change="filterChange($event, 'comment_count')" sortable @sort-change="sortChange($event, 'comment_count')">评论数</uni-th>-->
						<uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'publish_date')"
							sortable @sort-change="sortChange($event, 'publish_date')">发布时间
						</uni-th>
						<uni-th align="center">操作</uni-th>
					</uni-tr>
					<uni-tr v-for="(item, index) in tableList" :key="index">
						<uni-td align="center" v-if="item.thumbnail && item.thumbnail.length > 0">
							<image :src="item.thumbnail[0]" mode="aspectFill"
								style="width: 120px; height: 80px; cursor:pointer;border-radius: 4px;" @click="previewCover(item.thumbnail)">
							</image>
              <view class="multi-tip" v-if="item.thumbnail && item.thumbnail.length >= 3">3图</view>
						</uni-td>
						<uni-td align="center" v-else>无封面</uni-td>
						<uni-td align="center">{{ item.title }}</uni-td>
						<uni-td align="center">{{ item.excerpt }}</uni-td>
						<uni-td align="center">{{ item.user_id && item.user_id[0] && item.user_id[0].nickname || '-'}}</uni-td>
						<uni-td align="center">{{ item.category_id && item.category_id[0] && item.category_id[0].text || '-'}}</uni-td>
						<uni-td align="center">{{ options.article_status_valuetotext[item.article_status] }}</uni-td>
						<!--						<uni-td align="center">{{ item.is_sticky == true ? '✅' : '❌' }}</uni-td>-->
						<!--						<uni-td align="center">{{ item.is_essence == true ? '✅' : '❌' }}</uni-td>-->
						<uni-td align="center">{{ item.view_count || 0 }}</uni-td>
						<!--            <uni-td align="center">{{item.like_count || 0}}</uni-td>-->
						<!--						<uni-td align="center">{{item.comment_count || 0}}</uni-td>-->
						<uni-td align="center">
							<uni-dateformat :threshold="[0, 0]" :date="item.publish_date"></uni-dateformat>
						</uni-td>
						<uni-td align="center">
							<view class="uni-group">
								<button v-if="hasPermission('UPDATE_UNI_CMS_ARTICLE')" @click="navigateTo('../edit/edit?id=' + item._id, false)" class="uni-button"
									size="mini" type="primary">修改
								</button>
								<button v-if="item.article_status === 1 && hasPermission('UPDATE_UNI_CMS_ARTICLE')" @click="takeOffArticle(item._id)"
									class="uni-button" size="mini" type="default">下架</button>
								<button v-if="hasPermission('DELETE_UNI_CMS_ARTICLE')" @click="confirmDelete(item._id)" class="uni-button" size="mini"
									type="warn">删除</button>
							</view>
						</uni-td>
					</uni-tr>
				</uni-table>
				<view class="uni-pagination-box">
					<uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current"
						:total="pagination.count" @change="onPageChanged" />
				</view>
			</unicloud-db>
		</view>
	</view>
</template>

<script>
// 引入公共方法
import { enumConverter, filterToWhere } from '@/uni_modules/uni-cms/common/validator/uni-cms-articles.js';
import authMixin from "@/uni_modules/uni-cms/common/auth-mixin";
import {parseImageUrl} from "@/uni_modules/uni-cms/common/parse-image-url";

// 实例化数据库
const db = uniCloud.database()
// 文章表
const articleDBName = 'uni-cms-articles'
// 分类表
const categoryDBName = 'uni-cms-categories'
// 用户表
const userDBName = 'uni-id-users'

// 表查询配置
const dbOrderBy = '' // 排序字段
const dbSearchFields = ['title', 'excerpt'] // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
// 分页配置
const pageSize = 20
const pageCurrent = 1

// 排序方式映射
const orderByMapping = {
	"ascending": "asc",
	"descending": "desc"
}

export default {
  mixins: [authMixin],
	data() {
		return {
			// collectionList 包含了三个对象，每个对象都是一个数据库查询对象，用于联表查询。第一个对象查询文章表，第二个对象查询分类表，第三个对象查询用户表。
			collectionList: [
				db.collection(articleDBName).field('is_admin,user_id,category_id,content,title,excerpt,article_status,view_count,like_count,is_sticky,is_essence,comment_status,comment_count,last_comment_user_id,thumbnail,publish_date,publish_ip,last_modify_date,last_modify_ip').getTemp(),
				db.collection(categoryDBName).field('name as text, _id').getTemp(),
				db.collection(userDBName).field('nickname, _id').getTemp(),
			],
			// 用于存储搜索关键字，用于模糊搜索文章标题和内容。
			query: '',
			// 用于存储查询条件。其中包含了文章状态、分类、关键字等多个查询条件。
			where: '',
			// 用于指定查询结果的排序方式，可以指定一个或多个字段进行排序，也可以指定排序方式（升序或降序）。
			orderby: dbOrderBy,
			// 用于存储当前排序字段名的变量。
			orderByFieldName: "",
			// 存储当前选中的文章的索引值。
			selectedIndexs: [],
			options: {
				pageSize,
				pageCurrent,
				filterData: {
					"article_status_localdata": [
						{
							"value": 0,
							"text": "草稿箱"
						},
						{
							"value": 1,
							"text": "已发布"
						}
					],
					"comment_status_localdata": [
						{
							"value": 0,
							"text": "关闭"
						},
						{
							"value": 1,
							"text": "开放"
						}
					],
          categories: []
				},
				...enumConverter
			},
			imageStyles: {
				width: 64,
				height: 64
			},
			exportExcel: {
				"filename": "uni-cms-articles.xls",
				"type": "xls",
				"fields": {
					"用户ID": "user_id",
					"分类": "category_id",
					"标题": "title",
					"文章内容": "content",
					"文章摘录": "excerpt",
					"文章状态": "article_status",
					"阅读数量": "view_count",
					"点赞数": "like_count",
					"是否置顶": "is_sticky",
					"阅读加精": "is_essence",
					"开放评论": "comment_status",
					"评论数": "comment_count",
					"最后评论的用户ID": "last_comment_user_id",
					"封面大图": "thumbnail",
					"发表时间": "publish_date",
					"发布文章时IP地址": "publish_ip",
					"最后修改时间": "last_modify_date",
					"最后修改人IP": "last_modify_ip"
				}
			},
      tableList: [],
			exportExcelData: []
		}
	},
	onLoad() {
		this._filter = {}
	},
	onReady() {
		this.$refs.udb.loadData()
    this.loadCategories()
	},
	methods: {
    async loadCategories () {
      const {result} = await db.collection(categoryDBName).get()

      if (result) {
        this.options.filterData.categories = result.data.map(item => {
          return {
            text: item.name,
            value: item._id
          }
        })
      }
    },
		/**
     * 封面预览
     * @param imageList
     */
		previewCover(imageList) {
			uni.previewImage({
				current: imageList[0],
				urls: imageList
			})
		},
		// 查询数据加载完成
		async onqueryload(data) {
			let listData = []

			for (const item of data) {
				if (item.thumbnail && typeof item.thumbnail === 'string') {
					item.thumbnail = [item.thumbnail]
				}

				const parseImages = await parseImageUrl(item.thumbnail)
				item.thumbnail = parseImages.map(image => image.src)

				listData.push(item)
			}

      this.tableList = listData
			this.exportExcelData = listData
		},
		// 获取查询条件
		getWhere() {
			const query = this.query.trim()
			if (!query) {
				return ''
			}
			const queryRe = new RegExp(query, 'i')
			return dbSearchFields.map(name => queryRe + '.test(' + name + ')').join(' || ')
		},
		// 查询
		search() {
			const newWhere = this.getWhere()
			this.where = newWhere
			this.$nextTick(() => {
				this.loadData()
			})
		},
		// 加载数据
		loadData(clear = true) {
			this.$refs.udb.loadData({
				clear
			})
		},
		// 分页改变
		onPageChanged(e) {
			this.selectedIndexs.length = 0
			this.$refs.table.clearSelection()
			this.$refs.udb.loadData({
				current: e.current
			})
		},
		// 跳转页面
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
		// 获取选中项
		selectedItems() {
			var dataList = this.$refs.udb.dataList
			return this.selectedIndexs.map(i => dataList[i]._id)
		},
		// 批量删除
		delTable() {
			this.$refs.udb.remove(this.selectedItems(), {
				success: (res) => {
					this.$refs.table.clearSelection()
				}
			})
		},
		// 选中项改变
		selectionChange(e) {
			this.selectedIndexs = e.detail.index
		},
		// 确认删除
		confirmDelete(id) {
			this.$refs.udb.remove(id, {
				success: (res) => {
					this.$refs.table.clearSelection()
				}
			})
		},
		// 排序改变
		sortChange(e, name) {
			// 设置排序字段
			this.orderByFieldName = name;
			// 判断是否需要排序
			if (e.order) {
				// 设置排序方式
				this.orderby = name + ' ' + orderByMapping[e.order]
			} else {
				this.orderby = ''
			}
			// 清空选中项
			this.$refs.table.clearSelection()
			// 加载数据
			this.$nextTick(() => {
				this.$refs.udb.loadData()
			})

		},
		// 筛选改变
		filterChange(e, name) {
			// 将筛选条件添加到筛选对象中
			this._filter[name] = {
				type: e.filterType,
				value: e.filter
			}
      // range 类型的筛选，如果输入的值不是数字，则不进行筛选
      const {type, value} = this._filter[name]
      if (type === 'range') {
        for (const val of value) {
          if (typeof val === "number" && isNaN(val)) return
        }
      }

			// 将筛选对象转换为where条件
			let newWhere = filterToWhere(this._filter, db.command)
			// 判断是否有where条件
			if (Object.keys(newWhere).length) {
				// 如果有where条件，则将where条件赋值给this.where
				this.where = newWhere
			} else {
				// 如果没有where条件，则将this.where赋值为空字符串
				this.where = ''
			}
			// 加载数据
			this.$nextTick(() => {
				this.$refs.udb.loadData()
			})
		},
		// 下架文章
		takeOffArticle(id) {
			uni.showModal({
				title: '下架文章',
				content: '文章下架后将不会在前台展示，确定下架吗？',
				success: (res) => {
					if (res.confirm) {
						this.$refs.udb.update(id, {
							article_status: 0
						}, {
							success: (res) => {
								this.$refs.table.clearSelection()
								this.$refs.udb.loadData()
							}
						})
					}
				}
			})
		},
	}

}
</script>

<style lang="scss" scoped>
.preview-tip {
  display: flex;
  align-items: center;
  .mp-preview {
    position: relative;
    color: #2979ff;
    cursor: pointer;
    &:hover {
      .qr {
        display: block;
      }
    }
    .qr {
      display: none;
      position: absolute;
      left: 50%;
      margin-left: -70px;
      width: 140px;
      height: 140px;
      padding: 10px;
      background: #fff;
      z-index: 1;
      top: 34px;
      border-radius: 8px;
      border: #e1e1e1 solid 1px;
      box-shadow: rgba(0,0,0,.1) 0 5px 8px;
      box-sizing: border-box;
      .img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
