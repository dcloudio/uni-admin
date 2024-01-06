# 媒体库

管理上传的云存储图片、视频等媒体资源，支持对资源上传、删除、查看等操作。

![](https://web-assets.dcloud.net.cn/unidoc/zh/202305291541315.png)

![](https://web-assets.dcloud.net.cn/unidoc/zh/202305291602166.png)

**功能点**

- 支持阿里云与腾讯云云存储。
- 对媒体资源管理，支持上传、删除、查看等操作。
- 可作为图片选择器使用，支持插入图片到编辑器中。

## 如何使用

从插件市场中导入[媒体库](https://ext.dcloud.net.cn/plugin?name=uni-media-library)插件至[uni-admin](https://ext.dcloud.net.cn/plugin?name=uni-admin)中。

如果还未使用过uni-admin，请先在HBuilderX新建项目时选择uni-admin项目。并需要了解[uni-admin](https://uniapp.dcloud.net.cn/uniCloud/admin)的相关知识。

导入uni-media-library后，运行启动uni-admin，在web管理后台，点击左侧菜单栏的菜单管理，添加“媒体库”菜单。

如下图所示：

![](https://web-assets.dcloud.net.cn/unidoc/zh/202305262008690.png)

导入后刷新页面，在uni-admin左侧菜单，可看到媒体库的菜单项，点击即可进入。

### 前端组件使用
> 媒体库可做为独立的组件使用，例如文章封面可以通过媒体库组件来选择图片，不需要每次都重新上传图片。

#### 基本用法

`uni-media-library` 组件符合 [easycom](https://uniapp.dcloud.net.cn/collocation/pages.html#easycom) 组件规范，可以直接在页面中使用 uni-media-library 标签，以使用媒体库组件。

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
路径为 `uni_modules/uni-config-center/uniCloud/cloudfunctions/common/uni-config-center/uni-media-library/config.json`，用于配置`uni-media-library`相关信息，完整配置如下:

注意：以下注释仅用于对字段进行描述，复制时请删除注释。

```json
{
  "cropMediaAssets": false, // 是否对媒体库的图片进行裁剪
}
```

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

在读取（afterRead）媒体库资源后，根据`uni-media-library`配置文件中的`cropMediaAssets`字段，对图片进行裁剪。

## 注意事项

### 优化媒体库图片加载速度

默认媒体库加载图片会加载原图展示，同时会造成不必要的CDN流量消耗，可以通过`uni-media-library`云对象的配置文件开启图片裁剪(cropMediaAssets)，以优化图片加载速度。

具体配置参考[uni-media-library-co配置](#co-config)

**注意**

根据您开通的服务空间不同，图片裁剪的功能也不同，具体如下：

- 阿里云图片裁剪目前可免费使用，无需担心费用问题。
- 腾讯云图片裁剪为付费服务，如使用腾讯云，建议您在使用前先了解腾讯云的计费规则，避免造成不必要的费用。

关于云存储数据处理，阿里云请参考[数据处理](https://uniapp.dcloud.net.cn/uniCloud/storage.html#aliyun-data-process)，
腾讯云请参考[数据万象](https://uniapp.dcloud.net.cn/uniCloud/storage.html#tcb-data-process)。

