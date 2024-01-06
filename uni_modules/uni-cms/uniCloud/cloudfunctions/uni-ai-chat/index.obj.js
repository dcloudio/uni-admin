// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const {safeRequire, checkContentSecurityEnable} = require('./utils')
const createConfig = safeRequire('uni-config-center')
const config = createConfig({
  pluginId: 'uni-ai-chat'
}).config()
const db = uniCloud.database();
// const userscollection = db.collection('uni-id-users')
// const uniIdCommon = require('uni-id-common')


function getCurrentDateTimestamp (date = Date.now(), targetTimezone = 8) {
  const oneHour = 60 * 60 * 1000
  return parseInt((date + targetTimezone * oneHour) / (24 * oneHour)) * (24 * oneHour) - targetTimezone * oneHour
}

async function checkLimit () {
  const ipLimit = 5 // 每个IP每日限制10次
  const userLimit = 2 // 每个用户(token)每小时限制3次

  const aiChatLimitDB = db.collection('ai-chat-limit')
  const {clientIP} = this.getClientInfo()

  const res = await aiChatLimitDB.where({
    ip: clientIP
  }).get()

  const result = res.data && res.data[0] || {}
  const today = getCurrentDateTimestamp() + (24 * 60 * 60 * 1000)

  if (result.send_count >= ipLimit && Date.now() < today) {
    throw {
      errCode: 'limit',
      errMsg: "今日 uni-ai-chat 对话已达上限，请明天尝试对话"
    }
  }

  const currentUserToken = this.getUniIdToken()
  const userRecord = (result.tokens || []).find(token => currentUserToken === token.token)
  const oneHour = Date.now() - (60 * 60 * 1000)

  if (userRecord && userRecord.send_count >= userLimit && userRecord.last_send_date >= oneHour) {
    throw {
      errCode: 'limit',
      errMsg: `每位登录用户一小时可对话${userLimit}次，当前已达上限，请一小时后尝试对话`
    }
  }

  if (result._id) {
    await aiChatLimitDB.doc(result._id).update({
      send_count: result.send_count >= ipLimit ? 1: db.command.inc(1),
      tokens: db.command.push(!userRecord ? [
        {
          token: currentUserToken,
          send_count: 1,
          last_send_date: Date.now()
        }
      ]: []),
      last_send_date: Date.now()
    })

    userRecord && await aiChatLimitDB.where({
      'tokens.token': currentUserToken,
    }).update({
      'tokens.$.send_count': userRecord.send_count >= userLimit ? 1: db.command.inc(1),
      'tokens.$.last_send_date': Date.now()
    })
  } else {
    await aiChatLimitDB.add({
      ip: clientIP,
      send_count: 1,
      tokens: [
        {
          token: currentUserToken,
          send_count: 1,
          last_send_date: Date.now()
        }
      ],
      last_send_date: Date.now()
    })
  }
}

module.exports = {
  _before: async function () {
    // 这里是云函数的前置方法，你可以在这里加入你需要逻辑，比如：
    /*
      例如：使用uni-id-pages（链接地址：https://ext.dcloud.net.cn/plugin?id=8577）搭建账户体系。
      然后再使用uni-id-common的uniIdCommon.checkToken判断用户端身份，验证不通过你可以直接`throw new Error(“token无效”)`抛出异常拦截访问。
      如果验证通过了可以获得用户id，可以记录每一个用户id的调用次数来限制，调用多少次后必须充值（推荐用uni-pay，下载地址：https://ext.dcloud.net.cn/plugin?id=1835）
      或者看一个激励视频广告（详情：https://uniapp.dcloud.net.cn/uni-ad/ad-rewarded-video.html）后才能继续使用
      *** 激励视频是造富神器。行业经常出现几个人的团队，月收入百万的奇迹。 ***
    */

    // ::TODO 演示站用
    // await checkLimit.call(this)

    if (this.getMethodName() == 'send') {
      // 从配置中心获取是否需要销毁积分
      // if(config.spentScore){
      //
      // 	/*先校验token（用户身份令牌）是否有效，并获得用户的_id*/
      // 	// 获取客户端信息
      // 	this.clientInfo = this.getClientInfo()
      // 	// console.log(this.clientInfo);
      //
      // 	// 定义uni-id公共模块对象
      // 	this.uniIdCommon = uniIdCommon.createInstance({
      // 		clientInfo: this.clientInfo
      // 	})
      // 	let res = await this.uniIdCommon.checkToken(this.clientInfo.uniIdToken)
      // 	if (res.errCode) {
      // 		// 如果token校验出错，则抛出错误
      // 		throw res
      // 	}else{
      // 		// 通过token校验则，拿去用户id
      // 		this.current_uid = res.uid
      // 	}
      // 	/* 判断剩余多少积分：拒绝对话、扣除配置的积分数 */
      // 	let {data:[{score}]} = await userscollection.doc(this.current_uid).field({'score':1}).get()
      // 	console.log('score----',score);
      // 	if(score == 0 || score < 0){ //并发的情况下可能花超过
      // 		throw "insufficientScore"
      // 	}
      // 	await userscollection.doc(this.current_uid)
      // 		.update({
      // 			score:db.command.inc(-1 * config.spentScore)
      // 		})
      // }

      // 从配置中心获取内容安全配置
      console.log('config.contentSecurity', config.contentSecurity);
      if (config.contentSecurity) {
        const UniSecCheck = safeRequire('uni-sec-check')
        const uniSecCheck = new UniSecCheck({
          provider: 'mp-weixin',
          requestId: this.getUniCloudRequestId()
        })
        this.textSecCheck = async (content) => {
          let {sseChannel} = this.getParams()[0] || {}
          if (sseChannel) {
            throw {
              errSubject: 'uni-ai-chat',
              errCode: "sec-check",
              errMsg: "流式响应模式，内容安全识别功能无效"
            }
          }
          // 检测文本
          const checkRes = await uniSecCheck.textSecCheck({
            content,
            // openid,
            scene: 4,
            version: 1 //后续：支持微信登录后，微信小程序端 改用模式2 详情：https://uniapp.dcloud.net.cn/uniCloud/uni-sec-check.html#%E4%BD%BF%E7%94%A8%E5%89%8D%E5%BF%85%E7%9C%8B
          })
          console.log('checkRes检测文本', checkRes);
          if (checkRes.errCode === uniSecCheck.ErrorCode.RISK_CONTENT) {
            console.error({
              errCode: checkRes.errCode,
              errMsg: '文字存在风险',
              result: checkRes.result
            });
            throw "uni-sec-check:illegalData"
          } else if (checkRes.errCode) {
            console.log(`其他原因导致此文件未完成自动审核（错误码：${checkRes.errCode}，错误信息：${checkRes.errMsg}），需要人工审核`);
            console.error({
              errCode: checkRes.errCode,
              errMsg: checkRes.errMsg,
              result: checkRes.result
            });
            throw "uni-sec-check:illegalData"
          }
        }

        let {messages} = this.getParams()[0] || {"messages": []}
        let contentString = messages.map(i => i.content).join(' ')
        console.log('contentString', contentString);
        await this.textSecCheck(contentString)
      }
    }
  },
  async _after(error, result) {
    console.log('_after', {error, result});
    if (error) {
      if (error.errCode && error.errMsg) {
        // 符合响应体规范的错误，直接返回
        return error
      } else if (error == "uni-sec-check:illegalData") {
        return {
          "data": {
            "reply": "内容涉及敏感",
            "illegal": true
          },
          "errCode": 0
        }
      } else if (error == 'insufficientScore') {
        let reply = "积分不足，请看完激励视频广告后再试"
        let {sseChannel} = this.getParams()[0] || {}
        if (sseChannel) {
          const channel = uniCloud.deserializeSSEChannel(sseChannel)
          await channel.write(reply)
          await channel.end({
            "insufficientScore": true
          })

        } else {
          return {
            "data": {
              reply,
              "insufficientScore": true
            },
            "errCode": 0
          }
        }
      } else {
        throw error // 直接抛出异常
      }
    }

    if (this.getMethodName() == 'send' && config.contentSecurity) {
      try {
        await this.textSecCheck(result.data.reply)
      } catch (e) {
        return {
          "data": {
            "reply": "内容涉及敏感",
            "illegal": true
          },
          "errCode": 0
        }
      }
    }
    return result
  },
  async send({
               messages,
               sseChannel
             }) {
    // 初次调试时，可不从客户端获取数据，直接使用下面写死在云函数里的数据
    // messages =  [{
    // 	role: 'user',
    // 	content: 'uni-app是什么，20个字以内进行说明'
    // }]

    // 校验客户端提交的参数
    let res = checkMessages(messages)
    if (res.errCode) {
      throw new Error(res.errMsg)
    }

    // 向uni-ai发送消息
    let {llm, chatCompletionOptions} = config
    return await chatCompletion({
      messages, //消息内容
      sseChannel, //sse渠道对象
      llm
    })

    async function chatCompletion({
                                    messages,
                                    summarize = false,
                                    sseChannel = false,
                                    llm
                                  }) {
      const llmManager = uniCloud.ai.getLLMManager(llm)
      let res = await llmManager.chatCompletion({
        ...chatCompletionOptions,
        messages,
        stream: sseChannel !== false,
        sseChannel
      })

      if (sseChannel) {
        let reply = ""
        return new Promise((resolve, reject) => {
          const channel = uniCloud.deserializeSSEChannel(sseChannel)
          // 判断如果是open-ai按字返回，否则按行返回
          if (llm && llm.provider && llm.provider == "openai") {
            res.on('message', async (message) => {
              reply += message
              await channel.write(message)
              // console.log('---message----', message)
            })
          } else {
            res.on('line', async (line) => {
              await channel.write(reply ? ("\n\n " + line) : line)
              reply += line
              // console.log('---line----', line)
            })
          }
          res.on('end', async () => {
            // console.log('---end----',reply)
            messages.push({
              "content": reply,
              "role": "assistant"
            })

            let totalTokens = messages.map(i => i.content).join('').length;
            // console.log('totalTokens',totalTokens);
            if (!summarize && totalTokens > 500) {
              let replySummarize = await getSummarize(messages)
              // console.log('replySummarize',replySummarize)
              await channel.end({
                summarize: replySummarize
              })
            } else {
              await channel.end()
            }
            resolve({
              errCode: 0
            })
          })
          res.on('error', (err) => {
            console.error('---error----', err)
            reject(err)
          })
        })
      } else {
        if (summarize == false) {
          messages.push({
            "content": res.reply,
            "role": "assistant"
          })
          let totalTokens = messages.map(i => i.content).join('').length;
          if (totalTokens > 500) {
            let replySummarize = await getSummarize(messages)
            res.summarize = replySummarize
          }
        }
        if (res.errCode) {
          throw res
        }
        return {
          data: res,
          errCode: 0
        }
      }
    }

    //获总结
    async function getSummarize(messages) {
      messages.push({
        "content": "请简要总结上述全部对话",
        "role": "user"
      })
      // 获取总结不需要再总结summarize和stream
      let res = await chatCompletion({
        messages,
        summarize: true,
        stream: false,
        sseChannel: false
      })
      return res.reply
    }

    function checkMessages(messages) {
      try {
        if (messages === undefined) {
          throw "messages为必传参数"
        } else if (!Array.isArray(messages)) {
          throw "参数messages的值类型必须是[object,object...]"
        } else {
          messages.forEach(item => {
            if (typeof item != 'object') {
              throw "参数messages的值类型必须是[object,object...]"
            }
            let itemRoleArr = ["assistant", "user", "system"]
            if (!itemRoleArr.includes(item.role)) {
              throw "参数messages[{role}]的值只能是：" + itemRoleArr.join('或')
            }
            if (typeof item.content != 'string') {
              throw "参数messages[{content}]的值类型必须是字符串"
            }
          })
        }
        return {
          errCode: 0,
        }
      } catch (errMsg) {
        return {
          errSubject: 'ai-demo',
          errCode: 'param-error',
          errMsg
        }
      }
    }
  }
}
