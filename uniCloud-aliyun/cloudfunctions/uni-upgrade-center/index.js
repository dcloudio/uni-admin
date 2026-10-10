'use strict';

const uniID = require('uni-id-common');
const checkVersion = require('./checkVersion');
const { downloadSha256 } = require('./get-file-sha256');

const success = { success: true };
const fail = { success: false };

function failWith(errMsg) {
  return Object.assign({}, fail, { errMsg });
}

/**
 * 获取扩展存储管理对象（当前扩展存储供应商为七牛云）
 * @param {String} domain 扩展存储绑定的自定义域名
 */
function getExtStorageManager(domain) {
  return uniCloud.getExtStorageManager({
    provider: 'qiniu',
    domain,
  });
}

/**
 * 获取文件临时下载链接
 * @param {String} fileID https:// 开头（内置存储 fileID 或扩展存储 fileURL）直接作为下载链接；
 *                        qiniu:// 为扩展存储（需 domain）；其余视为内置存储 fileID（腾讯云版 cloud://）
 * @param {String} domain 扩展存储绑定的自定义域名（fileID 为 qiniu:// 格式时必传）
 */
async function getFileTempURL(fileID, { domain } = {}) {
  // 已是可直接下载的链接
  if (/^https?:\/\//.test(fileID)) return fileID;

  let res;
  if (/^qiniu:\/\//.test(fileID)) {
    // 扩展存储（七牛云）
    if (!domain) throw new Error('扩展存储文件必须传入 domain（扩展存储绑定的自定义域名）');
    res = await getExtStorageManager(domain).getTempFileURL({ fileList: [fileID] });
  } else {
    // 内置存储
    res = await uniCloud.getTempFileURL({ fileList: [fileID] });
  }
  const fileList = (res && res.fileList) || [];
  return fileList.length ? fileList[0].tempFileURL : '';
}

/**
 * 获取扩展存储（七牛云）文件的 SHA256：七牛支持在下载链接后拼接 ?qhash/sha256 直接返回摘要，免下载整个文件
 * 响应示例：{"hash":"9b75...","fsize":124915252}
 * 失败或摘要不合法时返回 ''（由调用方回退为下载文件计算）
 * @param {String} tempFileURL 文件临时下载链接
 */
async function getQiniuSha256(tempFileURL) {
  try {
    const qhashURL = tempFileURL + (tempFileURL.indexOf('?') === -1 ? '?' : '&') + 'qhash/sha256';
    const res = await uniCloud.httpclient.request(qhashURL, {
      method: 'GET',
      followRedirect: true,
      dataType: 'json',
      timeout: [5000, 10000], // qhash 仅返回摘要，短超时即可
    });
    if (res.status !== 200) return '';
    const hash = String((res.data && res.data.hash) || '').trim().toLowerCase();
    // 仅接受 64 位十六进制 SHA256，避免把异常响应内容当作摘要返回
    return /^[a-f0-9]{64}$/.test(hash) ? hash : '';
  } catch (e) {
    console.error('七牛云 qhash 获取 SHA256 失败，回退为下载计算：', e.message || e);
    return '';
  }
}

async function checkPermission(uniIDIns, uniIdToken, permission) {
  const checkTokenRes = await uniIDIns.checkToken(uniIdToken);
  if (checkTokenRes.errCode === 0) {
    if ((checkTokenRes.permission || []).indexOf(permission) > -1 || (checkTokenRes.role || []).indexOf('admin') > -1) {
      return true;
    }
    return Object.assign({ errMsg: '权限不足' }, fail);
  }
  return Object.assign({}, checkTokenRes, { errMsg: checkTokenRes.message }, fail);
}

exports.main = async (event, context) => {
  const db = uniCloud.database();
  const appListDBName = 'opendb-app-list';
  const appVersionDBName = 'opendb-app-versions';
  const uniIDIns = uniID.createInstance({ context });

  // 云函数 URL 化处理：GET 取查询参数（无查询参数时兜底空对象），POST 解析 body。
  // checkVersion 需读取 user-agent 识别平台，须保留原始 event（含 headers/queryStringParameters/body），
  // 否则 URL 化请求会丢失请求头，平台退化为默认的 Android。
  const rawEvent = event;
  if (event.headers) {
    try {
      if ((event.httpMethod || '').toLowerCase() === 'get') {
        event = event.queryStringParameters || {};
      } else {
        event = JSON.parse(event.body);
      }
    } catch (e) {
      return {
        code: 500,
        msg: '请求错误',
      };
    }
  }

  const params = event.data || event.params || {};

  switch (event.action) {
    case 'checkVersion': {
      return await checkVersion(rawEvent, context);
    }

    case 'deleteFile': {
      const checkResult = await checkPermission(uniIDIns, event.uniIdToken, 'DELETE_OPENDB_APP_VERSIONS');
      if (checkResult !== true) return checkResult;

      if (!params.fileList) return failWith('参数错误：缺少 fileList');

      if (params.domain) {
        // 扩展存储（七牛云）：仅当传入 domain 时按扩展存储删除
        // 删除失败必须回报失败，否则前端会清除废弃标记，导致文件成为永久孤儿且无法重试
        try {
          await getExtStorageManager(params.domain).deleteFile({ fileList: params.fileList });
        } catch (e) {
          console.error('扩展存储文件删除失败：', e);
          return failWith('扩展存储文件删除失败：' + (e.message || e));
        }
        return success;
      }

      // 内置存储（阿里云版的 fileID 即 https 链接，可直接删除）
      return await uniCloud.deleteFile({ fileList: params.fileList });
    }

    case 'setNewAppData': {
      const checkResult = await checkPermission(uniIDIns, event.uniIdToken, 'UPDATE_OPENDB_APP_LIST');
      if (checkResult !== true) return checkResult;

      if (!params.id) return failWith('参数错误：缺少 id');
      if (!params.value) return failWith('参数错误：缺少 value');

      params.value.create_date = Date.now();
      return await db.collection(appListDBName).doc(params.id).set(params.value);
    }

    case 'getAppInfo': {
      if (!params.appid) return failWith('参数错误：缺少 appid');

      const dbAppListRecord = await db
        .collection(appListDBName)
        .where({
          appid: params.appid,
        })
        .get();

      if (dbAppListRecord && dbAppListRecord.data.length) return Object.assign({}, success, dbAppListRecord.data[0]);

      return fail;
    }

    case 'getAppVersionInfo': {
      if (!params.appid) return failWith('参数错误：缺少 appid');
      if (!params.platform) return failWith('参数错误：缺少 platform');

      const dbVersionListRecord = await db
        .collection(appVersionDBName)
        .where({
          appid: params.appid,
          platform: params.platform,
          type: 'native_app',
          stable_publish: true,
        })
        .orderBy('create_date', 'desc')
        .get();

      if (dbVersionListRecord && dbVersionListRecord.data && dbVersionListRecord.data.length > 0) {
        return Object.assign({}, dbVersionListRecord.data[0], success);
      }

      return fail;
    }

    case 'getFileSha256': {
      const checkResult = await checkPermission(uniIDIns, event.uniIdToken, 'UPDATE_OPENDB_APP_VERSIONS');
      if (checkResult !== true) return checkResult;

      // 兼容 $request 包装传参（params.fileID）与 callFunction 平铺传参（event.fileID）
      const { fileID, domain } = { ...params, ...event };
      if (!fileID) return failWith('参数错误：缺少 fileID');

      // 1. 获取临时下载链接（https 链接直接下载；qiniu:// 走扩展存储；其余走内置存储）
      let tempFileURL;
      try {
        tempFileURL = await getFileTempURL(fileID, { domain });
        if (!tempFileURL) return failWith('文件不存在');
      } catch (e) {
        return failWith('获取文件下载链接失败：' + (e.message || e));
      }

      // 2. 扩展存储（七牛云）：qhash 查询免下载获取 SHA256；失败时回退为下方下载计算
      if (domain) {
        const sha256 = await getQiniuSha256(tempFileURL);
        if (sha256) return { success: true, sha256 };
      }

      // 3. 流式下载并增量计算 SHA256，避免把安装包整体放入内存。
      try {
        const sha256 = await downloadSha256(uniCloud.httpclient, tempFileURL);
        return { success: true, sha256 };
      } catch (e) {
        return failWith('文件下载失败：' + (e.message || e));
      }
    }

    default:
      return failWith('未知 action：' + event.action);
  }
};
