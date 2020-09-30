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
        onLaunch: function() {
            console.log('App Launch')
            if (!this.isTokenValid) {
                uni.navigateTo({
                    url: config.loginPageUrl
                })
            } else {
                this.init()
            }

            // const observer = uni.createMediaQueryObserver(this)
            // observer.observe({
            //     maxWidth: 
            // })
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
    /*每个页面公共css */
    page {
        background-color: #f8f8f8;
        font-size: 14px;
        padding: 30px 20px;
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
</style>
