<template>
    <view class="navbar">
        <!--TODO-->
        <view class="flex-s p-t-20">
            <image src="../static/user.png" mode=""></image>
            <view class="">
                <text class="logout" @click="logout">退出</text>️
            </view>
        </view>
    </view>
</template>

<script>
    import {
        mapMutations,
        mapState
    } from 'vuex'
    export default {
        data() {
            return {

            }
        },
        computed: {
            ...mapState({
                userInfo: 'user/userInfo'
            })
        },
        methods: {
            ...mapMutations({
                removeToken(commit) {
                    commit('user/REMOVE_TOKEN')
                }
            }),
            logout() {
                uniCloud.callFunction({
                    name: 'uni-admin',
                    data: {
                        action: 'user/logout'
                    }
                }).then(res => {
                    if (res.result.code) {
                        uni.showModal({
                            content: res.result.message || '退出失败',
                            showCancel: false
                        })
                        return
                    }
                    this.removeToken()
                    uni.reLaunch({
                        url: '/pages/login/login'
                    })
                }).catch(err => {
                    uni.showModal({
                        content: '登录失败：' + err.message,
                        showCancel: false
                    })
                })
            }
        }
    }
</script>

<style>
    .navbar {
        /* position: fixed;
		top: 0; */
        height: 60px;
        width: 100%;
        box-sizing: border-box;
        border-bottom: 1px solid #eaecef;
        background-color: #fff;
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

    .flex-s image {
        height: 35px;
        width: 35px;
    }

    .logout {
        margin-left: 10px;
        color: #999;
        font-size: 14px;
    }

    .logout:hover {
        color: #42B983;
    }
</style>
