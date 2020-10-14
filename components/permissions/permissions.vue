<template>
    <view class="permissions">
        <view class="permissions-label" :style="{width: labelWidth + 'px'}">
            {{label}}
        </view>
        <view class="permissions-body">
            <checkbox-group @change="checkboxChange">
                <label v-for="(item, index) in permissions" :key="index" class="check-boxes-label">
                    <checkbox class="check-boxes" :checked="item.checked" :value="item.permission_id" /><text>{{item.permission_name}}</text>
                </label>
            </checkbox-group>
        </view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
            };
        },
        props: {
            label: {
                type: String,
                default: true
            },
            // 左边标题的宽度单位px
            labelWidth: {
                type: [Number, String],
                default: ''
            },
            permissions: {
                type: Array,
                default () {
                    return []
                }
            }
        },
        methods: {
            checkboxChange: function(e) {
                this.values = e.detail.value;
            },
            getValues() {
                if (!this.values) {
                    return this.permissions.forEach(item => {
                        if (item.checked) {
                           item.permission_id
                        }
                    })
                } else {
                    return this.values
                }
            }
        }
    }
</script>

<style>
    .permissions {
        display: flex;
        padding: 16px 0;
        text-align: left;
        color: #333;
        font-size: 14px;
        background-color: #fff;
    }

    .permissions-label {
        width: 165px;
    }

    .permissions-body .check-boxes-label {
        margin-right: 20px;
    }

    .permissions-body .check-boxes {
        margin-right: 20px;
        margin-bottom: 20px;
    }
</style>
