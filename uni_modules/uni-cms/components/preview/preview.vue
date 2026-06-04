<template>
  <view class="article-preview-box">
    <view class="title">文章预览</view>
    <view class="sub-title">预览功能由<a class="link" href="https://ext.dcloud.net.cn/plugin?id=11701" target="_blank">uni-cms-article</a>插件提供，文章发布后预览功能将失效</view>
    <view class="close" @click="() => $emit('close')">
      <uni-icons type="closeempty" size="20px" class="icon"></uni-icons>
    </view>
    <template v-if="loading">
      <view class="loading">正在加载...</view>
    </template>
    <template v-else>
      <uni-row class="row" :gutter="40">
        <uni-col :span="8">
          <view class="col-title">预览密钥</view>
          <view class="col-content">
            <uni-easyinput disabled :value="previewSecret"></uni-easyinput>
          </view>
        </uni-col>
        <uni-col :span="16">
          <view class="col-title">预览页面地址</view>
          <view class="col-content">
            <uni-easyinput disabled :value="previewPagePath"></uni-easyinput>
            <view class="description"></view>
          </view>
        </uni-col>
      </uni-row>
      <uni-row class="row" :gutter="40">
        <uni-col :span="8">
          <view class="col-title">小程序/APP预览</view>
          <view class="col-content">
            <image :src="qrcode" mode="aspectFill" class="qrcode-img"></image>
            <view class="description">在搜索栏 - 扫一扫图标扫码查看</view>
          </view>
        </uni-col>
        <uni-col :span="16">
          <view class="col-title">网页预览</view>
          <view class="col-content">
            <uni-easyinput v-model="feDomain" placeholder="请输入uni-cms-article部署地址"></uni-easyinput>
            <button type="primary" size="mini" style="margin-top: 10px;" @click="goPreviewPage">预览</button>
          </view>
        </uni-col>
      </uni-row>
    </template>
  </view>
</template>

<script>
import loadScript from "@/uni_modules/uni-cms/common/load-script";

const db = uniCloud.database()


function randomString(e) {
  e = e || 32;
  let t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678!@$*",
      a = t.length,
      n = "";
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n
}

export default {
  name: "preview",
  props: {
    id: String
  },
  data () {
    return {
      previewPagePath: "uni_modules/uni-cms-article/pages/detail/preview",
      previewSecret: "",
      qrcode: "",
      feDomain: "",
      loading: true
    }
  },
  watch: {
    previewSecret () {
      this.createQrcode()
    }
  },
  mounted () {
    if (!this.id) {
      return uni.showModal({
        content: '文章ID不存在',
        showCancel: false
      })
    }

    this.initQrCode()
  },
  methods: {
    initQrCode () {
      loadScript('QRCode', 'https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js', async () => {
        await this.loadArticlePreviewSecret()
        this.loading = false
      })
    },
    async loadArticlePreviewSecret () {
      const {result} = await db.collection('uni-cms-articles').doc(this.id).field('is_admin,preview_secret,preview_expired').get({
        getOne: true
      })

      if (!result || !result.data) return

      let {preview_secret: previewSecret, preview_expired: previewExpired} = result.data

      if (!previewSecret || previewExpired < Date.now()) {
        previewSecret = randomString(16)
        await db.collection('uni-cms-articles').doc(this.id).update({
          preview_secret: previewSecret,
          preview_expired: Date.now() + (2 * 60 * 60 * 1000)
        })
      }

      this.previewSecret = previewSecret
    },
    createQrcode () {
      const previewQrcode = `internallink://${this.previewPagePath}?id=${this.id}&secret=${this.previewSecret}`
      window.QRCode.toDataURL(previewQrcode, {
        width: 180,
        margin: 2
      }).then(url => {
        this.qrcode = url
      })
    },
    goPreviewPage () {
      if (!this.feDomain) {
        return uni.showToast({
          icon: "none",
          title: "请输入前端网页托管地址"
        })
      }

      window.open(`${this.feDomain.replace(/\/$/, '')}/${this.previewPagePath}?id=${this.id}&secret=${this.previewSecret}`, '_blank')
    }
  }
}
</script>

<style scoped lang="scss">
.article-preview-box {
  color: #333;
  background: #FCFCFC;
  width: 570px;
  min-height: 300px;
  border-radius: 10px;
  padding: 20px;
  position: relative;
  .title {
    font-size: 22px;
  }
  .sub-title {
    font-size: 12px;
    color: #bbb;
    margin-top: 10px;
  }
  .row {
    border-bottom: #f2f2f2 solid 1px;
    margin-top: 20px;
    padding-bottom: 20px;
    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .col-title {
      font-size: 15px;
    }
    .col-content {
      margin-top: 8px;
      .description {
        font-size: 12px;
        color: #bbb;
        margin-top: 10px;
      }
    }
  }
}
.close {
  width: 30px;
  height: 30px;
  background: #f1f1f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2;
  cursor: pointer;
}
.qrcode-img {
  width: 180px;
  height: 180px;
}
.loading {
  margin-top: 50px;
  font-size: 15px;
  text-align: center;
}
.link {
  color: #333;
}
</style>
