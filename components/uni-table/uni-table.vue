<template>
    <view class="uni-table" :class="{'table--border':border, 'table--stripe':stripe}">
        <slot></slot>
    </view>
</template>

<script>
    export default {
        name: 'uniTable',
        options: {
            virtualHost: true
        },
        props: {
            data: {
                type: Array,
                default () {
                    return []
                }
            },
            // 是否有竖线
            border: {
                type: Boolean,
                default: false
            },
            // 是否显示斑马线
            stripe: {
                type: Boolean,
                default: false
            },
            // 多选
            type: {
                type: String,
                default: ''
            }
        },
        data() {
            return {

            };
        },
        created() {
            // 定义tr的实例数组
            this.trChildren = []
            this.backData = []
        },
        methods: {
            check(child, check) {
                const childDom = this.trChildren.find((item, index) => child === item)
                const childDomIndex = this.trChildren.findIndex((item, index) => child === item)
                // console.log(childDom.value,check,childDomIndex);
                if (childDomIndex === 0) {
                    if (childDom.value !== check) {
                        this.backData = []
                        this.trChildren.map((item, index) => item.value = check)
                    }
                    this.trChildren.forEach((item, index) => {
                        if (index > 0 && item.value) {
                            this.backData.push(index - 1)
                        }
                    })

                } else {
                    if (!check) {
                        this.trChildren[0].value = false
                    }
                    childDom.value = check
                    if (check) {
                        this.backData.push(childDomIndex - 1)
                    } else {
                        const index = this.backData.findIndex(item => item === (childDomIndex - 1))
                        console.log(index);
                        this.backData.splice(index, 1)
                    }
                    // console.log(childDomIndex);
                    const domCheckAll = this.trChildren.find((item, index) => index > 0 && !item.value)
                    // console.log(domCheckAll);
                    if (!domCheckAll) {
                        this.trChildren[0].value = true
                    }
                }

                this.$emit('selection-change',{
                    detail:{
                        index:this.backData.sort(),
                        value:[]
                    }
                })
                console.log(this.backData);

            }
        }
    }
</script>

<style lang="scss">
    .uni-table {
        width: 100%;
        display: table;
        box-sizing: border-box;
        border-radius: 5px;
        box-shadow: 0px 0px 3px 1px rgba(0, 0, 0, 0.1);
        overflow-x: auto;

        /deep/ .uni-table-tr:nth-child(n+2) {
            &:hover {
                background-color: #f5f7fa;
            }
        }
    }

    .table--border {
        border-top: 1px #ddd solid;
        border-left: 1px #ddd solid;
    }

    .table--stripe {
        /deep/ .uni-table-tr:nth-child(2n+3) {
            background-color: #fafafa;
        }


    }
</style>
