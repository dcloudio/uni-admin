# uni-portal 统一发布页


## 为什么需要 uni-portal 统一发布页？

App/小程序/网站做好后，如何告知你的用户？

你需要开发App的下载页、小程序二维码的展示页面，这些内容最好汇总在统一入口，也就是发行平台。

自己从头开发这么一个发行平台，需要考虑的事情太多了：
- 响应式布局，兼容`PC/Mobile`各种尺寸
- 微信/微博浏览器判断不同逻辑，右上角提示通过浏览器打开
- PC上制作二维码，方便用户直接扫码下载
- 如果小程序有多个版本，微信、支付宝、百度、QQ、快应用，那搞起来。。。

别急，有了`uni-portal 统一发布页`，一切迎刃而解，10分钟内搞定所有。

## uni-portal 插件特征：

- 基于 `uni-app` & `uniCloud` 实现
- 遵循 `uni-admin` 框架规范，可直接导入 `Admin` 项目中
- 支持 App、小程序、H5、快应用 灵活修改发布，实时线上更新
- 支持生成发布页的静态页面，您可以将其上传到uniCloud前端网页托管中，自动启用CDN加速
- 数据表设计，遵循 [opendb 规范](https://gitee.com/dcloud/opendb)


## 如何获取本插件

**准备工作：**

- `uni-portal`遵循 `uni_modules`规范，故需您的HBuilderX版本高于`3.1.0+`；若版本过低，请先升级HBuilderX；
- `uni-portal`作为`uni-admin`的插件，需您本地先安装`uni-admin`项目，并已关联好服务空间；

**做完如上准备工作后，请按照如下步骤进行安装：**

1. 在插件市场打开本插件页面，在右侧点击`使用 HBuilderX 导入插件`，选择 `uni-admin` 项目点击确定

2. 等待下载安装完毕。注意：由于本插件依赖一些 uni-ui 插件，下载完成后会显示合并插件页面，自行选择即可

3. 找到`/uni_modules/uni-portal/uniCloud/cloudfunctions`，右键上传所有云函数

4. 找到`/uni_modules/uni-portal/uniCloud/database/db_init.json`，右键初始化数据库

5. 编辑`pages.json`，增加如下内容

   ```json
   //此结构与uni-admin中的pages.json结构一致
   "pages": [
         // ……其他页面配置
         {
           "path" : "uni_modules/uni-portal/pages/index",
           "style" :{
               "navigationBarTitleText": "发布应用",
               "enablePullDownRefresh": false
           }
         }
   ]
   ```

6. 在`应用管理`列表中，添加“发布”按钮，作为`uni-portal`统一发布页的入口。

    找到并编辑 `uni-admin` 项目下`/pages/system/app/list.vue`，在原`编辑`、`删除`按钮之前，添加`发布`按钮，编辑后内容如下：

    ```html
    <view v-else class="uni-group">
        <!-- 这里是新增的发布按钮，若有国际化需求，请到国际化配置文件中进行编辑 -->
        <button @click="navigateTo('/uni_modules/uni-portal/pages/index?id='+item.appid, false)" class="uni-button" size="mini" type="primary">发布</button>
        <!-- 下方是原有的编辑、删除按钮 -->
        <button @click="navigateTo('./edit?id='+item._id, false)" class="uni-button" size="mini" type="primary">{{$t('common.button.edit')}}</button>
        <button @click="confirmDelete(item._id)" class="uni-button" size="mini" type="warn">{{$t('common.button.delete')}}</button>
    </view>
    ```

7. 在`manifest.json -> 源码视图`中添加以下配置：

   ```js
   "networkTimeout":{
   	"uploadFile":1200000	// 单位：ms。 如果不配置，上传大文件可能会超时
   }
   ```

8. 运行项目到`Chrome`

**注意事项：**

1. 本插件依赖 `uni-ui` 中的部分组件，在运行项目到`Chrome`之前，建议先右键`/uni_modules/uni-portal`安装第三方依赖；
2. 本插件使用了`clientDB`，故可能需要在`uni-config-center`插件中添加`uni-id`的配置。

**如提示`公用模块uni-id缺少配置信息`，可按如下步骤解决：**

- a>. 点击[uni-config-center](https://ext.dcloud.net.cn/plugin?id=4425)导入插件
- b>. 在`/uniCloud/cloudfunctions/common/uni-config-center/`下创建`uni-id`文件夹，文件夹内创建`config.json`文件。
- c>. 点击[config.json 默认配置](https://uniapp.dcloud.net.cn/uniCloud/uni-id?id=start)。将内容拷贝至`config.json`中；拷贝完毕后，请**务必删除注释**。


## 如何使用本插件

如果安装正确，管理员登录`uni-admin`管理后台，点击`应用管理`菜单，在应用列表项右侧看到`发布`按钮，如下图所示：

![](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-a90b5f95-90ba-4d30-a6a7-cd4d057327db/668d2c82-38d9-4be7-89e3-05a17d928f87.png)

若未看到发布按钮，请返回`如何获取本插件`章节，仔细检查安装步骤。


### 应用发布信息填写

<img src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-a90b5f95-90ba-4d30-a6a7-cd4d057327db/7c198a0a-a08c-4c24-9fcb-b10b0e406881.png" width="800"></img>

- #### 基础信息

	1. `AppID`：所要发布的 app 的 id。唯一。
	2. `自动填充`：如果你的`uni-admin`项目同时使用了[升级中心](https://ext.dcloud.net.cn/plugin?id=4470)，那么当你填写了`AppID`点击按钮后，会自动从`升级中心`同步 App 的一些信息。

- #### 图片素材

	1. `应用图标`：该应用的图标信息，在生成页面会用来生成当前页二维码
	2. `应用截图`：该应用的实际截图信息

- #### App 下载信息

	1. 勾选代表需要发布此类信息，不勾选会默认折叠
	2. 可以选择手动填写还是上传安装包到云存储自动填写下载链接
	3. `自动填充`：如果你的`uni-admin`项目同时使用了[升级中心](https://ext.dcloud.net.cn/plugin?id=4470)，那么当你填写了`AppID`点击按钮后，会自动从`升级中心`同步 App 当前已上线的安装包信息。

- #### 小程序信息

	1. 勾选代表需要发布此类信息，不勾选会默认折叠
	2. `折叠`：小程序种类繁多，此按钮可以将所有的小程序信息折叠起来

- #### H5、快应用

	1. `H5`：当你填写了链接，才会在生成页面显示
	2. `快应用`：只有上传了`快应用码`，才会在生成页面展示

- #### 填写完成点击 `保存` 即可，会有弹窗提示保存成功，是否立即下载统一发布页面

    > 点击 `是` 即可下载统一发布页面

    <img src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-a90b5f95-90ba-4d30-a6a7-cd4d057327db/46aab648-5a65-4e82-acd1-5a42320d1a27.png" width="400"></img>

### 统一发布静态页

#### 上传部署

> `uni-portal` 统一发布页面是静态HTML页面，可以直接在本地浏览器中打开查看。您可以部署在任何服务器中以供访问。

**推荐使用 [前端网页托管](https://uniapp.dcloud.io/uniCloud/hosting) ：**
- 免费的 `CDN加速`：不经过web server，页面和资源直接上cdn，就近访问，速度更快。
- 省心：无需再购买虚拟机、安装操作系统、配置web服务器、处理负载均衡、处理大并发、处理DDoS攻击......您什么都不用管，只需上传您写的页面文件。

注意：
- 静态页面上传到 `前端网页托管` 使用默认域名访问时，会有一定的限制。但是这些限制在[配置域名](https://uniapp.dcloud.io/uniCloud/hosting?id=domain)后都就不存在了。
- 如果遇到静态页面打开图片或者二维码不显示的情况，请在 `uniCloud Web 控制台` 配置跨域设置。

#### 页面展示效果

> `uni-portal` 统一发布页面是响应式的，兼容PC宽屏和手机窄屏。

##### PC宽屏

<img src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-8ed92fab-502d-4290-af3c-1d65c4dbfc4d/14b02d74-57ab-48eb-9933-8d40037f5397.png" height="800"></img>

##### 手机窄屏

手机浏览器上，默认展示效果如下：

<img src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-8ed92fab-502d-4290-af3c-1d65c4dbfc4d/e3b2171c-baf7-4be0-a2f3-fedd4f421e4c.png" height="400"></img>

`uni-portal`统一发布页同时会识别当前浏览器环境，在微信等特殊浏览器上，自动提示“点击右上角菜单，在浏览器中打开”，效果如下：

<img src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-8ed92fab-502d-4290-af3c-1d65c4dbfc4d/f4b41d5f-861b-4bef-b670-9a2597643e3c.jpg" height="400"></img>
