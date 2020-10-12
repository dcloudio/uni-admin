<template>
    <view style="padding-top: 10px;">
        <uni-segmented-control class="pointer" :current="current" :values="items" styleType="text" style="width: 300px;margin:0 auto;"
            @clickItem="onChange" />
        <view v-if="current===0" class="icons">
            <view v-for="icon in uniIcons" :key="icon" class="icon-item pointer">
                <uni-icons @click.native="setClipboardData('uni','tag',icon)" :type="icon" size="30" />
                <text @click="setClipboardData('uni','class',icon)" class="icon-text">{{icon}}</text>
            </view>
        </view>
        <view v-if="current===1" class="icons">
            <view v-for="icon in icons" :key="icon" class="icon-item pointer">
                <view @click="setClipboardData('el','tag',icon)" :class="'el-icon-'+icon"></view>
                <text @click="setClipboardData('el','class',icon)" class="icon-text">el-icon-{{icon}}</text>
            </view>
        </view>
    </view>
</template>

<script>
    import icons from './el-icons.js'
    import uniIcons from './uni-icons.js'
    export default {
        data() {
            return {
                current: -1,
                items: ['uni-ui Icons', 'element-ui Icons'],
                icons,
                uniIcons
            }
        },
        onReady() {
            //延迟渲染，优化页面进入速度
            setTimeout(() => this.current = 0, 100)
        },
        methods: {
            onChange(e) {
                if (this.current !== e.currentIndex) {
                    this.current = e.currentIndex
                }
            },
            setClipboardData(ui, type, icon) {
                let data = icon
                if (ui === 'el') {
                    data = 'el-icon-' + icon
                    if (type === 'tag') {
                        data = '<view class="' + data + '"></view>'
                    }
                } else {
                    if (type === 'tag') {
                        data = '<uni-icons type="' + icon + '"/>'
                    }
                }
                uni.setClipboardData({
                    data,
                    success(res) {
                        uni.showToast({
                            icon: 'none',
                            title: '复制 ' + data + ' 成功！'
                        })
                    },
                    fail(res) {
                        uni.showModal({
                            content: '复制 ' + data + ' 失败！',
                            showCancel: false
                        })
                    }
                })
            }
        }
    }
</script>

<style>
    .icons {
        display: flex;
        flex-wrap: wrap;
    }

    .icon-item {
        display: flex;
        width: 16.6%;
        height: 120px;
        font-size: 30px;
        text-align: center;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .icon-item:hover,
    .icon-item:hover .icon-text {
        color: #007AFF;
    }

    .icon-text {
        color: #99a9bf;
        font-size: 12px;
        text-align: center;
        height: 1em;
        line-height: 1em;
        margin-top: 15px;
    }
</style>
