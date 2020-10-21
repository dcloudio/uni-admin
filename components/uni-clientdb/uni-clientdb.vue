<template>
    <view>
        <slot :options="options" :data="dataList" :pagination="paginationInternal" :loading="loading" :error="errorMessage"></slot>
    </view>
</template>

<script>
    const db = uniCloud.database();
    const dbCmd = db.command;

    const events = {
        load: 'load',
        error: 'error'
    };
    const pageMode = {
        add: 'add',
        replace: 'replace'
    }

    const attrs = [
        'collection',
        'action',
        'field',
        'pageCurrent',
        'pageSize',
        'getcount',
        'orderby',
        'where'
    ]

    /**
     * uni-clientdb
     * @description uni-clientdb是一个数据库查询组件，它是对uni-clientdb的js库的再封装。
     * @tutorial https://uniapp.dcloud.net.cn/uniCloud/uni-clientDB?id=uni-clientdb-component
     * @property {String} collection 表名
     * @property {String} action 云端执行数据库查询的前或后，触发某个action函数操作，进行预处理或后处理
     * @property {String} field 查询字段，多个字段用 `,` 分割
     * @property {String} orderby 排序字段及正序倒叙设置
     * @property {String} where 查询条件
     * @property {String} pageData `add` 多次查询的集合, `replace` 当前查询的集合
     * @property {Number} pageCurrent 当前页
     * @property {Number} pageSize 每页数据数量
     * @property {Boolean} getone 指定查询结果是否返回数组第一条数据，默认 false。在false情况下返回的是数组，即便只有一条结果，也需要[0]的方式获取。在true下，直接返回结果数据，少一层数组
     * @property {Boolean} getcount 是否查询总数量
     * @property {Boolean} manual 是否手动加载数据，默认为 false，页面onready时自动联网加载数据
     * @event {Function} load 成功回调。如联网返回结果后，想修改下数据再渲染界面，则在本方法里对data进行修改
     * @event {Function} error 失败回调
     */
    export default {
        props: {
            options: {
                type: [Object, Array],
                default () {
                    return {}
                }
            },
            collection: {
                type: String,
                default: ''
            },
            action: {
                type: String,
                default: ''
            },
            field: {
                type: String,
                default: ''
            },
            pageData: {
                type: String,
                default: 'add'
            },
            pageCurrent: {
                type: Number,
                default: 1
            },
            pageSize: {
                type: Number,
                default: 10
            },
            getcount: {
                type: [Boolean, String],
                default: false
            },
            orderby: {
                type: String,
                default: ''
            },
            where: {
                type: [String, Object],
                default: ''
            },
            getone: {
                type: [Boolean, String],
                default: false
            },
            manual: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                loading: false,
                dataList: [],
                paginationInternal: {
                    current: this.pageCurrent,
                    size: this.pageSize,
                    total: 0
                },
                errorMessage: ''
            }
        },
        created() {
            this._isEnded = false

            this.$watch(() => {
                var al = []
                attrs.forEach(key => {
                    al.push(this[key])
                })
                return al
            }, () => {
                this.clear()
                this.reset()
                this._execLoadData()
            })

            // #ifdef H5
            if (process.env.NODE_ENV === 'development') {
                this._debugDataList = []
                if (!window.unidev) {
                    window.unidev = {
                        clientDB: {
                            data: []
                        }
                    }
                }
                unidev.clientDB.data.push(this._debugDataList)
            }
            // #endif

            // #ifdef MP-TOUTIAO
            let changeName
            let events = this.$scope.dataset.eventOpts
            for (var i = 0; i < events.length; i++) {
                let event = events[i]
                if (event[0].includes('^load')) {
                    changeName = event[1][0][0]
                }
            }
            if (changeName) {
                let parent = this.$parent
                let maxDepth = 16
                this._changeDataFunction = null
                while (parent && maxDepth > 0) {
                    let fun = parent[changeName]
                    if (fun && typeof fun === 'function') {
                        this._changeDataFunction = fun
                        maxDepth = 0
                        break
                    }
                    parent = parent.$parent
                    maxDepth--;
                }
            }
            // #endif

            if (!this.manual) {
                this.loadData()
            }
        },
        // #ifdef H5
        beforeDestroy() {
            if (process.env.NODE_ENV === 'development' && window.unidev) {
                var cd = this._debugDataList
                var dl = unidev.clientDB.data
                for (var i = dl.length; i >= 0; i--) {
                    if (dl[i] === cd) {
                        dl.splice(i, 1)
                        break
                    }
                }
            }
        },
        // #endif
        methods: {
            loadData() {
                let callback = null
                if (arguments.length === 1) {
                    var args = arguments[0]
                    if (typeof args === 'function') {
                        callback = args
                    } else {
                        if (args.clear) {
                            this.clear()
                            this.reset()
                        }
                    }
                    if (args.current !== undefined) {
                        this.paginationInternal.current = args.current
                    }
                } else if (arguments.length === 2) {
                    callback = arguments[1]
                }

                this._execLoadData(callback)
            },
            loadMore() {
                if (this._isEnded) {
                    return
                }
                this._execLoadData()
            },
            clear() {
                this._isEnded = false
                this.dataList = []
            },
            reset() {
                this.paginationInternal.current = 1
            },
            _execLoadData(callback) {
                if (this.loading) {
                    return
                }
                this.loading = true
                this.errorMessage = ''

                this._getExec().then((res) => {
                    this.loading = false
                    const {
                        data,
                        total
                    } = res.result
                    this._isEnded = data.length < this.pageSize

                    callback && callback(data, this._isEnded)
                    this._dispatchEvent(events.load, data)

                    if (this.getone) {
                        this.dataList = data.length ? data[0] : undefined
                    } else if (this.pageData === pageMode.add) {
                        this.dataList.push(...data)
                        if (this.dataList.length) {
                            this.paginationInternal.current++
                        }
                    } else if (this.pageData === pageMode.replace) {
                        this.dataList = data
                        this.paginationInternal.total = total
                    }

                    // #ifdef H5
                    if (process.env.NODE_ENV === 'development') {
                        this._debugDataList.length = 0
                        this._debugDataList.push(...JSON.parse(JSON.stringify(this.dataList)))
                    }
                    // #endif
                }).catch((err) => {
                    this.loading = false
                    this.errorMessage = err
                    callback && callback()
                    this.$emit(events.error, err)
                })
            },
            _getExec() {
                let exec = db
                if (this.action) {
                    exec = exec.action(this.action)
                }

                exec = db.collection(this.collection)

                if (!(!this.where || !Object.keys(this.where).length)) {
                    exec = exec.where(this.where)
                }
                if (this.field) {
                    exec = exec.field(this.field)
                }
                if (this.orderby) {
                    exec = exec.orderBy(this.orderby)
                }

                const {
                    current,
                    size
                } = this.paginationInternal
                exec = exec.skip(size * (current - 1)).limit(size).get({
                    getCount: this.getcount
                })

                return exec
            },
            _dispatchEvent(type, data) {
                if (this._changeDataFunction) {
                    this._changeDataFunction(data, this._isEnded)
                } else {
                    this.$emit(type, data, this._isEnded)
                }
            }
        }
    }
</script>
