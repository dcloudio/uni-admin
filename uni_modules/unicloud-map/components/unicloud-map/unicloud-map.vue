<template>
	<view class="unicloud-map">
		<map ref="map" :style="styleCom" :latitude="latitudeCom" :longitude="longitudeCom" :scale="scale" :min-scale="minScale" :max-scale="maxScale" :layer-style="layerStyle"
			:markers="markers" :polyline="polyline" :circles="circles" :controls="controls" :include-points="includePoints" :show-compass="showCompass"
			:enable-zoom="enableZoom" :enable-scroll="enableScroll" :enable-rotate="enableRotate" :enable-overlooking="enableOverlooking" :enable-satellite="enableSatellite"
			:enable-traffic="enableTraffic" :enable-poi="enablePoi" :enable-building="enableBuilding" :show-location="showLocation" :polygons="polygons"
			:enable-indoorMap="enableIndoorMap" @markertap="_markertap" @labeltap="_labeltap" @callouttap="_callouttap" @controltap="_controltap" @regionchange="_regionchange"
			@tap="_tap" @updated="_updated" @anchorpointtap="_anchorpointtap" @poitap="_poitap"></map>
	</view>
</template>

<script>
	
	let timeoutArr = [];
	let flagArr = [];
	let timeout = null;
	/**
	 * 节流函数
	 * 节流原理：在一定时间内，只能触发一次
	 */
	function throttle(fn, time = 500, isImmediate = true, timeoutName = "default") {
		if(!timeoutArr[timeoutName]) timeoutArr[timeoutName] = null;
		if (isImmediate) {
			if (!flagArr[timeoutName]) {
				flagArr[timeoutName] = true;
				// 如果是立即执行，则在time毫秒内开始时执行
				if(typeof fn === 'function') fn();
				timeoutArr[timeoutName] = setTimeout(() => {
					flagArr[timeoutName] = false;
				}, time);
			}
		} else {
			if (!flagArr[timeoutName]) {
				flagArr[timeoutName] = true;
				// 如果是非立即执行，则在time毫秒内的结束处执行
				timeoutArr[timeoutName] = setTimeout(() => {
					flagArr[timeoutName] = false;
					if(typeof fn === 'function') fn();
				}, time);
			}
		}
	};
	
	
	/**
	 * 防抖原理：一定时间内，只有最后一次操作，再过wait毫秒后才执行函数
	 */
	function debounce(func, wait = 500, immediate = false) {
		// 清除定时器
		if (timeout !== null) clearTimeout(timeout);
		// 立即执行，此类情况一般用不到
		if (immediate) {
			var callNow = !timeout;
			timeout = setTimeout(function() {
				timeout = null;
			}, wait);
			if (callNow) typeof func === 'function' && func();
		} else {
			// 设置定时器，当最后一次操作后，timeout不会再被清除，所以在延时wait毫秒后执行func回调方法
			timeout = setTimeout(function() {
				typeof func === 'function' && func();
			}, wait);
		}
	}
	
	/**
	 * unicloud-map
	 * @description 云端一体地图组件
	 * @property {String} loadtime = [auto|onready|manual] 数据加载时机
	 * 	@value auto 页面就绪后或属性变化后加载数据，默认为auto
	 * 	@value onready 页面就绪后不自动加载数据，属性变化后加载。适合在onready中接收上个页面的参数作为where条件时。
	 * 	@value manual 手动模式，不自动加载数据。需要手动调用refresh函数加载数据
	 * @property {Boolean} debug = [true|false] 是否开启调试模式
	 * @property {String} collection 表名
	 * @property {Object} where 查询条件
	 * @property {Number} poiMaximum = 100 最大poi显示数量
	 * @property {Number} poiMaxDistance 查询的最大距离
	 * @property {Number} poiMinDistance 查询的最小距离
	 * @property {Number|String} width 宽度
	 * @property {Number|String} height	高度
	 * @property {String} defaultIcon 默认的POI图标
	 * @property {Array} customIcons 自定义图标，根据POI的type来区分
	 * @property {String|Number} latitude 中心纬度
	 * @property {String|Number} longitude 中心经度
	 * @property {Number} scale 地图缩放等级，部分情况下会自动设置，此参数会失效
	 * @property {Number} minScale 最小缩放等级
	 * @property {Number} maxScale 最大缩放等级
	 * @property {String|Number} layerStyle 个性化地图
	 * @property {Boolean} showCompass 是否显示指南针
	 * @property {Boolean} enableZoom 是否支持缩放
	 * @property {Boolean} enableScroll 是否支持拖动
	 * @property {Boolean} enableRotate 是否支持旋转
	 * @property {Boolean} enableOverlooking 是否开启俯视
	 * @property {Boolean} enableSatellite 是否开启卫星图
	 * @property {Boolean} enableTraffic 是否开启实时路况
	 * @property {Boolean} enablePoi 是否展示地图的原生 POI 点
	 * @property {Boolean} enableBuilding 是否展示建筑物
	 * @property {Boolean} showLocation 显示带有方向的当前定位点
	 * @property {Array} polygons 多边形
	 * @property {Boolean} enableIndoorMap 是否展示室内地图
	 * @property {Function} poiTitleFormat 自定义poi标题的格式化函数		
	 * @event {Function} mounted 组件加载完成触发（此时不一定有数据）
	 * @event {Function} markertap 点击标记点时触发
	 * @event {Function} labeltap 点击label时触发
	 * @event {Function} callouttap 点击标记点对应的气泡时触发
	 * @event {Function} controltap 点击控件时触发
	 * @event {Function} regionchange 视野发生变化时触发
	 * @event {Function} tap 点击地图时触发; App-nvue、微信小程序2.9支持返回经纬度
	 * @event {Function} updated 在地图渲染更新完成时触发
	 * @event {Function} anchorpointtap 点击定位标时触发
	 * @event {Function} native-poitap 点击地图原生POI点时触发
	 * @event {Function} poitap 点击自定义POI点时触发
	 */
	
	export default {
		name: "unicloud-map",
		emits: ["mounted", "markertap", "labeltap","callouttap","controltap","regionchange","tap","updated","anchorpointtap","poitap","native-poitap" ],
		props: {
			debug: {
				type: Boolean,
				default: false
			},
			collection:{
				type: String,
				default: "opendb-poi"
			},
			// 数据加载时机
			loadtime:{
				type: String,
				default: "auto"
			},
			where: {
				type: Object
			},
			poiMaximum: {
				type: [String, Number],
				default: 100
			},
			poiMaxDistance: {
				type: Number
			},
			poiMinDistance: {
				type: Number
			},
			width: {
				type: [String, Number],
				default: 600
			},
			height: {
				type: [String, Number],
				default: 600
			},
			// 默认的POI图标
			defaultIcon:{
				type: String,
				default: "/static/location.png"
			},
			// 自定义图标，根据POI的type来区分
			customIcons:{
				type: Array,
				default: function(){
					return []
				}
			},
			// 纬度
			latitude: {
				type: [String, Number]
			},
			// 经度
			longitude: {
				type: [String, Number]
			},
			// 默认纬度
			defaultLatitude: {
				type: [String, Number],
				default: 39.908823
			},
			// 默认经度
			defaultLongitude: {
				type: [String, Number],
				default: 116.39747
			},
			scale: {
				type: Number,
				default: 16
			},
			minScale: {
				type: Number,
				default: 3
			},
			maxScale: {
				type: Number,
				default: 20
			},
			layerStyle: {
				type: [String, Number],
				default: 1
			},

			showCompass: {
				type: Boolean,
				default: false
			},
			enableZoom: {
				type: Boolean,
				default: true
			},
			enableScroll: {
				type: Boolean,
				default: true
			},
			enableRotate: {
				type: Boolean,
				default: false
			},
			enableOverlooking: {
				type: Boolean,
				default: false
			},
			enableSatellite: {
				type: Boolean,
				default: false
			},
			enableTraffic: {
				type: Boolean,
				default: false
			},
			enablePoi: {
				type: Boolean,
				default: true
			},
			enableBuilding: {
				type: Boolean,
				default: true
			},
			showLocation: {
				type: Boolean,
				default: true
			},
			polygons: {
				type: Array,
				default: function() {
					return []
				}
			},
			enableIndoorMap: {
				type: Boolean,
				default: false
			},
			poiTitleFormat: {
				type: Function,
			}
		},
		data() {
			return {
				// 标记点
				markers: [],
				// 路线
				polyline: [],
				// 圆
				circles: [],
				// 控件
				controls: [],
				// 缩放视野以包含所有给定的坐标点
				includePoints: [],
				// 当前pois列表数据
				pois:[],
				needIncludePoints: true,
				calcIncludePointsLastTime: 0
			};
		},
		mounted() {
			let { loadtime } = this;
			if (loadtime === "auto") {
				this.getCloudData();
			}
			this.$emit("mounted");
		},
		methods: {
			// 提供给外部调用
			async refresh(obj={}){
				return this.getCloudData(obj);
			},
			// 获取云端数据
			async getCloudData(obj={}){
				let {
					longitude: myLongitude,
					latitude: myLatitude,
					scale,
					needIncludePoints
				} = obj;
				
				let { 
					collection, 
					defaultIcon, 
					longitudeCom: longitude, 
					latitudeCom: latitude,
					showLocation,
				} = this;
				
				if (typeof myLongitude != "undefined" && typeof myLatitude != "undefined") {
					longitude = myLongitude;
					latitude = myLatitude;
				}
				
				if (this.debug) console.log('longitude, latitude: ', longitude, latitude)
				let geoNearJson = {};
				if (typeof this.poiMaxDistance === "number" && this.poiMaxDistance > 0) {
					geoNearJson.maxDistance = this.poiMaxDistance;
				}
				if (typeof this.poiMinDistance === "number" && this.poiMinDistance > 0) {
					geoNearJson.minDistance = this.poiMinDistance;
				}
				if (scale) {
					delete geoNearJson.maxDistance;
				}
				let where = {
					visible: true,
					...Object.assign({}, this.where) 
				};
				if (this.debug) console.log('geoNearJson: ', geoNearJson)
				if (this.debug) console.log('where: ', where)
				const db = uniCloud.database();
				let res = await db.collection(collection).aggregate()
					.geoNear({
						...geoNearJson,
						distanceField: 'distance', // 输出的每个记录中 distance 即是与给定点的距离
						spherical: true,
						near: new db.Geo.Point(longitude, latitude),
						query: where,
						key: 'location', // 若只有 location 一个地理位置索引的字段，则不需填
						includeLocs: 'location', // 若只有 location 一个是地理位置，则不需填
					})
					.sort({
						distance: 1,
					})
					.limit(Number(this.poiMaximum))
					.end();
					
				// 根据level手动排序
				
				if (this.debug) console.log('res.result.data: ', res.result.data)
				res.result.data.sort((a, b) => {
					let { level: levelA = 0 } = a;
					let { level: levelB = 0 } = b;
					return levelA - levelB;
				});
				this.pois = res.result.data;
				let markers = res.result.data.map((item, index) => {
					let data = {
						id: index,
						latitude: item.location.coordinates[1],
						longitude: item.location.coordinates[0],
						iconPath: this._getIcon(item),
						width: 30,
						height: 30,
						rotate: item.rotate || 0
					};
					if (item.title) {
						data.title = this._getPoiTitle(item);
						data.callout = {
							content: this._getPoiTitle(item),
							color: "#000000",
							fontSize: 12,
							borderRadius: 5,
							borderWidth: 1,
							borderColor: "#f8f8f8",
							bgColor: "#ffffff",
							padding: 4,
							display: "ALWAYS",
							textAlign: "center"
						};
					}
					return data;
				});
				if (this.debug) console.log('markers: ', markers)
				this.markers = markers;
				if (this.needIncludePoints || needIncludePoints) {
					this.calcIncludePoints();
				}
				// console.log('markers: ', markers)
				// console.log('res: ', res.result.data)
			},
			// 计算一组坐标的边界
			_calculateBounds(coordinates){
				if (!Array.isArray(coordinates) || coordinates.length === 0) {
					return [];
				}
				let minLongitude = coordinates[0].longitude;
				let maxLongitude = coordinates[0].longitude;
				let minLatitude = coordinates[0].latitude;
				let maxLatitude = coordinates[0].latitude;
			
				for (const coord of coordinates) {
					const { longitude, latitude } = coord;
			
					minLongitude = Math.min(minLongitude, longitude);
					maxLongitude = Math.max(maxLongitude, longitude);
					minLatitude = Math.min(minLatitude, latitude);
					maxLatitude = Math.max(maxLatitude, latitude);
				}
				let k = 0.002; // 额外偏移0.002，使所有坐标都在一屏中显示
				const southwest = { longitude: minLongitude-k, latitude: minLatitude-k };
				const northeast = { longitude: maxLongitude+k, latitude: maxLatitude+k };
			
				return [
					southwest,
					northeast
				]
			},
			getMarkers(){
				return this.markers;
			},
			setMarkers(markers){
				this.markers = markers;
			},
			getPolyline(){
				return this.polyline;
			},
			setPolyline(polyline){
				this.polyline = polyline;
				this.calcIncludePoints();
			},
			calcIncludePoints(){
				let { polyline=[], markers=[], calcIncludePointsLastTime = 0 } = this;
				// uni.showToast({
				// 	title: `${Date.now() - calcIncludePointsLastTime}`,
				// 	icon: "none"
				// })
				if (Date.now() - calcIncludePointsLastTime < 5000) {
					return;
				}
				
			
				let points = [];
				if (markers.length > 0) {
					let list = markers.map((item, index) => {
						return {
							latitude: item.latitude,
							longitude: item.longitude
						}
					});
					points = points.concat(list);
				}
				
				if (polyline.length > 0) {
					polyline.map((item, index) => {
						points = points.concat(item.points);
					});
				}
				if (points.length > 0) {
					this.includePoints = this._calculateBounds(points);
				} else {
					this.includePoints = [
						{
							latitude: this.latitude,
							longitude: this.longitude
						}
					];
				}
			},
			getCircles(){
				return this.circles;
			},
			setCircles(circles){
				this.circles = circles;
			},
			getControls(){
				return this.controls;
			},
			setControls(controls){
				this.controls = controls;
			},
			_getPoiTitle(poi={}){
				let { poiTitleFormat } = this;
				if (typeof poiTitleFormat === "function") {
					return poiTitleFormat(poi);
				} else {
					return poi.title;
				}
			},
			_getIcon(obj={}){
				let { type, icon } = obj;
				if (icon) {
					return icon;
				}
				let { customIcons=[], defaultIcon } = this;
				let findItem = customIcons.find((item) => {
					return item.type === type;
				});
				return findItem && findItem.icon ? findItem.icon : defaultIcon;
			},
			// 触发监听 - 点击poi
			_emitPoi(type, e){
				let markerId = e.detail.markerId;
				let poi = this.pois[markerId];
				e.poi = poi;
				this.$emit(type, e);
				this.$emit("poitap", e);
			},
			_markertap(e) {
				if (this.debug) console.log('markertap: ', e)
				this._emitPoi("markertap", e);
			},
			_callouttap(e) {
				if (this.debug) console.log('callouttap: ', e)
				this._emitPoi("callouttap", e);
			},
			_labeltap(e) {
				if (this.debug) console.log('labeltap: ', e)
				this.$emit("labeltap", e);
			}, 
			_controltap(e) {
				if (this.debug) console.log('controltap: ', e)
				this.$emit("controltap", e);
			},
			_regionchange(e) {
				if (this.debug) console.log('regionchange: ', e)
				this.$emit("regionchange", e);
				if (e.detail.causedBy === "gesture") {
					this.calcIncludePointsLastTime = Date.now();
				}
				if (e.detail.centerLocation) {
					const getCloudData = () =>{
						this.getCloudData({
							latitude: e.detail.centerLocation.latitude,
							longitude: e.detail.centerLocation.longitude,
							scale: e.detail.scale
						});
					}
					// 当用户手动拖动地图时，5秒内不再自动变更地图可视范围
					this.needIncludePoints = false;
					throttle(getCloudData, 2000);
				}
			},
			_tap(e) {
				if (this.debug) console.log('tap: ', e)
				this.$emit("tap", e);
			},
			_updated(e) {
				if (this.debug) console.log('updated: ', e)
				this.$emit("updated", e);
			},
			_anchorpointtap(e) {
				if (this.debug) console.log('anchorpointtap: ', e)
				this.$emit("anchorpointtap", e);
			},
			_poitap(e) {
				if (this.debug) console.log('poitap: ', e)
				this.$emit("native-poitap", e);
			}

		},
		watch: {
			whereWatchCom(){
				// 需要重新查询
				let { loadtime } = this;
				if (loadtime !== "manual") {
					let getCloudDataDebounce = () =>{
						this.refresh({
							needIncludePoints: true
						});
					}
					debounce(getCloudDataDebounce, 200);
				}
			}
		},
		computed: {
			whereWatchCom(){
				let { where, collection } = this;
				return JSON.stringify({ where, collection })
			},
			widthCom() {
				let { width } = this;
				return !isNaN(width) ? `${width}rpx` : width;
			},
			heightCom() {
				let { height } = this;
				return !isNaN(height) ? `${height}rpx` : height;
			},
			styleCom() {
				let {
					widthCom,
					heightCom
				} = this;
				let style = "";
				if (widthCom) {
					style += `width:${widthCom};`;
				}
				if (heightCom) {
					style += `height:${heightCom};`;
				}
				return style;
			},
			latitudeCom(){
				let { latitude, defaultLatitude } = this;
				return (latitude || latitude === 0) ? latitude : defaultLatitude;
			},
			longitudeCom(){
				let { longitude, defaultLongitude } = this;
				return (longitude || longitude === 0) ? longitude : defaultLongitude;
			}
		}
	}
</script>

<style lang="scss" scoped>
	
</style>