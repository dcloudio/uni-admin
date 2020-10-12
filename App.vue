<script>
    import {
        mapGetters,
        mapActions
    } from 'vuex'
    import config from '@/admin.config.js'
    export default {
        computed: {
            ...mapGetters({
                isTokenValid: 'user/isTokenValid'
            })
        },
        methods: {
            ...mapActions({
                init: 'app/init'
            })
        },
        onPageNotFound(msg) {
            uni.redirectTo({
                url: config.error.url
            })
        },
        onLaunch: function() {
            console.log('App Launch')
            if (!this.isTokenValid) {
                uni.navigateTo({
                    url: config.login.url
                })
            } else {
                this.init()
            }
        },
        onShow: function() {
            console.log('App Show')
        },
        onHide: function() {
            console.log('App Hide')
        }
    }
</script>

<style>
    body,
    html {
        -webkit-user-select: auto;
        user-select: auto;
    }

    .uni-app--showleftwindow uni-main {
        position: relative;
        background-color: #f5f5f5;
    }

    .uni-app--showleftwindow uni-page-wrapper {
        position: absolute;
        width: 100%;
        top: 0;
        bottom: 0;
        padding: 15px;
        overflow-y: auto;
        box-sizing: border-box;
        background-color: #F5F5F5;
    }

    .uni-app--showleftwindow uni-page-body {
        width: 100%;
        min-height: 100%;
        box-sizing: border-box;
        border-radius: 5px;
        box-shadow: -1px -1px 5px 0 rgba(0, 0, 0, .1);
        background-color: #fff;
    }

    .pointer {
        cursor: pointer;
    }

    .flex-common {
        display: flex;
    }

    .flex-cc {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .flex-cl {
        display: flex;
        align-items: center;
        justify-content: left;
    }

    .flex-c-between {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .flex-column {
        display: flex;
        flex-direction: column;
    }

    .flex-end {
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    .m-b-30 {
        margin-bottom: 30px;
    }

    .login-title {
        font-size: 24px;
        color: #333;
    }

    .p-lr-0 {
        padding-left: 0;
        padding-right: 0;
    }

    .uni-top-window {
        z-index: 998;
        overflow: visible;
    }
</style>
