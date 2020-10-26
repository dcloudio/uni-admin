<template>
    <scroll-view class="sidebar" scroll-y="true">
        <template v-if="inited">
            <uni-nav-menu :active="active" activeTextColor="#409eff" @select="select">
				<uni-menu-sidebar :data="navMenu"></uni-menu-sidebar>
				<uni-menu-sidebar :data="staticMenu"></uni-menu-sidebar>
            </uni-nav-menu>
        </template>
    </scroll-view>
</template>

<script>
    import {
        mapState,
        mapActions
    } from 'vuex'
    import config from '@/admin.config.js'
    export default {
        data() {
            return {
                ...config.sideBar,
				defaultValue:''
            }
        },
        computed: {
            ...mapState('app', ['inited', 'navMenu','active'])
        },
        watch: {
            $route: {
                immediate: true,
                handler(newRoute, oldRoute) {
                    this.changeMenuActive(newRoute.path)
                }
            }
        },
        methods: {
            ...mapActions({
                changeMenuActive: 'app/changeMenuActive'
            }),
			select(url){
				if(!url) {
					url = this.active
				}
				this.clickMenuItem(url)
			},
			clickMenuItem(url) {
				// #ifdef H5
				if (url.indexOf('http') === 0) {
					return window.open(url)
				}
				// #endif
				// TODO 后续要调整
				uni.redirectTo({
					url: url,
					fail() {
						uni.showModal({
							title: '提示',
							content: '页面 ' + url + ' 跳转失败',
							showCancel: false
						})
					}
				})
			},
        }
    }
</script>

<style lang="scss">
    .sidebar {
        position: fixed;
        top: var(--window-top);
        width: 240px;
        height: calc(100vh - (var(--window-top)));
        box-sizing: border-box;
        border-right: 1px solid darken($left-window-bg-color, 8%);
        background-color: $left-window-bg-color;
        padding-bottom: 10px;
    }

    .title {
        margin-left: 5px;
    }
</style>
