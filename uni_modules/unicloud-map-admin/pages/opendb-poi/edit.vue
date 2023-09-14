<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind" :labelWidth="80" labelAlign="right">
			<uni-forms-item name="category" label="分类">
				<uni-easyinput placeholder="分类" v-model="formData.category"></uni-easyinput>
				<view class="uni-form-item-tips">可用于区分显示在不同的场景地图下</view>
			</uni-forms-item>
			<uni-forms-item name="type" label="类型">
				<uni-easyinput placeholder="类型" v-model="formData.type"></uni-easyinput>
				<view class="uni-form-item-tips">POI类型，可根据type自动匹配对应的icon，支持直接输入中文，如配送员、网约车、景点、总部、门店等等</view>
			</uni-forms-item>
			<uni-forms-item name="icon" label="图标">
			  <uni-easyinput placeholder="图标路径" v-model="formData.icon"></uni-easyinput>
				<view class="uni-form-item-tips">支持本地绝对路径或https网络路径，建议使用本地绝对路径，如果传了icon则不再根据类型匹配icon</view>
			</uni-forms-item>
      <uni-forms-item name="location" label="地理位置" :required="true">
      	<button @click="chooseLocation" size="mini"> {{ formData.location && formData.location.type ? '已选择':'点击选择地理位置'}}</button>
      	<map v-if="formData.location && formData.location.type" :longitude="formData.location.coordinates[0]" :latitude="formData.location.coordinates[1]" style="width: 570px;height: 300px;margin-top: 10px;" :markers="markers"></map>
      </uni-forms-item>
      <uni-forms-item name="title" label="名称" :required="true">
        <uni-easyinput placeholder="名称" v-model="formData.title"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="address" label="地址">
        <uni-easyinput placeholder="地址" v-model="formData.address"></uni-easyinput>
      </uni-forms-item>
			<uni-forms-item name="tel" label="电话">
			  <uni-easyinput placeholder="电话" v-model="formData.tel"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item name="visible" label="是否显示">
			  <switch @change="binddata('visible', $event.detail.value)" :checked="formData.visible"></switch>
			</uni-forms-item>
      <!-- <uni-forms-item name="province" label="省">
        <uni-easyinput placeholder="省" v-model="formData.province"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="city" label="市">
        <uni-easyinput placeholder="市" v-model="formData.city"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="district" label="区/县">
        <uni-easyinput placeholder="区/县" v-model="formData.district"></uni-easyinput>
      </uni-forms-item> -->
      <view class="uni-button-group">
        <button type="primary" class="uni-button" style="width: 100px;" @click="submit">提交</button>
        <navigator open-type="navigateBack" style="margin-left: 15px;">
          <button class="uni-button" style="width: 100px;">返回</button>
        </navigator>
      </view>
    </uni-forms>
  </view>
</template>

<script>
  import { validator } from '@/uni_modules/unicloud-map-admin/validator/opendb-poi.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'opendb-poi';

  function getValidator(fields) {
    let result = {}
    for (let key in validator) {
      if (fields.includes(key)) {
        result[key] = validator[key]
      }
    }
    return result
  }



  export default {
    data() {
      let formData = {
        "visible": null,
        "location": null,
        "title": "",
        "tel": "",
        "icon": "",
        "address": "",
				"type": "",
				"category": ""
        // "province": "",
        // "city": "",
        // "district": ""
      }
      return {
        formData,
        formOptions: {},
        rules: {
          ...getValidator(Object.keys(formData))
        }
      }
    },
    onLoad(e) {
      if (e.id) {
        const id = e.id
        this.formDataId = id
        this.getDetail(id)
      }
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
    },
    methods: {
			chooseLocation(){
				let data = {};
				if (this.formData.location && this.formData.location.coordinates) {
					data.longitude = this.formData.location.coordinates[0];
					data.latitude = this.formData.location.coordinates[1];
				}
				this.formData.location = {};
				uni.chooseLocation({
					...data,
					success: (res) => {
						// 高德地图需要强制延迟下
						setTimeout(() => {
							this.formData.location = {
								type: "Point",
								coordinates: [
										res.longitude,
										res.latitude
								]
							};
							this.formData.title = res.name;
							this.formData.address = res.address;
							console.log('res: ', res)
						}, 300);
					}
				});
			},

      /**
       * 验证表单并提交
       */
      submit() {
        uni.showLoading({
          mask: true
        })
        this.$refs.form.validate().then((res) => {
          return this.submitForm(res)
        }).catch(() => {
        }).finally(() => {
          uni.hideLoading()
        })
      },

      /**
       * 提交表单
       */
      submitForm(value) {
        // 使用 clientDB 提交数据
        return db.collection(dbCollectionName).doc(this.formDataId).update(value).then((res) => {
          uni.showToast({
            title: '修改成功'
          })
          this.getOpenerEventChannel().emit('refreshData')
          setTimeout(() => uni.navigateBack(), 500)
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        })
      },

      /**
       * 获取表单数据
       * @param {Object} id
       */
      getDetail(id) {
        uni.showLoading({
          mask: true
        })
        db.collection(dbCollectionName).doc(id).field("visible,location,title,tel,category,type,icon,rotate, level,address,province,city,district,create_date").get().then((res) => {
          const data = res.result.data[0]
          if (data) {
            this.formData = data

          }
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        }).finally(() => {
          uni.hideLoading()
        })
      }
    },
		computed:{
			markers(){
				if (this.formData.location && this.formData.location.coordinates) {
					return [
						{
							id: 1,
							longitude: this.formData.location.coordinates[0],
							latitude: this.formData.location.coordinates[1],
							title: this.formData.title,
							iconPath: "/static/location.png",
							callout: {
								content: this.formData.title,
								color: "#000000",
								fontSize: 12,
								borderRadius: 5,
								borderWidth: 1,
								borderColor: "#ffffff",
								bgColor: "#ffffff",
								padding: 6,
								display: "ALWAYS"
							}
						}
					];
				} else {
					return [];
				}
			}
		}
  }
</script>
