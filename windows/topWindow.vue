<template>
    <view class="navbar">
        <view class="flex-s p-t-20">
            <view class="logo-image">
                <image :src="logo" mode="heightFix"></image>
            </view>
            <view class="flex-s top-window-right">
                <uni-link v-for="link in links" :key="link.url" :href="link.url" :text="link.text" />
                <text class="user">{{userInfo.username}}</text>️
                <text v-if="userInfo.username" class="logout pointer" @click="logout">退出</text>️
            </view>
        </view>
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
                ...config.navBar
            }
        },
        computed: {
            ...mapState('user', ['userInfo'])
        },
        methods: {
            ...mapMutations({
                removeToken(commit) {
                    commit('user/REMOVE_TOKEN')
                }
            }),
            logout() {
                this.$http('user/logout')
                    .then(res => {
                        this.removeToken()
                        uni.reLaunch({
                            url: config.login.url
                        })
                    }).catch(err => {

                    })
            }
        }
    }
</script>

<style lang="scss">
    .navbar {
        /* position: fixed;
		top: 0; */
        height: 60px;
        width: 100%;
        box-sizing: border-box;
        // border-bottom: 1px solid #eaecef;
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
        height: 40px;
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
</style>
