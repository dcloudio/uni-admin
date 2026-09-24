'use strict';

const platform_Android = 'Android';
const platform_iOS = 'iOS';
const platform_Harmony = 'Harmony';
const package_app = 'native_app';
const package_wgt = 'wgt';
const app_version_db_name = 'opendb-app-versions';

module.exports = async (event, context) => {
  /**
   * 检测升级 使用说明
   * 上传包：
   * 1. 根据传参，先检测传参是否完整，appid appVersion wgtVersion 必传
   * 2. 先从数据库取出所有该平台（从上下文读取平台信息，默认 Andriod）的所有线上发行更新
   * 3. 再从所有线上发行更新中取出版本最大的一版。如果可以，尽量先检测wgt的线上发行版更新
   * 4. 使用上步取出的版本包的版本号 和传参 appVersion、wgtVersion 来检测是否有更新，必须同时大于这两项，否则返回暂无更新
   * 5. 如果库中 wgt包 版本大于传参 appVersion，但是不满足 min_uni_version < appVersion，则不会使用wgt更新，会接着判断库中 app包version 是否大于 appVersion
   * 6. is_uniapp_x 为了区分 App 类型；is_vapor 表示客户端是否为 vapor 模式应用（客户端编译期条件编译确定，无运行时判断 API）
   *    wgt 记录按 is_vapor 标记与客户端能力匹配（见 isWgtUsable）：
   *    - Vapor 应用：仅可热更新 vapor 标记（is_vapor===true）的 wgt（.zst/.wgt）
   *    - 其他客户端：不能安装 vapor wgt（.zst/.wgt）；vdom 的 uni-app x Android 不支持 wgt 热更新（历史行为）
   */

  let { appid, appVersion, wgtVersion, is_uniapp_x = false, is_vapor = false } = event;

  let platform = platform_Android;

  // 云函数URL化请求
  if (event.headers) {
    let body;
    try {
      if ((event.httpMethod || '').toLowerCase() === 'get') {
        body = event.queryStringParameters || {};
      } else {
        body = JSON.parse(event.body);
      }
    } catch (e) {
      return {
        code: 500,
        msg: '请求错误',
      };
    }

    appid = body.appid;
    appVersion = body.appVersion;
    wgtVersion = body.wgtVersion;

    // HTTP 头字段名大小写不敏感，遍历 headers 兼容 user-agent / User-Agent / USER-AGENT 等写法
    let userAgent = '';
    for (const key of Object.keys(event.headers)) {
      if (key.toLowerCase() === 'user-agent') {
        userAgent = String(event.headers[key] || '');
        break;
      }
    }

    if (/iPhone|iPad/.test(userAgent)) {
      platform = platform_iOS;
    } else if (/Android|android/.test(userAgent)) {
      platform = platform_Android;
    } else {
      platform = platform_Harmony;
    }
  } else if (context.OS) {
    platform = context.OS === 'android' ? platform_Android : context.OS === 'ios' ? platform_iOS : context.OS === 'harmonyos' ? platform_Harmony : platform_Android;
  }

  if (appid && appVersion && wgtVersion && platform) {
    const collection = uniCloud.database().collection(app_version_db_name);

    const record = await collection
      .where({
        appid,
        platform,
        stable_publish: true,
      })
      .orderBy('create_date', 'desc')
      .get();

    if (record && record.data && record.data.length > 0) {
      const appVersionInDb = record.data.find((item) => item.type === package_app) || {};
      const wgtVersionInDb = record.data.find((item) => item.type === package_wgt) || {};
      const hasAppPackage = !!Object.keys(appVersionInDb).length;
      const hasWgtPackage = !!Object.keys(wgtVersionInDb).length;

      // 组装当前客户端可用的候选包（顺序固定：先整包后 wgt）：整包始终可用；wgt 需客户端能力与 Vapor 标记匹配（见 isWgtUsable）
      const candidates = [];
      if (hasAppPackage) candidates.push(appVersionInDb);
      if (hasWgtPackage && isWgtUsable(wgtVersionInDb, is_vapor, is_uniapp_x, platform)) {
        candidates.push(wgtVersionInDb);
      }
      // 候选至多两项：只有一项时直接使用；两项时版本号大者优先，版本相同时优先使用 wgt（可热更新）
      let stablePublishDb = {};
      if (candidates.length === 1) {
        stablePublishDb = candidates[0];
      } else if (candidates.length === 2) {
        const appPkg = candidates[0];
        const wgtPkg = candidates[1];
        stablePublishDb = compare(wgtPkg.version, appPkg.version) >= 0 ? wgtPkg : appPkg;
      }

      if (Object.keys(stablePublishDb).length) {
        const { version, min_uni_version } = stablePublishDb;

        // 库中的version必须满足同时大于appVersion和wgtVersion才行，因为上次更新可能是wgt更新
        const appUpdate = compare(version, appVersion) === 1; // app包可用更新
        const wgtUpdate = compare(version, wgtVersion) === 1; // wgt包可用更新

        if (appUpdate && wgtUpdate) {
          // 判断是否可用wgt更新（确保命中记录是 wgt 且满足最低原生版本要求）
          if (stablePublishDb.type === package_wgt && min_uni_version && compare(min_uni_version, appVersion) < 1) {
            return {
              code: 101,
              message: 'wgt更新',
              ...stablePublishDb,
            };
          } else if (hasAppPackage && compare(appVersionInDb.version, appVersion) === 1) {
            return {
              code: 102,
              message: '整包更新',
              ...appVersionInDb,
            };
          }
        }
      }

      return {
        code: 0,
        message: '当前版本已经是最新的，不需要更新',
      };
    }

    return {
      code: -101,
      message: '暂无更新或检查appid是否填写正确',
    };
  }

  return {
    code: -102,
    message: '请检查传参是否填写正确',
  };
};

/**
 * 对比版本号，如需要，请自行修改判断规则
 * 支持比对	("3.0.0.0.0.1.0.1", "3.0.0.0.0.1")	("3.0.0.1", "3.0")	("3.1.1", "3.1.1.1") 之类的
 * @param {Object} v1
 * @param {Object} v2
 * v1 > v2 return 1
 * v1 < v2 return -1
 * v1 == v2 return 0
 */
function compare(v1 = '0', v2 = '0') {
  v1 = String(v1).split('.');
  v2 = String(v2).split('.');
  const minVersionLens = Math.min(v1.length, v2.length);

  let result = 0;
  for (let i = 0; i < minVersionLens; i++) {
    const curV1 = Number(v1[i]);
    const curV2 = Number(v2[i]);

    if (curV1 > curV2) {
      result = 1;
      break;
    } else if (curV1 < curV2) {
      result = -1;
      break;
    }
  }

  if (result === 0 && v1.length !== v2.length) {
    const v1BiggerThenv2 = v1.length > v2.length;
    const maxLensVersion = v1BiggerThenv2 ? v1 : v2;
    for (let i = minVersionLens; i < maxLensVersion.length; i++) {
      const curVersion = Number(maxLensVersion[i]);
      if (curVersion > 0) {
        v1BiggerThenv2 ? (result = 1) : (result = -1);
        break;
      }
    }
  }

  return result;
}

/**
 * 判断库中的 wgt 包能否参与当前客户端的版本竞选（保守策略：除 Vapor 新能力外，所有存量场景与历史行为完全一致）
 * - Vapor 应用（is_vapor=true，客户端编译期条件编译上报）：仅可热更新 vapor 标记（is_vapor=true）的 wgt（.zst/.wgt）
 * - 非 Vapor 客户端：不能安装 vapor wgt（.zst/.wgt）；其中 vdom 的 uni-app x Android 不支持 wgt 热更新（历史行为）
 * 注：存量记录 Vapor 标记字段为驼峰 isVapor（已废弃），读取时一并兼容，写入一律使用 is_vapor
 */
function isWgtUsable(wgtVersionInDb, is_vapor, is_uniapp_x, platform) {
  const recordIsVapor = wgtVersionInDb.is_vapor === true || wgtVersionInDb.isVapor === true;
  if (is_vapor === true) return recordIsVapor;
  if (recordIsVapor) return false;
  return !(is_uniapp_x === true && platform === platform_Android);
}
