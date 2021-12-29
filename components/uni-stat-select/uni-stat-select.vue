<template>
	<view>
		<uni-combox :candidates="renderData" v-model="current" :placeholder="placeholder" />
	</view>
</template>

<script>
	export default {
		name: "uni-stat-select",
		data() {
			return {
				current: '',
				renderData: [],
				apps: [],
				channels: []
			};
		},
		props: {
			mode: {
				type: String,
				default: ''
			},
			data: {
				type: Array,
				default () {
					return []
				}
			},
			placeholder: {
				type: String,
				default: '请选择'
			}
		},
		watch: {
			mode: {
				immediate: true,
				handler(val) {
					if (val === 'app') {
						this.getApps()
					} else if (val === 'channel') {
						this.getChannels()
					} else {
						this.renderData = this.data
					}
				}
			},
			current(val) {
				let id
				if (this.mode === 'app') {
					this.apps.forEach(a => {
						if (a.name === val) {
							id = a._id
						}
					})
				} else if (this.mode === 'channel') {
					this.channels.forEach(channel => {
						if (channel.channel_name === val) {
							id = channel._id
						}
					})
				} else {
					id = val
				}
				this.change(id)
			}
		},
		methods: {
			change(e) {
				this.$emit('change', e)
				this.$emit('input', e)
			},
			getApps() {
				const db = uniCloud.database()
				const apps = db.collection('opendb-app-list').field('appid, name').get().then(res => {
					this.apps = res.result.data
					this.renderData = res.result.data.map(item => item.name)
					// this.renderData.unshift('全部')
				})
			},
			getChannels() {
				const db = uniCloud.database()
				const channels = db.collection('uni-stat-app-channels').get().then(res => {
					this.channels = res.result.data
					this.renderData = res.result.data.map(item => item.channel_name)
				})
				console.log('...........', this.renderData);
			}
		}
	}
</script>

<style>

</style>
