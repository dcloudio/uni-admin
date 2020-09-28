<script>
    import {
        mapGetters,
        mapMutations,
        mapActions
    } from 'vuex'
    export default {
        computed: {
            ...mapGetters({
                isTokenValid: 'user/isTokenValid'
            })
        },
        methods: {
            ...mapMutations({
                setNavMenu(commit, navMenu) {
                    commit('app/SET_NAV_MENU', navMenu)
                },
                setUserInfo(commit, navMenu) {
                    commit('user/SET_USER_INFO', navMenu)
                }
            }),
            ...mapActions({
                init: 'app/init'
            })
        },
        onLaunch: function() {
            console.log('App Launch')
            if (!this.isTokenValid) {
                uni.navigateTo({
                    url: '/pages/login/login'
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
    /*每个页面公共css */
    page {
        font-size: 14px;
    }
</style>
