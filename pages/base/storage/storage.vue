<template>
    <view>
        <view>
            当前分类：{{catagory || '未获取到分类'}}
        </view>
        <view>
            <button @click="upload">选图上传</button>
            <view>
                <!-- 替换为table组件实现 -->
                <view v-for="(item,index) in fileList" :key="item._id">
                    <text>{{item.name}}</text>|
                    <text>{{item.file_id}}</text>|
                    <text>{{item.catagory}}</text>|
                    <text>{{item.type}}</text>|
                    <text>{{item.size}}</text>|
                    <text>{{item.create_date}}</text>|
                    <button type="warn" @click="deleteFile(item.file_id)">删除</button>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                catagory: '',
                pageSize: 20,
                currentPage: 1,
                fileList: []
            }
        },
        onLoad(options) {
            this.catagory = options.catagory
            this.loadList()
        },
        methods: {
            upload() {
                const reportInfo = {
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
                            reportInfo.size = file.size
                            reportInfo.name = file.name
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
                }).then(({
                    fileID
                }) => {
                    reportInfo.fileID = fileID
                    return this.$request('base/storage/report', reportInfo, {
                        showModal: false
                    })
                }).then(() => {
                    this.loadList(true)
                }).catch(err => {
                    uni.showModal({
                        content: '上传失败：' + (err.message || '未知错误')
                    })
                })
            },
            loadList() {
                this.$request('base/storage/list', {
                    catagory: this.catagory,
                    pageSize: this.pageSize,
                    currentPage: this.currentPage
                }).then(res => {
                    this.fileList = res.list
                }).catch(err => {

                })
            },
            deleteFile(fileID) {
                this.$request('base/storage/delete', {
                    fileID
                }).then(res => {
                    this.loadList()
                }).catch(err => {

                })
            }
        }
    }
</script>

<style>

</style>
