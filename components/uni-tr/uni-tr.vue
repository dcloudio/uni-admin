<template>
    <view class="uni-table-tr">
        <checkbox-group v-if="selection === 'selection'" class="checkbox" :class="{'table--border':border}" @change="change">
            <label>
                <checkbox value="check" :checked="value"/>
            </label>
        </checkbox-group>
        <slot></slot>
    </view>
</template>

<script>
    export default {
        name: 'uniTr',
        options: {
            virtualHost: true
        },
        data() {
            return {
                value: false,
                border: false,
                selection:false
            };
        },
        created() {
            this.root = this.getTable()
            this.border = this.root.border
            this.selection = this.root.type
            this.root.trChildren.push(this)
        },
        methods: {
            change(e) {
                this.root.trChildren.forEach((item) => {
                    if (item === this) {
                        this.root.check(this,e.detail.value.length > 0 ? true : false)
                    }
                })
            },
            /**
             * 获取父元素实例
             */
            getTable() {
                let parent = this.$parent;
                let parentName = parent.$options.name;
                while (parentName !== 'uniTable') {
                    parent = parent.$parent;
                    if (!parent) return false;
                    parentName = parent.$options.name;
                }
                return parent;
            },
        }
    }
</script>

<style lang="scss">
    .uni-table-tr {
        display: table-row;
        transition: all .3s;
    }

    .checkbox {
        padding: 12px 8px;
        width: 26px;
        padding-left: 12px;
        display: table-cell;
        // text-align: center;
        vertical-align: middle;
        color: #333;
        font-weight: 500;
        border-bottom: 1px #ddd solid;
        font-size: 14px;
    }

    .table--border {
        border-right: 1px #ddd solid;
    }
</style>
