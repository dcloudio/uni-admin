<template>
  <view class="page">
    <view class="container">
      <text class="noData" v-if="msgList.length === 0">没有对话记录</text>
      <scroll-view :scroll-into-view="scrollIntoView" scroll-y="true" class="msg-list" :enable-flex="true">
        <view v-for="(msg,index) in msgList" class="msg-item" :key="index">
          <view class="create_time-box">
            <uni-dateformat class="create_time" :date="msg.create_time" format="MM/dd hh:mm:ss"></uni-dateformat>
          </view>
          <view :class="{reverse:!msg.isAi}">
            <view class="userInfo">
              <image class="avatar" v-if="msg.isAi" :src="require('./static/uni-ai.png')"
                     mode="widthFix"></image>
              <image class="avatar" v-else :src="require('./static/avatar.png')"
                     mode="widthFix"></image>
            </view>
            <view class="content">
              <!-- <text class="copy" @click="copy">复制</text> -->
              <uni-ai-msg :md="msg.content"
                          :show-cursor="index == msgList.length-1 && msg.isAi && sseIndex"></uni-ai-msg>
              <view v-if="index == msgList.length-1 && adpid && msg.insufficientScore">
                <uni-ad-rewarded-video :adpid="adpid" @onAdClose="onAdClose"></uni-ad-rewarded-video>
              </view>
            </view>
            <uni-icons v-if="index == msgList.length-1 && !msg.isAi && msg.state != 100 && msgStateIcon(msg)"
                       @click="msg.state == -100 ? retriesSendMsg() : ''" :color="msg.state===0?'#999':'#d22'"
                       :type="msgStateIcon(msg)" class="msgStateIcon">
            </uni-icons>
          </view>
        </view>
        <view class="tip-ai-ing" v-if="msgList.length && msgList.length%2 !== 0">
          <text>uni-ai正在思考中...</text>
          <view v-if="NODE_ENV == 'development' && !stream">
            如需提速，请开通
            <uni-link class="uni-link" href="https://uniapp.dcloud.net.cn/uniCloud/uni-ai-chat.html"
                      text="[流式响应]"></uni-link>
          </view>
        </view>
        <view id="last-msg-item"></view>
      </scroll-view>

      <view class="foot-box">
        <view class="menu" v-if="isWidescreen">
          <view class="trash menu-item">
            <image @click="clear" src="./static/remove.png" mode="heightFix"></image>
          </view>
        </view>

        <view class="foot-box-content">
          <view v-if="!isWidescreen" class="trash">
            <uni-icons @click="clear" type="trash" size="24" color="#888"></uni-icons>
          </view>
          <view class="textarea-box">
						<textarea v-model="content" :cursor-spacing="15" class="textarea" :auto-height="!isWidescreen"
                      :disabled="inputBoxDisabled"
                      :placeholder="placeholderText" :maxlength="-1" placeholder-class="input-placeholder" @keyup.enter="beforeSendMsg"></textarea>
          </view>
          <view class="send-btn-box">
            <text v-if="isWidescreen" class="send-btn-tip">↵ 发送 / shift + ↵ 换行</text>
            <button @click="beforeSendMsg" :disabled="inputBoxDisabled || !content" class="send" type="primary">发送
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>

import uniAiMsg from "./components/uni-ai-msg/uni-ai-msg.vue";

let sseChannel = false;
// 是否通过回调，当用户点击清空后应当跳过前一次请求的回调
let skip_callback = false;
export default {
  components: {
    uniAiMsg
  },
  data() {
    return {
      scrollIntoView: "",
      msgList: [],
      content: "",
      sseIndex: 0,
      stream: true,
      isWidescreen: false,
      adpid: null
    }
  },
  computed: {
    inputBoxDisabled() {
      if (this.sseIndex !== 0) {
        return true
      }
      return !!(this.msgList.length && this.msgList.length % 2 !== 0)
    },
    placeholderText() {
      if (this.inputBoxDisabled) {
        return 'uni-ai正在回复中'
      } else {
        // #ifdef H5
        return window.innerWidth > 960 ? '请输入内容，ctrl + enter 发送' : '请输入要发给uni-ai的内容'
        // #endif
        return '请输入要发给uni-ai的内容'
      }
    },
    NODE_ENV() {
      return process.env.NODE_ENV
    }
  },
  watch: {
    msgList: {
      handler(msgList) {
        uni.setStorageSync('uni-ai-msg', msgList)
      },
      deep: true
    }
  },
  async mounted() {
    if (this.adpid && uniCloud.getCurrentUserInfo().tokenExpired > Date.now()) {
      let db = uniCloud.databaseForJQL();
      let res = await db.collection("uni-id-users")
          .where({
            "_id": uniCloud.getCurrentUserInfo().uid
          })
          .field('score')
          .get()
      console.log('当前用户有多少积分:', res.data[0] && res.data[0].score);
    }


    // let {score} = res.result.data[0] || {}
    // console.log('score',score);


    // for (let i = 0; i < 15; i++) {
    // 	this.msgList.push({
    // 		isAi: i % 2 == true,
    // 		content: "1-" + i
    // 	})
    // }

    this.msgList = uni.getStorageSync('uni-ai-msg') || []


    // 如果上一次对话中 最后一条消息ai未回复。则一启动就自动重发。
    let length = this.msgList.length
    if (length) {
      let lastMsg = this.msgList[length - 1]
      if (!lastMsg.isAi) {
        this.retriesSendMsg()
      }
    }


    // this.msgList.pop()
    // console.log('this.msgList', this.msgList);
    this.showLastMsg()

    // 添加惰性函数，检查是否开通uni-push;决定是否启用stream

    // #ifdef H5
    uni.createMediaQueryObserver(this).observe({
      minWidth: 650,
    }, matches => {
      this.isWidescreen = matches;
    })
    // #endif
  },
  // onUnload() {
  // 	if(sseChannel){
  // 		console.log('onUnload','sseChannel.close()');
  // 		sseChannel.close()
  // 	}
  // },
  methods: {
    //检查是否开通uni-push;决定是否启用stream
    async checkIsOpenPush() {
      try {
        await uni.getPushClientId()
        this.checkIsOpenPush = () => {
        }
      } catch (err) {
        this.stream = false
      }
    },
    updateLastMsg(param) {
      let length = this.msgList.length
      if (length === 0) {
        return
      }
      let lastMsg = this.msgList[length - 1]

      if (typeof param == 'function') {
        let callback = param;
        callback(lastMsg)
      } else {
        const [data, cover = false] = arguments
        if (cover) {
          lastMsg = data
        } else {
          lastMsg = Object.assign(lastMsg, data)
        }
      }
      this.msgList.splice(length - 1, 1, lastMsg)
    },
    onAdClose(e) {
      if (e.detail.isEnded) {
        //5次轮训查结果
        let i = 0;
        uni.showLoading({mask: true})
        let myIntive = setInterval(async e => {
          i++;
          const db = uniCloud.database();
          let res = await db.collection("uni-id-users")
              .where('"_id" == $cloudEnv_uid')
              .field('score')
              .get()
          let {score} = res.result.data[0] || {}
          // console.log("1111score----------*--",score);
          if (score > 0 || i > 5) {
            // console.log("22222score----------*--",score);
            clearInterval(myIntive)
            uni.hideLoading()
            if (score > 0) {
              // console.log("3333score----------*--",score);
              this.msgList.pop()
              this.$nextTick(() => {
                this.retriesSendMsg()
                uni.showToast({
                  title: '积分余额:' + score,
                  icon: 'none'
                });
              })
            }
          }
        }, 2000);
      }
    },
    async retriesSendMsg() {
      // 检查是否开通uni-push;决定是否启用stream
      await this.checkIsOpenPush()
      this.updateLastMsg({state: 0})
      this.send()
    },
    async beforeSendMsg() {
      // 如果开启了广告位需要登录
      if (this.adpid) {
        let token = uni.getStorageSync('uni_id_token')
        if (!token) {
          return uni.showModal({
            content: '启用激励视频，客户端需登录并启用安全网络',
            showCancel: false,
            confirmText: "查看详情",
            complete() {
              let url = "https://uniapp.dcloud.net.cn/uniCloud/uni-ai-chat.html#ad"
              // #ifndef H5
              uni.setClipboardData({
                data: url,
                showToast: false,
                success() {
                  uni.showToast({
                    title: '已复制文档链接，请到浏览器粘贴浏览',
                    icon: 'none',
                    duration: 5000
                  });
                }
              })
              // #endif
              // #ifdef H5
              window.open(url)
              // #endif
            }
          });
        }
      }


      // 检查是否开通uni-push;决定是否启用stream
      await this.checkIsOpenPush()

      if (!this.content) {
        return uni.showToast({
          title: '内容不能为空',
          icon: 'none'
        });
      }

      this.msgList.push({
        isAi: false,
        content: this.content,
        state: 0,
        create_time: Date.now()
      })
      this.showLastMsg()
      // 清空文本内容
      this.$nextTick(() => {
        this.content = ''
      })
      this.send()
    },
    async send() {
      let messages = []
      // 复制一份，消息列表数据
      let msgs = JSON.parse(JSON.stringify(this.msgList))
      // 带总结的消息 index
      let findIndex = [...msgs].reverse().findIndex(item => item.summarize)
      // console.log('findIndex', findIndex)
      if (findIndex != -1) {
        let aiSummaryIndex = msgs.length - findIndex - 1
        // console.log('aiSummaryIndex', aiSummaryIndex)
        msgs[aiSummaryIndex].content = msgs[aiSummaryIndex].summarize
        // 拿最后一条带直接的消息作为与ai对话的msg body
        msgs = msgs.splice(aiSummaryIndex, msgs.length - 1)
      } else {
        // 如果未总结过就直接从末尾拿10条
        msgs = msgs.splice(-10)
      }

      // 过滤涉敏问题
      msgs = msgs.filter(msg => !msg.illegal)

      messages = msgs.map(item => {
        let role = "user"
        if (item.isAi) {
          role = item.summarize ? 'system' : 'assistant'
        }
        return {
          content: item.content,
          role
        }
      })

      if (this.stream) {
        sseChannel = new uniCloud.SSEChannel() // 创建消息通道
        // console.log('sseChannel',sseChannel);
        sseChannel.on('message', (message) => { // 监听message事件
          // console.log('on message', message);
          if (this.sseIndex === 0) {
            this.msgList.push({
              isAi: true,
              content: message,
              create_time: Date.now()
            })
            this.showLastMsg()
          } else {
            this.updateLastMsg(lastMsg => {
              lastMsg.content += message
            })
            this.showLastMsg()
          }
          this.sseIndex++
        })
        sseChannel.on('end', (e) => { // 监听end事件，如果云端执行end时传了message，会在客户端end事件内收到传递的消息
          // console.log('on end', e);
          if (e && (e.summarize || e.insufficientScore)) {
            this.updateLastMsg(lastMsg => {
              if (e.summarize) {
                lastMsg.summarize = e.summarize
              } else if (e.insufficientScore) {
                lastMsg.insufficientScore
              }
            })
          }
          this.sseIndex = 0
          this.showLastMsg()
        })
        await sseChannel.open() // 等待通道开启
      }

      skip_callback = false
      const uniAiChat = uniCloud.importObject("uni-ai-chat", {
        customUI: true
      })
      uniAiChat.send({
        messages,
        sseChannel
      })
          .then(res => {
            this.updateLastMsg({state: 100})
            if (!sseChannel) {
              // console.log(res, res.reply);
              // 判断长度，防止请求未返回时，历史对话已被清空。引起对话顺序错误 导致 对话输入框卡住
              if (!skip_callback) {
                let {"reply": content, summarize, insufficientScore, illegal} = res.data
                if (illegal) {
                  this.updateLastMsg({illegal: true})
                }
                this.msgList.push({
                  create_time: Date.now(),
                  isAi: true,
                  content,
                  summarize,
                  insufficientScore,
                  illegal
                })
                this.showLastMsg()
              } else {
                console.log('用户点击了清空按钮，跳过前一次请求的回调', res.data.reply);
              }
            }
          })
          .catch(e => {
            console.log(e);
            let l = this.msgList.length
            console.log(l, this.msgList[l - 1]);
            if (l && sseChannel && this.msgList[l - 1].isAi) {
              this.sseIndex = 0
            }

            this.updateLastMsg({state: -100})
            uni.showModal({
              content: JSON.stringify(e.message),
              showCancel: false
            });
          })
    },
    showLastMsg() {
      this.$nextTick(() => {
        this.scrollIntoView = "last-msg-item"
        this.$nextTick(() => {
          this.scrollIntoView = ""
        })
      })
    },
    msgStateIcon(msg) {
      switch (msg.state) {
        case 0:
          //	发送中
          return 'spinner-cycle'
          break;
        case -100:
          //	发送失败
          return 'refresh-filled'
          break;
        case -200:
          //	禁止发送（内容不合法）
          return 'info-filled'
          break;
        default:
          return false
          break;
      }
    },
    clear() {
      uni.showModal({
        title: "确认要清空聊天记录？",
        content: '本操作不可撤销',
        complete: (e) => {
          if (e.confirm) {
            if (sseChannel) {
              sseChannel.close()
            }
            skip_callback = true
            this.sseIndex = 0
            this.msgList = []
          }
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
/* #ifdef VUE3 && APP-PLUS */
@import "@/uni_moduels/uni-cms/components/ai/components/uni-ai-msg/uni-ai-msg.scss";
/* #endif */

/* #ifndef APP-NVUE */
view,
textarea,
button,
.page {
  display: flex;
  box-sizing: border-box;
}

/* #endif */


/* #ifndef APP-NVUE */
page,
  /* #endif */
.page,
.container {
  background-color: #efefef;

  /* #ifdef APP-NVUE */
  flex: 1;
  /* #endif */

  /* #ifndef APP-NVUE */
  height: 100vh;
  /* #endif */

  /* #ifdef H5 */
  height: calc(100vh - 44px);
  /* #endif */

  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* #ifndef APP-NVUE */
.container {
  background-color: #FAFAFA;
}

/* #endif */

.foot-box {
  width: 750 rpx;
  display: flex;
  flex-direction: column;
  padding: 10px 0px;
  background-color: #FFF;
}

.foot-box-content {
  justify-content: space-around;
}

.textarea-box {
  padding: 8px 10px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.textarea-box .textarea {
  max-height: 100px;
  font-size: 14px;
  /* #ifndef APP-NVUE */
  overflow: auto;
  /* #endif */
  width: 450 rpx;
}

/* #ifdef H5 */
/*隐藏滚动条*/
.textarea-box .textarea::-webkit-scrollbar {
  width: 0;
}

/* #endif */

.input-placeholder {
  color: #bbb;
}

.trash,
.send {
  width: 50px;
  height: 30px;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.trash {
  width: 30 rpx;
  margin-left: 10 rpx;
}

.send {
  color: #FFF;
  border-radius: 4px;
  display: flex;
  margin: 0;
  padding: 0;
  font-size: 14px;
  margin-right: 20 rpx;
}

/* #ifndef APP-NVUE */
.send::after {
  display: none;
}

/* #endif */


.msg-list {
  flex: 1;
  height: 1px;
  width: 750 rpx;
}

.userInfo {
  flex-direction: column;
}

.msg-item {
  position: relative;
  width: 750 rpx;
  flex-direction: column;
  padding: 15px;
}

.msgStateIcon {
  position: relative;
  top: 5px;
  right: 5px;
  align-self: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 2px;
}

.create_time {
  font-size: 12px;
  padding: 5px 0;
  padding-top: 0;
  color: #aaa;
  text-align: center;
  width: 750 rpx;
  /* #ifdef MP */
  display: flex;
  /* #endif */
  justify-content: center;
}

.content {
  /* #ifndef APP-NVUE */
  max-width: 550 rpx;
  /* #endif */
  background-color: #FFF;
  border-radius: 5px;
  padding: 12px 10px;
  margin-left: 10px;
  /* #ifndef APP-NVUE */
  word-break: break-all;
  user-select: text;
  cursor: text;
  /* #endif */
}

/* #ifndef APP-NVUE */
.content {
  display: inline;
}

.content ::v-deep rich-text {
  max-width: 550 rpx;
  overflow: auto;
}

/* #endif */

/* #ifdef H5 */
.content * {
  display: inline;
}

/* #endif */

.reverse {
  flex-direction: row-reverse;
}

.reverse .content {
  margin-left: 0;
  margin-right: 10px;
}

.reverse-align {
  align-items: flex-end;
}

.noData {
  margin-top: 15px;
  text-align: center;
  width: 750 rpx;
  color: #aaa;
  font-size: 12px;
  justify-content: center;
}

.tip-ai-ing {
  align-items: center;
  flex-direction: column;
  font-size: 14px;
  color: #919396;
  padding: 15px 0;
}

.uni-link {
  margin-left: 5px;
  line-height: 20px;
}

/* #ifdef H5 */
@media screen and (min-width: 650px) {
  .foot-box {
    border-top: solid 1px #dde0e2;
  }
  //.page {
  //  width: 100vw;
  //  flex-direction: row;
  //}
  .page * {
    max-width: 950px;
  }

  .container, {
    box-shadow: 0 0 5px #e0e1e7;
    margin-top: 44px;
    border-radius: 10px;
    overflow: hidden;
  }

  .container .header {
    height: 44px;
    line-height: 44px;
    border-bottom: 1px solid #F0F0F0;
    width: 100vw;
    justify-content: center;
    font-weight: 500;
  }

  .content {
    background-color: #f9f9f9;
    position: relative;
    max-width: 90%;
  }
  // .copy {
  // 	color: #888888;
  // 	position: absolute;
  // 	right: 8px;
  // 	top: 8px;
  // 	font-size: 12px;
  // 	cursor:pointer;
  // }
  // .copy :hover{
  // 	color: #4b9e5f;
  // }

  .foot-box,
  .foot-box-content,
  .msg-list,
  .msg-item,
    // .create_time,
  .noData,
  .textarea-box,
  .textarea,
  textarea-box {
    width: 100% !important;
  }

  .create_time-box {
    margin-top: 15px;
    justify-content: center;
  }

  .textarea-box,
  .textarea,
  textarea,
  textarea-box {
    height: 120px;
  }

  .container,
  .foot-box,
  .textarea-box {
    background-color: #FFF;
  }

  .foot-box-content {
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 0;
  }

  .menu {
    padding: 0 10px;
  }
  .menu-item {
    height: 20px;
    justify-content: center;
    align-items: center;
    align-content: center;
    display: flex;
    margin-right: 10px;
    cursor: pointer;
  }
  .trash {
    opacity: 0.8;
  }
  .trash image {
    height: 15px;
  }


  .textarea-box, .textarea-box * {
    // border: 1px solid #000;
  }

  .send-btn-box .send-btn-tip {
    color: #919396;
    margin-right: 8px;
    font-size: 12px;
    line-height: 28px;
  }
}

/* #endif */

@media screen and (max-width: 768px) {
  .page {
    height: 75vh;
  }
  .foot-box {
    padding: 10px;
  }
  .foot-box, .msg-list, .container, .create_time {
    width: 100%;
  }
  .foot-box-content {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .textarea-box {
    flex: 1;
    .textarea {
      flex: 1;
      width: auto;
    }
  }

}
</style>
