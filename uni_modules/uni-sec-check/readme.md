# uni-sec-check

`uni-sec-check`是一个用于内容安全检测的开源公共模块，包含图片鉴黄、文字违规检测。对于各种需要用户上传图片、录入文字到数据库的场景，一般需要做内容安全检测。否则一旦应用呈现了违法文字或图片，轻则应用下架、重则违法。使用内容安全检测能有效帮助您降低内容违规风险。

本模块设计了provider概念，计划集成多家提供内容安全服务的供应商。目前已集成完毕的是微信提供的内容安全检测。

虽然是微信提供的，但安全检测是一个云端服务，在uni-sec-check中，支持全端全云使用，即不管App、H5或各家小程序均可使用本服务，不管uniCloud阿里云版或腾讯云版均可使用。

该服务免费，同时微信的限制是每天20万次图片检测、200万次文字检测，这对于大多数应用都是绰绰有余的。

`uni-sec-check`是云函数的公共模块，需要在云函数中引用本模块。不是在前端进行内容安全检测。

一般是在入库前进行内容检测，由于机器自动检测可能有误判，对于本机器判断不合法的内容，建议可以入库但标记为待人工确认，这类数据人工确认前不显示给终端用户。

对于图片需要先上传再检测，未检测通过的图片需要写代码进行删除，以免占用过多云存储。

## 2.x升级指南

只针对1.x版本升级2.x版本方式

由于依赖了`uni-open-bridge`，2.0版本不会向下兼容，请按照以下步骤升级：

在`uni-config-center`中创建`uni-id`目录, 创建`config.json`配置文件(已存在请忽略)，将`uni-sec-check/config.json`中的`appid`与`appsecret`拷贝至`uni-id/config.json`内，配置内容参考下方**配置**，配置文件路径为：`uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json`

创建内容安全检测模块实例`UniSecCheck`增加必传参数`requestId`，示例如下

旧
```javascript
const uniSecCheck = new UniSecCheck({ // 创建内容安全检测模块实例
    provider: 'mp-weixin', // 指定所使用服务的提供商，目前仅支持mp-weixin
    // customGetAccessToken: async function() { // 自定义的获取accessToken方法，见下方关于customGetAccessToken的说明
    //   return {
    //     accessToken: '',
    //     expired: 1624537278552
    //   }
    // },
    // onlyUseCachedAccessToken, // 仅使用缓存在数据库的accessToken，用于在uniCloud内使用其他服务获取accessToken，且缓存在了云数据库的场景，默认false
    // refreshAccessTokenThreshold, // token有效期剩余少于多少毫秒时开始刷新，默认300000毫秒
    // abandonAccessTokenThreshold // token有效期剩余少于多少毫秒时舍弃不用，默认5000毫秒
    }
  })
```

新
```javascript

const uniSecCheck = new UniSecCheck({ // 创建内容安全检测模块实例
    provider: 'mp-weixin', // 指定所使用服务的提供商，目前仅支持mp-weixin
    /*
    * 云对象通过this.getClientInfo()获取requestId
    * 云函数通过函数自带参数context获取requestId
    * */
    requestId: context.requestId, // 请求Id
    }
  })

```


## 配置

- 如何使用公共模块请参考：[使用公共模块](https://uniapp.dcloud.net.cn/uniCloud/cf-common)
- 本模块依赖`uni-open-bridge`, 使用前需要在`uni-config-center`内添加`uni-id`配置，配置文件路径为：`uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json`
- config.json是一个标准的json文件不支持使用注释，以下示例中的注释仅为说明

```json
{
  "dcloudAppid": "__UNI__xxxxxx", // 在项目的 manifest.json 中
  "mp-weixin": { // 微信小程序
    "tokenExpiresIn": 259200,
    "oauth": {
      "weixin": {
        "appid": "", // 微信公众平台申请的小程序 appid
        "appsecret": "" // 微信公众平台申请的小程序 secret
      }
    }
  }
}
```

> 目前只有微信内容安全检测一个provider

**如何从微信获取内容安全服务的配置信息**

1. 进入微信公众平台，登录微信小程序账号（如果没有小程序账号，可以直接使用邮箱注册，流程很简单）
2. 进入以下路径`开发设置->开发设置->开发者ID`
3. 获取appid和appsecret（如果过去有业务有使用appid和appsecret，则直接复用，不要点重置），然后填入上述config.json文件中对应的appid和appsecret中。

## 在云函数中调用本模块的简单示例：

```js
const UniSecCheck = require('uni-sec-check')
exports.main = async function(event,context) {
  const uniSecCheck = new UniSecCheck({ // 创建内容安全检测模块实例
    provider: 'mp-weixin', // 指定所使用服务的提供商，目前仅支持mp-weixin
    requestId: context.requestId // 请求Id
  }
  })
  
  // 进行图片安全检测
  const url = event.url // event.url为演示的传入的url
  const imgSecCheckRes = await uniSecCheck.imgSecCheck({
    image: url, // 图片文件url
  })

  if(imgSecCheckRes.errCode === uniSecCheck.ErrorCode.RISK_CONTENT) {
    // 标记违规待删除
  }
}
```

## API说明

### imgSecCheck

> 图片内容安全检测
> 

**用法**

```js
await uniSecCheck.imgSecCheck({
  image: url, // 图片文件url或图片cloudID
  openid: '', // 用户的openid
  scene: 1, // 场景值
  version: 2 // 接口版本号
})
```

**参数说明**

|名称	|类型		|必填	|说明												|
|--		|--			|--		|--													|
|image|String	|是		|图片url或图片对应的cloudID	|
|openid|String	|否		|用户的openid（用户需在近两小时访问过小程序）version=2时必填	|
|scene|String	|否		|场景值（1 资料；2 评论；3 论坛；4 社交日志）	|
|version|String	|是		|接口版本号 1 或者 2	|

**返回值说明**

|名称		|类型		|必填	|说明											|
|--			|--			|--		|--												|
|errCode|String	|是		|错误码，见下方错误码说明	|
|errMsg	|String	|是		|错误信息									|
|traceId	|String	|是		|唯一请求标识，标记单次请求，用于匹配异步推送结果									|

**注意**
- version=1，检测结果同步返回，但返回值不包括traceId。
- version=2，检测结果异步返回，需要提前在微信公众平台「开发」-「开发设置」-「消息推送」开启消息服务，检测结果在 30 分钟内会推送到你的消息接收服务器。

### textSecCheck

> 文字内容安全检测

**用法**

```js
await uniSecCheck.textSecCheck({
    content: '', // 文本内容，不可超过500KB
    openid: '', // 用户的openid
    scene: 1 // 场景值
})
```

**参数说明**

|名称		|类型		|必填	|说明										|
|--			|--			|--		|--											|
|content|String	|是		|文本内容，不可超过500KB|
|openid|String	|否		|用户的openid（用户需在近两小时访问过小程序） version=2时必填	|
|scene|String	|否		|场景值（1 资料；2 评论；3 论坛；4 社交日志）	|
|version|String	|是		|接口版本号 1 或者 2	|

**返回值说明**

|名称		|类型		|必填	|说明											|
|--			|--			|--		|--												|
|errCode|String	|是		|错误码，见下方错误码说明	|
|errMsg	|String	|是		|错误信息									|
|result	|Object	|是		|检测结果									|

**result说明**

|名称		|类型		|必填	|说明											|
|--			|--			|--		|--												|
|suggest|String	|是		|建议；pass：通过，review：疑似，risky：有风险	|
|label	|String	|是		|分类信息；广告，时政，色情，辱骂，违法犯罪，欺诈，低俗，版权，其他						|

**注意**
 
- version=1时不会返回result字段

### avSecCheck

> 音视频安全检测

**用法**

```js
await uniSecCheck.avSecCheck({
  mediaUrl: '', // 音频文件url
  openid: '', // 用户的openid
  scene: 1 // 场景值
})
```

**参数说明**

|名称		|类型		|必填	|说明										|
|--			|--			|--		|--											|
|mediaUrl|String	|是		|音频文件url；格式支持：mp3, aac, ac3, wma, flac, vorbis, opus, wav|
|openid|String	|是		|用户的openid（用户需在近两小时访问过小程序）	|
|scene|String	|否		|场景值（1 资料；2 评论；3 论坛；4 社交日志）	|

**返回值说明**

|名称		|类型		|必填	|说明											|
|--			|--			|--		|--												|
|errCode|String	|是		|错误码，见下方错误码说明	|
|errMsg	|String	|是		|错误信息									|
|traceId	|String	|是		|唯一请求标识，标记单次请求，用于匹配异步推送结果									|

## 微信检测结果异步通知示例

在微信公众平台「开发」-「开发设置」-「消息推送」中，启用消息服务，提前保存好`EncodingAESKey`与`token`等信息。（此处不涉及微信验证服务器，请自行参考微信文档）

新建云函数（需开启云函数URL化）用于接收微信服务器通知消息，示例代码如下（代码仅供参考，未处理异常）：
```javascript
const crypto = require('crypto')

function getSignature (token, timestamp, nonce, msgEncrypt) {
    const str = [token, timestamp, nonce, msgEncrypt].sort().join('')
    return crypto.createHash('sha1').update(str).digest("hex")
}

function PKCS7Decode(buf) {
    let padSize = buf[buf.length - 1]
    return buf.slice(0, buf.length - padSize)
}
function decryptMsg (encodingAESKey, msgEncrypt) {
    const key = Buffer.from(encodingAESKey + '=', 'base64')
    const iv = key.slice(0, 16)
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    decipher.setAutoPadding(false)

    let deciphered = Buffer.concat([decipher.update(msgEncrypt, 'base64'), decipher.final()])

    deciphered = PKCS7Decode(deciphered)

    const content = deciphered.slice(16)
    const length = content.slice(0, 4).readUInt32BE(0)

    return {
        message: JSON.parse(content.slice(4, length + 4).toString()),
        appId: content.slice(length + 4).toString()
    }
}
module.exports = function (event, context) {
    const {msg_signature: msgSignature} = event.queryStringParameters
    const body = JSON.parse(event.body)
    
    let result = body
    // 消息解密
    if (body.Encrypt) {
        const signature = getSignature('your token', '1666095834', '43829373', body.Encrypt)

        if (signature !== msgSignature) {
            return 'signature error'
        }

        const decrypt = decryptMsg('your encodingAESKey', body.Encrypt)
        
        result = decrypt.message
    }
    
    // 只接收内容安全事件通知
    if (result.Event !== 'wxa_media_check') {
        return 'success'
    }
    
    if (result.result.suggest !== 'pass') {
        // 执行删除操作
    }
}
```

## 错误码说明

|错误码																|说明											|
|--																		|--												|
|uni-sec-check-system-error						|系统错误									|
|uni-sec-check-risk-content						|存在风险内容							|
|uni-sec-check-invalid-appid					|appid不正确							|
|uni-sec-check-invalid-appsecret			|appsecret不正确					|
|uni-sec-check-invalid-access-token		|accessToken不正确				|
|uni-sec-check-access-token-expired		|accessToken已过期				|
|uni-sec-check-invalid-file-type			|错误的文件类型						|
|uni-sec-check-invalid-image-size			|图片大小超出限制					|
|uni-sec-check-invalid-request-url		|错误的请求地址						|
|uni-sec-check-invalid-request-param	|错误的请求参数						|
|uni-sec-check-invalid-request-format	|错误的请求格式						|
|uni-sec-check-param-required					|缺少必要参数							|
|uni-sec-check-empty-image						|图片文件内容为空					|
|uni-sec-check-empty-content					|文字内容为空							|
|uni-sec-check-invoke-out-of-limit		|接口调用频率/次数超出限制|
