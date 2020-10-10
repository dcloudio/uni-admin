<template>
    <view class="navbar">
        <!-- #ifdef H5 -->
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position: absolute; width: 0; height: 0">
            <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" id="icon-bug">
                <path d="M127.88 73.143c0 1.412-.506 2.635-1.518 3.669-1.011 1.033-2.209 1.55-3.592 1.55h-17.887c0 9.296-1.783 17.178-5.35 23.645l16.609 17.044c1.011 1.034 1.517 2.257 1.517 3.67 0 1.412-.506 2.635-1.517 3.668-.958 1.033-2.155 1.55-3.593 1.55-1.438 0-2.635-.517-3.593-1.55l-15.811-16.063a15.49 15.49 0 0 1-1.196 1.06c-.532.434-1.65 1.208-3.353 2.322a50.104 50.104 0 0 1-5.192 2.974c-1.758.87-3.94 1.658-6.546 2.364-2.607.706-5.189 1.06-7.748 1.06V47.044H58.89v73.062c-2.716 0-5.417-.367-8.106-1.102-2.688-.734-5.003-1.631-6.945-2.692a66.769 66.769 0 0 1-5.268-3.179c-1.571-1.057-2.73-1.94-3.476-2.65L33.9 109.34l-14.611 16.877c-1.066 1.14-2.344 1.711-3.833 1.711-1.277 0-2.422-.434-3.434-1.304-1.012-.978-1.557-2.187-1.635-3.627-.079-1.44.333-2.705 1.236-3.794l16.129-18.51c-3.087-6.197-4.63-13.644-4.63-22.342H5.235c-1.383 0-2.58-.517-3.592-1.55S.125 74.545.125 73.132c0-1.412.506-2.635 1.518-3.668 1.012-1.034 2.21-1.55 3.592-1.55h17.887V43.939L9.308 29.833c-1.012-1.033-1.517-2.256-1.517-3.669 0-1.412.505-2.635 1.517-3.668 1.012-1.034 2.21-1.55 3.593-1.55s2.58.516 3.593 1.55l13.813 14.106h67.396l13.814-14.106c1.012-1.034 2.21-1.55 3.592-1.55 1.384 0 2.581.516 3.593 1.55 1.012 1.033 1.518 2.256 1.518 3.668 0 1.413-.506 2.636-1.518 3.67l-13.814 14.105v23.975h17.887c1.383 0 2.58.516 3.593 1.55 1.011 1.033 1.517 2.256 1.517 3.668l-.005.01zM89.552 26.175H38.448c0-7.23 2.489-13.386 7.466-18.469C50.892 2.623 56.92.082 64 .082c7.08 0 13.108 2.541 18.086 7.624 4.977 5.083 7.466 11.24 7.466 18.469z"></path>
            </symbol>
        </svg>
        <!-- #endif -->
        <view class="flex-s p-t-20" style="position: relative;">
            <view v-if="isPhone" @click="taggleSidebar" class="el-icon-s-unfold" style="padding:10px 35px 10px 0;"></view>
            <view class="logo-image" :class="{'min-logo': isPhone}">
                <image :src="logo" mode="heightFix"></image>
            </view>
            <view v-if="isPhone" class="top-window-right flex-s">
                <text class="user">{{userInfo.username}}</text>️
			    <uni-icons v-if="userInfo.username" class="arrowdown" type="arrowdown" color="#bbb" size="14"></uni-icons>
            </view>
            <view v-if="!isPhone" :class="{'repalce-select flex-column':isPhone}" class="top-window-right">
                <!-- #ifdef H5 -->
                <view v-if="logs.length" @click="showErrorLogs" class="debug pointer">
                    <svg class="svg-icon">
                        <use xlink:href="#icon-bug"></use>
                    </svg>
                    <uni-badge class="debug-badge" :text="logs.length" type="error"></uni-badge>
                </view>
                <!-- #endif -->
                <uni-link v-for="link in links" :key="link.url" :href="link.url" :text="link.text" />
                <text class="user">{{userInfo.username}}</text>️
                <text v-if="userInfo.username" class="logout pointer" @click="logout">退出</text>️
            </view>
        </view>
        <uni-popup ref="errorLogsPopup" type="center">
            <view class="modal">
                <scroll-view class="modal-content" scroll-y="true">
                    <error class="error-table" />
                </scroll-view>
            </view>
        </uni-popup>
    </view>
</template>

<script>
    import {
        mapMutations,
        mapState
    } from 'vuex'
    import config from '@/admin.config.js'
    export default {
        data() {
            return {
                ...config.navBar,
                isOpen: false
            }
        },
        computed: {
            ...mapState('user', ['userInfo']),
            ...mapState('error', ['logs']),
            ...mapState('app', ['isPhone'])
        },
        methods: {
            ...mapMutations({
                removeToken(commit) {
                    commit('user/REMOVE_TOKEN')
                }
            }),
            showErrorLogs() {
                this.$refs.errorLogsPopup.open()
            },
            logout() {
                this.$http('user/logout')
                    .then(res => {
                        this.removeToken()
                        uni.reLaunch({
                            url: config.login.url
                        })
                    }).catch(err => {

                    })
            },
            taggleSidebar(){
                if (!this.isOpen) {
                    uni.showLeftWindow()
                } else {
                    uni.hideLeftWindow()
                }
                this.isOpen = !this.isOpen
            }
        }
    }
</script>

<style lang="scss">
    .navbar {
        height: 60px;
        width: 100%;
        box-sizing: border-box;
        border-bottom: 1px solid darken($top-window-bg-color, 8%);
        background-color: $top-window-bg-color;
        color: $top-window-text-color;
    }

    .flex-s {
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .p-t-20 {
        padding: 0 20px;
    }

    .logo-image {
        height: 30px;
    }

    .min-logo {
        height: 25px;
    }

    .logo-image image {
        max-width: 100%;
        max-height: 100%;
    }

    .top-window-right {
        font-size: 14px;
    }

    .top-window-right * {
        margin-left: 10px;
    }

    .logout:hover {
        color: $menu-text-color-actived;
    }

    .svg-icon {
        width: 1em;
        height: 1em;
        vertical-align: -.15em;
        fill: currentColor;
        overflow: hidden;
    }

    .debug {
        position: relative;
    }

    .debug-badge {
        position: absolute;
        top: 0;
        right: 10px;
        transform: translateY(-50%) translateX(100%) scale(0.8);
    }

    .modal {
        width: 100%;
        max-width: 980px;
        margin: 0 auto;
        background-color: #FFFFFF;
    }

    .modal-content {
        padding: 15px;
        height: 500px;
        box-sizing: border-box;
    }
    .repalce-select {
        position: absolute;
        right: 0;
        top: 50%;
        background-color: #fff;
        z-index: 1999;
    }
    .arrowdown {
        margin-top: 3px;
        margin-left: 3px;
    }
</style>
