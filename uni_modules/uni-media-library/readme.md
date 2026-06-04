# 媒体库

管理上传的云存储图片、视频等媒体资源，支持对资源上传、删除、查看等操作。

![](https://web-ext-storage.dcloud.net.cn/unicloud/20260604164359858.png)

![](https://web-ext-storage.dcloud.net.cn/unicloud/20260604164347258.png)

![](https://web-ext-storage.dcloud.net.cn/unicloud/20260604164301332.png)

![](https://web-ext-storage.dcloud.net.cn/unicloud/20260604164336275.png)

![](https://web-ext-storage.dcloud.net.cn/unicloud/20260604164418151.png)

![](https://web-ext-storage.dcloud.net.cn/unicloud/20260604164409734.png)

**功能点**

- 支持支付宝云、阿里云、腾讯云云存储。
- 支持扩展存储，目前支持七牛云扩展存储。
- 对媒体资源管理，支持上传、删除、查看等操作。
- 支持媒体资源的标签管理，方便对媒体资源进行分类和查询。
- 支持对媒体库中的图片资源进行裁剪优化。
- 可作为图片选择器使用，支持插入图片到编辑器中。
- 集成免费素材库，快速获取图片、gif等素材。

## 如何使用

从插件市场中导入[媒体库](https://ext.dcloud.net.cn/plugin?name=uni-media-library)
插件至[uni-admin](https://ext.dcloud.net.cn/plugin?name=uni-admin)中。

如果还未使用过uni-admin，请先在HBuilderX新建项目时选择uni-admin项目。并需要了解[uni-admin](https://uniapp.dcloud.net.cn/uniCloud/admin)
的相关知识。

导入uni-media-library后，运行启动uni-admin，在web管理后台，点击左侧菜单栏的菜单管理，添加“媒体库”菜单。

如下图所示：

![](https://web-assets.dcloud.net.cn/unidoc/zh/202305262008690.png)

导入后刷新页面，在uni-admin左侧菜单，可看到媒体库的菜单项，点击即可进入。

### 前端组件使用

> 媒体库可做为独立的组件使用，例如文章封面可以通过媒体库组件来选择图片，不需要每次都重新上传图片。

#### 基本用法

`uni-media-library` 组件符合 [easycom](https://uniapp.dcloud.net.cn/collocation/pages.html#easycom) 组件规范，可以直接在页面中使用
uni-media-library 标签，以使用媒体库组件。

```vue

<template>
	<uni-media-library></uni-media-library>
</template>
```

#### API

**UniMediaLibrary Props**

|      属性名		      |   类型	   |            默认值	             |                 说明                 |
|:---------------:|:-------:|:---------------------------:|:----------------------------------:|
|     mode		      | String	 |          manager	           | 媒体库展示模式；manager: 管理模式，picker: 选择模式 |
|  media-tabs		   | Array	  | ['all', 'image', 'video']		 |          允许展示那种类型的媒体资源tab          |
| selected-count	 | Number	 |             -	              |      最大选择数量，仅在mode为picker时有效       |

**UniMediaLibrary Events**

|   事件名    |           说明           |             返回值             |
|:--------:|:----------------------:|:---------------------------:|
| onInsert | 在picker模式下，选择图片插入后触发事件 | Array\<SelectedMediaItems\> |

**SelectedMediaItems 说明**

|  属性名  |   类型   | 默认值 |               说明                |
|:-----:|:------:|:---:|:-------------------------------:|
| type  | String |  -  |             媒体资源类型              |
|  src  | String |  -  |             媒体资源地址              |
| cover | String |  -  | 媒体资源封面；如媒体类型是视频时返回视频封面（腾讯云没有封面） |
|  alt  | String |  -  |  用于图片加载失败时的替代文字；常用于插入富文本编辑器时使用  |

### 云对象 (uni-media-library-co)

在 uni-media-library-co 云对象中实现了对媒体资源的上报与删除功能。

#### 配置@co-config

uni-media-library的云端配置文件统一使用[uni-config-center](https://uniapp.dcloud.net.cn/uniCloud/uni-config-center)管理。

初次使用时，新建配置文件，
路径为 `uni_modules/uni-config-center/uniCloud/cloudfunctions/common/uni-config-center/uni-media-library/config.json`
，用于配置`uni-media-library`相关信息，完整配置如下:

注意：以下注释仅用于对字段进行描述，复制时请删除注释。

```json
{
  // 加载媒体库列表时是否启用缩略图规则
  "cropMediaAssets": false,
  // 扩展存储配置；不配置时仅使用内置存储
  "extStorage": {
    // 扩展存储服务商，目前仅支持 qiniu
    "provider": "qiniu",
    // 七牛云绑定的访问域名，如 example.com
    "domain": "your-cdn-domain.com",
    // 可选，七牛云存储空间名称；不填时由扩展库从绑定空间中获取
    "bucketName": "your_bucket_name",
    // 可选，七牛云存储空间密钥；不填时由扩展库从绑定空间中获取
    "bucketSecret": "your_bucket_secret"
  },
  // 内置图片素材库
  "imageLibraryProviders": {
    // 是否开启unsplash图片库
    "unsplash": {
      "appId": "your_app_id",
      "accessKey": "your_access_key",
      "secretKey": "your_secret_key"
    },
    // 是否开启giphy图片库
    "giphy": {
      "apiKey": "your_api_key"
    },
    // 是否开启pexels图片库
    "pexels": {
      "apiKey": "your_api_key"
    },
    // 自定义素材库
    "others": [
      {
        "provider": "custom_provider",
        "name": "custom_name",
        "website": "custom_website",
        "options": {}
      }
    ]
  }
}
```

#### 完整配置字段说明

| 字段 | 类型 | 必填 | 说明 |
|:--:|:--:|:--:|:--|
| cropMediaAssets | Boolean | 否 | 是否在读取媒体库列表时启用缩略图规则，用于优化图片加载速度和减少原图流量 |
| extStorage | Object | 否 | 扩展存储配置；不配置时仅使用内置存储 |
| extStorage.provider | String | 使用扩展存储时必填 | 扩展存储服务商，目前仅支持 `qiniu` |
| extStorage.domain | String | 使用扩展存储时必填 | 七牛云绑定的访问域名，如 `example.com` |
| extStorage.bucketName | String | 否 | 七牛云存储空间名称；不填时由扩展库从绑定空间中获取 |
| extStorage.bucketSecret | String | 否 | 七牛云存储空间密钥；不填时由扩展库从绑定空间中获取 |
| imageLibraryProviders | Object | 否 | 免费素材库配置 |
| imageLibraryProviders.unsplash | Object | 否 | Unsplash 素材库配置 |
| imageLibraryProviders.giphy | Object | 否 | Giphy 素材库配置 |
| imageLibraryProviders.pexels | Object | 否 | Pexels 素材库配置 |
| imageLibraryProviders.others | Array | 否 | 自定义素材库配置 |

### 扩展存储配置@ext-storage

媒体库默认使用 uniCloud 内置存储。配置扩展存储后，上传资源时可选择“扩展存储”。

启用步骤：

1. 在 `uni-media-library-co` 云对象中关联 `uni-cloud-ext-storage` 扩展库。
2. 在 `uni-media-library/config.json` 中配置 `extStorage.provider` 为 `qiniu`。
3. 配置 `extStorage.domain` 为扩展存储绑定的域名，如 `example.com`。
4. 如果扩展库无法自动从绑定空间中获取存储空间信息，可继续配置 `bucketName`、`bucketSecret`。
5. 上传并运行云对象后，媒体库上传页会显示“扩展存储”选项。

配置示例：

```json
{
  "extStorage": {
    "provider": "qiniu",
    "domain": "your-cdn-domain.com"
  }
}
```

使用扩展存储上传的媒体资源，`storageProvider` 会记录为 `ext-qiniu`。删除媒体资源时，媒体库会根据 `storageProvider` 区分内置存储和扩展存储，并删除对应的源文件及视频封面。

#### 媒体资源上报接口

接口名：report

**接口形式**

```js
await uniMediaLibrary.report({
  src,
  cover,
  type,
  originalName,
  fileType,
  size,
  resolution,
  duration,
  uploadUser,
  storageProvider,
  tags
})

```

**参数说明**

|     参数名      |   类型   | 必填 |        说明         |
|:------------:|:------:|:--:|:-----------------:|
|     src      | String | 是  |      媒体资源地址       |
|     type     | String | 是  |      媒体资源类型       |
|    cover     | String | 否  |      媒体资源封面       |
| originalName | String | 否  |       原始文件名       |
|   fileType   | String | 否  |       文件类型        |
|     size     | Number | 否  |       文件大小        |
|  resolution  | Object | 否  | 分辨率；见Resolution说明 |
|   duration   | String | 否  |        时长         |
|  uploadUser  | String | 否  |     上传用户的用户id     |
| storageProvider | String | 否 | 存储服务提供商；`internal`: 内置存储，`ext-qiniu`: 七牛扩展存储，默认 `internal` |
| tags | Array<string> | 否 | 关联的标签ID列表 |

**Resolution说明**

|  参数名   |   类型   | 必填 | 说明 |
|:------:|:------:|:--:|:--:|
| width  | Number | 是  | 宽度 |
| height | Number | 是  | 高度 |

**返回值**

|   参数名   |   类型   | 说明  |
|:-------:|:------:|:---:|
| errCode | Number | 状态码 |

#### 删除媒体资源

接口名：deleteMedia

**接口形式**

```js
await uniMediaLibrary.deleteMedia({
  mediaIds
})

```

**参数说明**

|   参数名    |      类型       | 必填 |    说明    |
|:--------:|:-------------:|:--:|:--------:|
| mediaIds | Array<string> | 是  | 媒体资源id列表 |

**返回值**

|   参数名   |   类型   | 说明  |
|:-------:|:------:|:---:|
| errCode | Number | 状态码 |

**注意**

- 删除媒体资源时将会同时删除云存储文件，删除后将无法恢复，请谨慎操作。

### uni-media-library Schema 扩展

> 负责处理与媒体库资源创建时的逻辑

主要功能有：

在读取（afterRead）媒体库资源后，根据`uni-media-library`配置文件中的`cropMediaAssets`字段，为图片和视频封面追加缩略图处理规则。

## 优化媒体库图片加载速度

默认媒体库列表会加载原图展示，图片较大时会影响加载速度，也会造成不必要的 CDN 流量消耗。可以通过 `uni-media-library` 云对象配置文件开启 `cropMediaAssets`，让媒体库在读取数据时为图片和视频封面追加缩略图处理规则。

具体配置参考[uni-media-library-co配置](#co-config)

开启方式：

```json
{
  "cropMediaAssets": true
}
```

开启后：

- 媒体库列表图会使用约 `150x150` 的缩略图规则。
- 媒体详情预览会使用约 `300x180` 的缩略图规则。
- 图片资源使用 `src` 生成缩略图规则；视频资源使用 `cover` 生成缩略图规则。
- 该配置只在读取媒体库数据时追加展示用的缩略图规则，不会修改数据库中保存的原始 `src`、`cover` 地址，也不会主动生成新的媒体文件。
- 如果资源来自扩展存储七牛云，会使用七牛的图片处理规则；如果资源来自 uniCloud 内置存储，会根据文件地址匹配阿里云或腾讯云的图片处理规则。

**注意**

根据您开通的服务空间不同，图片裁剪的功能也不同，具体如下：

- 阿里云图片裁剪目前可免费使用，无需担心费用问题。
- 腾讯云图片裁剪为付费服务，如使用腾讯云，建议您在使用前先了解腾讯云的计费规则，避免造成不必要的费用。
- 七牛云扩展存储的图片处理能力和费用以七牛云当前规则为准，建议在正式开启前确认对应空间的图片处理配置和计费方式。

关于云存储数据处理，内置存储请参考[数据处理](https://doc.dcloud.net.cn/uniCloud/storage/dev.html#%E6%95%B0%E6%8D%AE%E5%A4%84%E7%90%86)，
扩展存储请参考[图片处理](https://doc.dcloud.net.cn/uniCloud/ext-storage/dev.html#imageshandle)。

## 免费素材库@image-library

> 为了方便快速获取图片素材，媒体库提供了免费素材库功能，目前内置了unsplash、giphy、pexels三个免费素材库。
>
> 同时支持自定义素材库，可通过配置文件添加自定义素材库。

### 内置素材库

默认情况下，内置的素材库是关闭的，需要在配置文件中开启。

在配置文件中配置`imageLibraryProviders`字段，如下：

```json
{
  "imageLibraryProviders": {}
}
```

根据实际需求，配置对应的素材库。

**注意**

使用素材库时，需遵守素材库的使用协议，防止侵权行为发生， 以下是三个素材库的使用协议：

- [unsplash](https://unsplash.com/license)
- [giphy](https://giphy.com/terms)
- [pexels](https://www.pexels.com/license)


### unsplash

> unsplash是一个免费的图片素材库，提供了大量高质量的图片素材。
> 
> unsplash素材库以摄影作品居多，风景、人物等。

开启unsplash素材库，配置如下：

```json
{
  "imageLibraryProviders": {
    "unsplash": {
      "appId": "your_app_id",
      "accessKey": "your_access_key",
      "secretKey": "your_secret_key"
    }
  }
}
```

**获取unsplash的appId、accessKey、secretKey**

1. 注册unsplash账号，登录后进入[unsplash开发者页面](https://unsplash.com/developers)。
2. 创建应用，获取appId(applicationId)、accessKey、secretKey。
3. 将appId(applicationId)、accessKey、secretKey填入配置文件中。
4. 保存配置文件。
5. 刷新页面，即可使用unsplash素材库。

### giphy

> giphy是一个免费的gif素材库，提供了大量高质量的gif素材。
>
> giphy素材库以gif动画作品居多，表情包、动态图等。
> 
> giphy仅适用于个人和非商业用途，具体协议内容请查看[giphy用户协议](https://giphy.com/terms)。

开启giphy素材库，配置如下：

```json
{
  "imageLibraryProviders": {
    "giphy": {
      "apiKey": "your_api_key"
    }
  }
}
```

**获取giphy的apiKey**

1. 注册giphy账号，登录后进入[giphy开发者页面](https://developers.giphy.com/)。
2. 在[dashboard](https://developers.giphy.com/dashboard/)中创建apiKey。
3. 将apiKey填入配置文件中。
4. 保存配置文件。
5. 刷新页面，即可使用giphy素材库。

### pexels

> pexels是一个免费的图片素材库，提供了大量高质量的图片素材。

开启pexels素材库，配置如下：

```json
{
  "imageLibraryProviders": {
    "pexels": {
      "apiKey": "your_api_key"
    }
  }
}
```

**获取pexels的apiKey**

1. 注册pexels账号，登录后进入[pexels API页面](https://www.pexels.com/api/)。
2. 创建apiKey。
3. 将apiKey填入配置文件中。
4. 保存配置文件。
5. 刷新页面，即可使用pexels素材库。

### 自定义素材库

> 除了内置的素材库外，还支持自定义素材库。
>
> 可以通过配置文件添加常用的素材库使用。

#### 配置

在配置文件中配置`imageLibraryProviders.others`字段，如下：

```json
{
  "imageLibraryProviders": {
    "others": [
      {
        "provider": "custom_provider", // 自定义素材的provider，切勿与内置素材库重复
        "name": "custom_name", // 自定义素材的名称，用于在媒体库中展示
        "website": "custom_website", // 自定义素材的网站地址（可选）
        "options": {} // 自定义素材的配置, 用于请求素材库的参数
      }
    ]
  }
}
```

#### 实现自定义素材库逻辑

添加完自定义素材库配置后，需要自行实现素材搜索和查询素材详情的逻辑。

在配置文件同级目录中创建`image-library/{provider}/index.js`文件，用于存放自定义素材库的逻辑。

需要导出`search`、`detail`两个方法，具体实现如下：

**自定义素材库逻辑示例**

```js
exports.search = async function (query, options) {
  const {keyword, page, pageSize} = query // query为搜索条件
  // options为请求参数(即配置文件中配置的options字段)
  
  // ::TODO:: 实现自定义素材库的搜索逻辑
  
  // 返回素材库的搜索结果
  return [
    {
      id: '', // 素材id，用于查询素材详情
      url: '', // 素材图片地址（原图）
      thumbUrl: '', // 素材缩略图地址
      width: 0, // 素材宽度
      height: 0, // 素材高度
      description: '', // 素材描述
      alt: '', // 用于图片加载失败时的替代文字
      originalName: '', // 原始文件名
    }
  ]
}

exports.detail = async function (id, options) {
  // id为素材id
  // options为请求参数(即配置文件中配置的options字段)
  
  // ::TODO:: 实现自定义素材库的查询素材详情逻辑
  
  // 返回素材详情
  return {
    id: '', // 素材id，用于查询素材详情
    url: '', // 素材图片地址（原图）
    thumbUrl: '', // 素材缩略图地址
    width: 0, // 素材宽度
    height: 0, // 素材高度
    description: '', // 素材描述
    alt: '', // 用于图片加载失败时的替代文字
    originalName: '', // 原始文件名
    fileType: '', // 文件类型
    size: 0, // 文件大小
  }
}
```

#### 设置自定义素材库图标

到目前为止你打开媒体库，应该可以在左侧看到你添加的自定义素材库了，但是图标是默认的。

如果你想要为自定义素材库设置一个图标，可以修改`uni_modules/uni-meidia-library/components/image-library-logos/index.vue`文件。

在该文件添加你的自定义素材库图标，推荐使用svg图片作为图标使用(图片大小24像素)，示例如下：

```vue
<template v-else-if="provider === 'custom'">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>
</template>
```

添加后，刷新页面，即可看到自定义素材库的图标。
