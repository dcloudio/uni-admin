<template>
    <view class="navbar">
        <!--TODO-->
        <view class="flex-s p-t-20">
            <view class="">
            </view>
            <view class="flex-s">
                <text class="user">{{userInfo.username}}</text>️
                <image src="../static/user.png" mode=""></image>
                <text v-if="userInfo.username" class="logout clickable-hand" @click="logout">退出</text>️
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
                            url: '/pages/login/login'
                        })
                    }).catch(err => {

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
    .user {
        color: #999;
        font-size: 14px;
        padding-right: 10px;
    }
</style>
