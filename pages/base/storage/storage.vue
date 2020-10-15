<template>
    <view>
        <view class="uni-header uni-header-between">
            <view class="uni-button-group">
                <view class="uni-title">{{catagory}}</view>
            </view>
            <view class="uni-button-group">
                <input class="uni-search" type="text" v-model="q" placeholder="请输入搜索内容" />
                <button class="uni-button" type="default" @click="search">搜索</button>
                <button class="uni-button" type="default" @click="upload">上传</button>
            </view>
        </view>
        <view class="container">
            <uni-table border stripe :loading="loading" emptyText="暂无更多数据">
                <uni-tr>
                    <uni-th align="center">文件名</uni-th>
                    <uni-th width="130" align="center">大小</uni-th>
                    <uni-th width="170" align="center">更新时间</uni-th>
                    <uni-th width="205" align="center">操作</uni-th>
                </uni-tr>
                <uni-tr v-for="(item,index) in list" :key="item._id">
                    <uni-td align="center"><text>{{formatName(item)}}</text></uni-td>
                    <uni-td width="130" align="center"><text>{{$formatBytes(item.size)}}</text></uni-td>
                    <uni-td width="170" align="center"><text>{{$formatDate(item.create_date)}}</text></uni-td>
                    <uni-td width="205" align="center">
                        <view class="uni-button-group">
                            <button class="uni-button" type="primary">详情</button>
                            <button @click="deleteFile(item.file_id)" class="uni-button" type="warn">删除</button>
                        </view>
                    </uni-td>
                </uni-tr>
            </uni-table>
            <view class="uni-pagination-box">
                <uni-pagination show-icon :page-size="pageSize" :current="currentPage" :total="total" @change="loadData" />
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                q: '',
                catagory: '',
                pageSize: 1,
                currentPage: 1,
                total: 0,
                loading: true,
                fileList: []
            }
        },
        computed: {
            list() {
                return this.fileList.map(item => {
                    item.create_date = new Date(item.create_date)
                    return item
                })
            }
        },
        onLoad(options) {
            this.catagory = options.catagory
            this.loadData()
        },
        methods: {
            formatName(item) {
                if (!this.catagory && item.catagory) {
                    return item.catagory + '：' + item.name
                }
                return item.name
            },
            upload() {
                const fileInfo = {
                    type: 'image',
                    catagory: this.catagory
                }
                new Promise((resolve, reject) => {
                    uni.chooseImage({
                        count: 1,
                        success(res) {
                            const path = res.tempFilePaths[0]
                            const file = res.tempFiles[0]
                            const options = {
                                filePath: path,
                                cloudPath: Date.now() + '.' + file.name.split('.').pop()
                            }
                            fileInfo.size = file.size
                            fileInfo.name = file.name
                            resolve(options)
                        },
                        fail(err) {
                            reject(new Error(err))
                        }
                    })
                }).then(({
                    filePath,
                    cloudPath
                }) => {
                    uni.showLoading({
                        mask: true
                    })
                    return uniCloud.uploadFile({
                        filePath,
                        cloudPath,
                        onUploadProgress({
                            loaded,
                            total
                        }) {
                            console.log(loaded + '/' + total);
                        }
                    })
                }).catch(err => {
                    uni.showModal({
                        content: '上传失败：' + (err.message || '未知错误')
                    })
                }).then(({
                    fileID
                }) => {
                    fileInfo.fileID = fileID
                    return this.$request('base/storage/add', fileInfo)
                }).then(() => {
                    this.loadData()
                }).finally(() => {
                    uni.hideLoading()
                })
            },
            loadData() {
                this.loading = true
                this.$request('base/storage/list', {
                    catagory: this.catagory,
                    pageSize: this.pageSize,
                    currentPage: this.currentPage
                }).then(res => {

                    this.fileList = res.list
                    this.total = res.total
                }).finally(() => {
                    this.loading = false
                })
            },
            deleteFile(fileID) {
                uni.showModal({
                    title: '提示',
                    content: '确认删除该文件？',
                    success: (res) => {
                        if (res.confirm) {
                            uni.showLoading({
                                mask: true
                            })
                            this.$request('base/storage/delete', {
                                fileID
                            }).then(res => {
                                this.loadData()
                            }).finally(() => {
                                uni.hideLoading()
                            })
                        }
                    }
                })
            }
        }
    }
</script>

<style>

</style>
