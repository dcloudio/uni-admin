<script>
    import {
        mapGetters
    } from 'vuex'
    export default {
        computed: {
            ...mapGetters({
                isTokenValid: 'user/isTokenValid'
            })
        },
        onLaunch: function() {
            console.log('App Launch')
            if (!this.isTokenValid) {
                uni.navigateTo({
                    url: '/pages/login/login'
                })
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
    /*每个页面公共css */
    page {
        font-size: 14px;
    }
</style>
