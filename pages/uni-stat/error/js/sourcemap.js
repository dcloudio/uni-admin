import { fileToUrl } from '@/js_sdk/uni-stat/util.js';
import { stacktracey, originalPositionFor, uniStracktraceyPreset, utsStracktraceyPreset } from '@dcloudio/uni-stacktracey';

const db = uniCloud.database(); // 初始化数据库实例
const _ = db.command; // 定义数据库操作符

const dbNameSourceMap = 'uni-stat-error-source-map'; // sourceMap资源存放的表名
const sourcemapPrefix = '__UNI__/uni-stat/sourcemap';
const SOURCE_MAP_UPLOAD_CONCURRENCY = 5;
let sourcemapFileCache = {};

export function createSourceMapUploadState() {
  return {
    tempFileTasks: [],
    tempFiles: [],
    clear() {
      this.tempFileTasks.length = this.tempFiles.length = 0;
    },
  };
}

export function initUploadSourcemapCloud(uniStat = {}) {
  if (!uniStat.uploadSourceMapCloudSpaceId) {
    return uniCloud;
  }
  if (uniStat.uploadSourceMapCloudPlatform === 'aliyun') {
    const endpoint = uniStat.uploadSourceMapCloudSpaceId.indexOf('mp-') === 0 ? 'https://api.next.bspapp.com' : 'https://api.bspapp.com';
    return uniCloud.init({
      provider: 'aliyun',
      spaceId: uniStat.uploadSourceMapCloudSpaceId,
      clientSecret: uniStat.uploadSourceMapCloudClientSecret,
      endpoint,
    });
  }
  return uniCloud.init({
    provider: 'tencent',
    spaceId: uniStat.uploadSourceMapCloudSpaceId,
  });
}

export const sourceMapMethods = {
  logSourceMapDebug(event, payload = {}) {
    try {
      console.info('[sourceMapDebug] ' + event, payload);
    } catch (error) {
      console.info('[sourceMapDebug] ' + event);
    }
  },
  formatRawErrorMessage(err) {
    if (typeof err === 'string' && err.trim()) {
      return err;
    }
    if (err && typeof err === 'object') {
      try {
        return JSON.stringify(err, null, 2);
      } catch (error) {
        return String(err);
      }
    }
    return '暂无错误数据';
  },
  closeErrPopup() {
    this.$refs.errMsg.close();
  },
  errMsgPopupChange(res) {
    if (res.show) {
      const err = this.errorItem.msgTooltip;
      if (this.msgLoading) {
        this.closeErrPopup();
        return;
      }
      const rawErrorMessage = this.formatRawErrorMessage(err);
      this.errMsg = '';
      const oldMsg = this.parsedErrors[rawErrorMessage];
      if (!oldMsg) {
        this.msgLoading = true;
        this.parseError(this.errorItem);
      } else {
        this.errMsg = oldMsg;
      }
    } else {
      this.msgLoading = false;
    }
  },
  async parseError(item) {
    let { msgTooltip: err, appid, platform_code, version } = item;
    const rawErrorMessage = this.formatRawErrorMessage(err);
    const resolvedAppid = appid || this.query.appid || this.uploadOptions.appid || '';
    const platformCode = platform_code || '';
    const base = '/' + resolvedAppid + '/' + platformCode + '/' + version + '/';
    this.logSourceMapDebug('parseError:start', {
      base,
      appid,
      resolvedAppid,
      platform_code: platformCode,
      version,
      hash: item.hash || '',
      rawErrorPreview: rawErrorMessage.slice(0, 300),
    });

    let fileList = Array.isArray(sourcemapFileCache[base]) ? sourcemapFileCache[base] : [];
    sourcemapFileCache[base] = fileList;
    const sourceMapMetadataQueried = {};

    try {
      err = JSON.parse(err);
      this.logSourceMapDebug('parseError:json-parsed', {
        base,
        parsedType: Array.isArray(err) ? 'array' : typeof err,
      });
    } catch (e) {}

    const stacktraceyOptions = {
      base,
      uniPlatform: platformCode,
      splitThirdParty: true,
    };
    const logSourceMapDebug = this.logSourceMapDebug.bind(this);
    let mappingDebugQueue = [];
    let sourceMapReadFound = false;
    let sourceMapMappingMatched = false;
    let stackItemCount = 0;
    const missingSourceMapFiles = [];
    const invalidSourceMapUrls = [];
    const failedSourceMapUrls = [];
    const normalizeCandidatePaths = (paths = []) => Array.from(new Set((Array.isArray(paths) ? paths : [paths]).filter(Boolean)));
    const pushUniqueDiagnostic = (list, payload) => {
      const key = JSON.stringify(payload);
      if (!list.find((item) => JSON.stringify(item) === key)) list.push(payload);
    };
    const findSourceMapFile = (candidate) => fileList.find((item) => item.url === candidate || item.cloud_path === candidate);
    const appendSourceMapFiles = (list = []) => {
      list.forEach((item) => {
        if (item && item.cloud_path && !fileList.find((file) => file.cloud_path === item.cloud_path)) fileList.push(item);
      });
      sourcemapFileCache[base] = fileList;
    };
    const fillSourceMapTempFileUrls = async (list = []) => {
      const fileListWithFileId = list.filter((item) => item && item.file_id);
      const fileIds = fileListWithFileId.map((item) => item.file_id);
      if (!fileIds.length) return list;
      try {
        const res = await uniCloud.getTempFileURL({ fileList: fileIds });
        const tempFileUrlMap = {};
        (res.fileList || []).forEach((item) => {
          const fileId = item.file_id;
          if (fileId && item.tempFileURL) tempFileUrlMap[fileId] = item.tempFileURL;
        });
        return list.map((item) => {
          const fileId = item && item.file_id;
          return fileId && tempFileUrlMap[fileId] ? Object.assign({}, item, { url: tempFileUrlMap[fileId] }) : item;
        });
      } catch (error) {
        this.logSourceMapDebug('parseError:get-temp-file-url:fail', { base, fileIds, error: error && error.message ? error.message : error });
        return list;
      }
    };
    const ensureSourceMapFiles = async (candidateCloudPaths = []) => {
      const missingCandidateCloudPaths = normalizeCandidatePaths(candidateCloudPaths).filter((candidateCloudPath) => {
        return !sourceMapMetadataQueried[candidateCloudPath] && !findSourceMapFile(candidateCloudPath);
      });
      if (!missingCandidateCloudPaths.length) return [];
      missingCandidateCloudPaths.forEach((candidateCloudPath) => {
        sourceMapMetadataQueried[candidateCloudPath] = true;
      });
      const list = await this.getSourceMapFileList({ base, candidateCloudPaths: missingCandidateCloudPaths });
      const listWithTempUrls = await fillSourceMapTempFileUrls(list);
      appendSourceMapFiles(listWithTempUrls);
      return listWithTempUrls;
    };
    const buildDirectMapUrls = (url = '') => {
      if (!/^https?:/i.test(url)) return [];
      if (/\.map([?#].*)?$/i.test(url)) return [url];
      if (/\.js([?#].*)?$/i.test(url)) return normalizeCandidatePaths([url.replace(/\.js([?#].*)?$/i, '.js.map$1'), url + '.map']);
      return [];
    };
    const createSourceMapMatchContext = (context = {}) =>
      Object.assign(
        {
          fileRelative: '',
          cloud_path: '',
          cloud_path_web: '',
          candidateCloudPaths: [],
          candidateFiles: [],
          fileItem: null,
          resolvedUrl: '',
          directMapUrls: [],
        },
        context
      );
    const buildSourceMapMatchContext = (file, fileName, fileRelative) => {
      fileRelative = typeof fileRelative === 'string' ? fileRelative : '';
      if (fileRelative.indexOf('(') !== -1) {
        let fileRelativeMatch = fileRelative.match(/\((.*)/);
        fileRelative = fileRelativeMatch && fileRelativeMatch[1] ? fileRelativeMatch[1] : '';
      }
      if (!base || !fileRelative) return createSourceMapMatchContext({ fileRelative, directMapUrls: buildDirectMapUrls(file) });
      if (typeof sourceRoot !== 'undefined') {
        const sourceRootPath = fileRelative.replace(sourceRoot, base + '/') + '.map';
        const cloud_path = sourceRootPath.indexOf(sourcemapPrefix) === 0 ? sourceRootPath : sourcemapPrefix + sourceRootPath;
        const candidateCloudPaths = normalizeCandidatePaths([cloud_path, sourceRootPath]);
        const candidateFiles = candidateCloudPaths.map((candidateCloudPath) => fileList.find((item) => item.cloud_path === candidateCloudPath)).filter(Boolean);
        const fileItem = candidateFiles[0];
        return createSourceMapMatchContext({
          fileRelative,
          cloud_path,
          candidateCloudPaths,
          candidateFiles,
          fileItem,
          resolvedUrl: fileItem ? fileItem.url : sourceRootPath,
          directMapUrls: buildDirectMapUrls(file),
        });
      }
      let baseAfter = '';
      if (platformCode.indexOf('mp-') > -1 && fileRelative.indexOf('app-service.js') !== -1) {
        baseAfter = (base.match(/\w$/) ? '/' : '') + '__WEIXIN__';
        if (fileRelative === fileName) baseAfter += '/__APP__';
      }
      if (baseAfter && !!fileRelative.match(/^\w/)) baseAfter += '/';
      let path = base + baseAfter + fileRelative + '.map';
      let cloud_path = sourcemapPrefix + path;
      let cloud_path_web;
      if (platformCode === 'web') {
        let fileRelativeWeb = fileRelative.substring(fileRelative.indexOf('/') + 1);
        let pathWeb = base + baseAfter + fileRelativeWeb + '.map';
        cloud_path_web = sourcemapPrefix + pathWeb;
      }
      const candidateCloudPaths = normalizeCandidatePaths([
        cloud_path,
        cloud_path_web,
        cloud_path ? cloud_path.replace(/\.js\.map$/, '.map') : '',
        cloud_path_web ? cloud_path_web.replace(/\.js\.map$/, '.map') : '',
        cloud_path && cloud_path.endsWith('.map') ? cloud_path.slice(0, -4) : '',
        cloud_path_web && cloud_path_web.endsWith('.map') ? cloud_path_web.slice(0, -4) : '',
      ]);
      const candidateFiles = candidateCloudPaths.map((candidateCloudPath) => fileList.find((item) => item.cloud_path === candidateCloudPath)).filter(Boolean);
      const fileItem = candidateFiles[0];
      const resolvedUrl = fileItem ? fileItem.url : cloud_path;
      const directMapUrls = buildDirectMapUrls(file);
      return createSourceMapMatchContext({ fileRelative, cloud_path, cloud_path_web, candidateCloudPaths, candidateFiles, fileItem, resolvedUrl, directMapUrls });
    };
    const resolveSourceMapUrl = (file, fileName, fileRelative) => {
      const {
        fileRelative: normalizedFileRelative,
        cloud_path,
        cloud_path_web,
        candidateCloudPaths,
        fileItem,
        resolvedUrl,
      } = buildSourceMapMatchContext(file, fileName, fileRelative);
      logSourceMapDebug('parseError:resolve-source-map-url', {
        base,
        file,
        fileName,
        fileRelative: normalizedFileRelative,
        cloud_path,
        cloud_path_web,
        candidateCloudPaths,
        matched: !!fileItem,
        matchedCloudPath: fileItem ? fileItem.cloud_path : '',
        resolvedUrl,
      });
      return resolvedUrl;
    };
    const isValidSourceMapContent = (content) => {
      if (typeof content !== 'string' || !content.trim()) return false;
      try {
        const parsed = JSON.parse(content);
        return !!(parsed && typeof parsed === 'object' && parsed.version && (parsed.mappings || parsed.sources));
      } catch (error) {
        return false;
      }
    };
    const requestSourceMapContent = (requestUrl) =>
      new Promise((resolve) => {
        uni.request({
          url: requestUrl,
          dataType: 'string',
          success: (res) => resolve({ ok: res.statusCode === 200, statusCode: res.statusCode, content: typeof res.data === 'string' ? res.data : '' }),
          fail: (error) => resolve({ ok: false, statusCode: 0, content: '', error: error && error.errMsg ? error.errMsg : error }),
        });
      });
    const probeNearbyOriginalPositions = (content, mappingDebugMeta) => {
      if (!mappingDebugMeta) return Promise.resolve([]);
      const attempts = [];
      const offsetCandidates = [-3, -2, -1, 0, 1, 2, 3];
      const columnCandidates = Array.from(new Set([Number(mappingDebugMeta.column) || 0, 0]));
      offsetCandidates.forEach((offset) =>
        columnCandidates.forEach((column) => {
          const line = (Number(mappingDebugMeta.line) || 0) + offset;
          if (line > 0 && column >= 0) attempts.push({ offset, line, column });
        })
      );
      let probePromise = Promise.resolve([]);
      attempts.forEach((attempt) => {
        probePromise = probePromise.then((results) =>
          originalPositionFor(content, { line: attempt.line, column: attempt.column }, false)
            .then((mappedPosition) => {
              if (mappedPosition && mappedPosition.source) results.push({ ...attempt, mappedPosition });
              return results;
            })
            .catch(() => results)
        );
      });
      return probePromise;
    };
    const fetchSourceMapContent = (sourcemapUrl, mappingDebugMeta = null) => {
      const matchedFile = findSourceMapFile(sourcemapUrl);
      const requestUrl = /^https?:/i.test(sourcemapUrl) ? sourcemapUrl : matchedFile && matchedFile.url ? matchedFile.url : '';
      logSourceMapDebug('parseError:get-source-map-content:start', {
        base,
        sourcemapUrl,
        requestUrl,
        usedMatchedFileUrl: !!(matchedFile && matchedFile.url && requestUrl === matchedFile.url),
      });
      if (!/^https?:/i.test(requestUrl)) {
        logSourceMapDebug('parseError:get-source-map-content:skip-non-http', { base, sourcemapUrl, requestUrl });
        return Promise.resolve('');
      }
      return requestSourceMapContent(requestUrl).then((result) => {
        if (!result.ok) {
          pushUniqueDiagnostic(failedSourceMapUrls, { requestUrl, statusCode: result.statusCode, error: result.error || '' });
          logSourceMapDebug('parseError:get-source-map-content:fail', { base, requestUrl, statusCode: result.statusCode, error: result.error || '' });
          return '';
        }
        logSourceMapDebug('parseError:get-source-map-content:success', {
          base,
          requestUrl,
          statusCode: result.statusCode,
          contentLength: result.content.length,
          validSourceMap: isValidSourceMapContent(result.content),
        });
        if (!isValidSourceMapContent(result.content)) {
          pushUniqueDiagnostic(invalidSourceMapUrls, { requestUrl, contentLength: result.content.length });
          return '';
        }
        sourceMapReadFound = true;
        if (!mappingDebugMeta) return result.content;
        return originalPositionFor(result.content, { line: mappingDebugMeta.line + (stacktraceyOptions.lineOffset || 0), column: mappingDebugMeta.column }, false)
          .then((mappedPosition) => {
            logSourceMapDebug('parseError:original-position-for', { base, requestUrl, before: mappingDebugMeta, after: mappedPosition || null });
            if (mappedPosition && mappedPosition.source) {
              sourceMapMappingMatched = true;
              return result.content;
            }
            return probeNearbyOriginalPositions(result.content, mappingDebugMeta).then(() => result.content);
          })
          .catch((error) => {
            logSourceMapDebug('parseError:original-position-for-fail', { base, requestUrl, error: error && error.message ? error.message : error });
            return result.content;
          });
      });
    };

    if (['harmony', 'harmonyos'].indexOf(String(platformCode).toLocaleLowerCase()) === -1 && ['ios', 'android', 'app'].indexOf(platformCode) > -1)
      stacktraceyOptions.lineOffset = -1;

    let preset = {};
    if (rawErrorMessage.includes('UTSError')) {
      const list = await this.getSourceMapFileList({ base });
      const listWithTempUrls = await fillSourceMapTempFileUrls(list);
      appendSourceMapFiles(listWithTempUrls);
      const manifestItem = fileList.find((item) => item.name === '.manifest.json');
      const manifestPath = manifestItem ? manifestItem.url || manifestItem.cloud_path : '';
      if (!manifestPath) {
        console.error('缺少' + base + '对应的 .manifest.json 文件，请先上传');
        this.errMsg = rawErrorMessage;
        this.msgLoading = false;
        return;
      }
      stacktraceyOptions.sourceMapRoot = manifestPath;
      preset = {
        ...utsStracktraceyPreset(stacktraceyOptions),
        parseSourceMapUrl(file) {
          let fileItem = fileList.find((item) => item.cloud_path && item.cloud_path.indexOf(base + file + '.map') > -1);
          return fileItem ? fileItem.url || fileItem.cloud_path : '';
        },
      };
    } else {
      const basePreset = uniStracktraceyPreset(stacktraceyOptions);
      preset = {
        ...basePreset,
        parseSourceMapUrl(file, fileName, fileRelative) {
          return resolveSourceMapUrl(file, fileName, fileRelative);
        },
        parseStacktrace(str) {
          const stack = basePreset.parseStacktrace(str);
          mappingDebugQueue = stack.items
            .filter((item) => !item.thirdParty)
            .map((item) => ({ file: item.file, fileName: item.fileName, fileRelative: item.fileRelative, line: Number(item.line) || 0, column: Number(item.column) || 0 }));
          stackItemCount = mappingDebugQueue.length;
          logSourceMapDebug('parseError:stack-items-before-map', { base, items: mappingDebugQueue.slice(0, 10) });
          return stack;
        },
        getSourceMapContent(file, fileName, fileRelative) {
          const matchContext = buildSourceMapMatchContext(file, fileName, fileRelative);
          const candidateCloudPaths = Array.isArray(matchContext.candidateCloudPaths) ? matchContext.candidateCloudPaths : [];
          const directMapUrls = Array.isArray(matchContext.directMapUrls) ? matchContext.directMapUrls : [];
          const mappingDebugMeta = mappingDebugQueue.length ? mappingDebugQueue.shift() : null;
          return ensureSourceMapFiles(candidateCloudPaths).then(() => {
            const matchedCandidateFiles = candidateCloudPaths.map((candidateCloudPath) => findSourceMapFile(candidateCloudPath)).filter(Boolean);
            const candidateRequestEntries = normalizeCandidatePaths([...matchedCandidateFiles.map((item) => item.url), ...directMapUrls])
              .map((candidate) => ({
                candidate,
                requestUrl: /^https?:/i.test(candidate) ? candidate : (findSourceMapFile(candidate) || {}).url || '',
              }))
              .filter((item) => /^https?:/i.test(item.requestUrl));
            if (!candidateRequestEntries.length && mappingDebugMeta)
              pushUniqueDiagnostic(missingSourceMapFiles, { file: mappingDebugMeta.file, fileRelative: mappingDebugMeta.fileRelative, candidateCloudPaths, directMapUrls });
            let contentPromise = Promise.resolve('');
            candidateRequestEntries.forEach((entry) => {
              contentPromise = contentPromise.then((content) => content || fetchSourceMapContent(entry.candidate, mappingDebugMeta));
            });
            return contentPromise;
          });
        },
        asTableStacktrace(payload) {
          logSourceMapDebug('parseError:stack-items-after-map', {
            base,
            items: (payload && payload.stack && Array.isArray(payload.stack.items) ? payload.stack.items : [])
              .slice(0, 10)
              .map((item) => ({
                file: item.file,
                fileRelative: item.fileRelative,
                fileShort: item.fileShort,
                line: item.line,
                column: item.column,
                parsed: !!item.parsed,
                beforeParse: item.beforeParse || '',
              })),
          });
          return basePreset.asTableStacktrace(payload);
        },
      };
    }

    stacktracey(err, { preset })
      .then((res) => {
        if (typeof res === 'string') {
          this.errMsg = res;
        } else {
          const { userError, thirdParty } = res;
          const separate =
            userError.length && thirdParty.length ? '\n\n------------' + (platformCode.indexOf('mp-') !== -1 ? platformCode : 'uni-app') + ' runtime error------------\n\n' : '';
          this.errMsg = userError + separate + thirdParty || rawErrorMessage;
          if (!rawErrorMessage.includes('UTSError') && sourceMapReadFound && !sourceMapMappingMatched) {
            const mismatchHint =
              '\n\n[sourceMap] 已读取到合法 sourceMap，但未命中当前堆栈坐标。通常表示上传的 sourceMap 与当前报错不是同一次构建产物，或虽然版本号一致但包内容已变化。';
            this.errMsg = rawErrorMessage + mismatchHint;
          }
          if (
            !rawErrorMessage.includes('UTSError') &&
            stackItemCount &&
            !sourceMapReadFound &&
            (missingSourceMapFiles.length || invalidSourceMapUrls.length || failedSourceMapUrls.length)
          )
            this.errMsg = rawErrorMessage;
        }
        this.parsedErrors[rawErrorMessage] = this.errMsg;
        this.logSourceMapDebug('parseError:success', { base, sourceMapReadFound, sourceMapMappingMatched, parsedPreview: this.errMsg.slice(0, 300) });
      })
      .catch((error) => {
        this.logSourceMapDebug('parseError:failed', { base, error: error && error.message ? error.message : error, fallbackPreview: rawErrorMessage.slice(0, 300) });
        this.errMsg = rawErrorMessage;
      })
      .finally(() => {
        this.msgLoading = false;
      });
  },
  openUploadPopup() {
    const { appid, uni_platform } = this.query;

    this.uploadOptions = {
      appid,
      uni_platform,
      version: '',
    };
    this.$refs.upload.open();
  },
  closeUploadPopup() {
    this.$refs.upload.close();
  },
  createUploadFileTask(prefix, fileDiskPath, filePath, onUploadProgress) {
    const cloudPath = prefix + fileDiskPath;

    return this.uploadSourcemapCloud.uploadFile({
      filePath,
      cloudPath,
      onUploadProgress,
    });
  },
  async choosefile() {
    if (!this.vaildate) {
      this.uploadMsg = '请先将应用、平台、版本填写完整';
      return;
    }
    const { appid, uni_platform, version } = this.uploadOptions;

    const base = '/' + appid + '/' + uni_platform + '/' + version + '/';
    const prefix = sourcemapPrefix + base;
    this.logSourceMapDebug('upload:prepare', { appid, uni_platform, version, base, prefix });

    // 原生 input 上传逻辑
    const inputEl = document.createElement('input');
    inputEl.type = 'file';
    inputEl.directory = true;
    inputEl.webkitdirectory = true;
    inputEl.click();
    inputEl.addEventListener('change', async () => {
      this.uploadFile.clear();
      this.uploadSuccessTaskNames = [];

      const fileList = inputEl.files; /* now you can work with the file list */
      if (!fileList.length) return;
      this.logSourceMapDebug('upload:selected-files', {
        base,
        count: fileList.length,
        firstFiles: Array.from(fileList)
          .slice(0, 5)
          .map((file) => file.webkitRelativePath || file.name),
      });

      Array.prototype.forEach.call(fileList, (file) => {
        const path = fileToUrl(file);
        const fileDiskPath = file.webkitRelativePath.split('/').slice(1).join('/');
        const cloudPath = prefix + fileDiskPath;
        this.uploadFile.tempFileTasks.push({
          fileDiskPath,
          cloudPath,
          path,
          size: (file.size / 1024).toFixed(2) + 'kb',
          name: file.name,
          state: 0,
          progress: 0,
          file,
        });
        Object.defineProperty(file, 'path', {
          get() {
            return path;
          },
        });
        this.uploadFile.tempFiles.push(file);
      });
      const uploadSourceMapTask = (cur) =>
        new Promise((resolve, reject) => {
          // 已上传的文件
          if (this.uploadSuccessTaskNames.indexOf(cur.cloudPath) !== -1) {
            cur.progress = 1;
            cur.state = 1;
            resolve();
          } else {
            this.createUploadFileTask(prefix, cur.fileDiskPath, cur.path, (OnUploadProgressRes) => {
              const { loaded, total } = OnUploadProgressRes;
              cur.progress = loaded / total;
            })
              .then((uploadRes) => {
                const cloudPath = cur.cloudPath;
                let fileID = uploadRes.fileID;
                this.logSourceMapDebug('upload:file-uploaded', { name: cur.name, cloudPath, fileID });
                let file = { appid, uni_platform, version, file_id: fileID, url: '', name: cur.name, size: cur.file.size, cloud_path: cloudPath, base };
                this.uploadSuccessTaskNames.push(cur.cloudPath);
                cur.state = 1;
                resolve(file);
              })
              .catch((err) => {
                cur.state = -1;
                reject(cur.name + ' 上传失败：' + JSON.stringify(err));
              });
          }
        });
      const tasks = this.uploadFile.tempFileTasks;
      const dataArr = [];
      const uploadErrors = [];
      let nextUploadIndex = 0;
      const uploadNext = async () => {
        const currentIndex = nextUploadIndex++;
        if (currentIndex >= tasks.length) return;
        try {
          const res = await uploadSourceMapTask(tasks[currentIndex]);
          if (res) dataArr[currentIndex] = res;
        } catch (err) {
          uploadErrors.push(err);
          this.logSourceMapDebug('upload:file-failed', { base, error: String(err) });
        }
        return uploadNext();
      };
      const uploadConcurrency = Math.min(SOURCE_MAP_UPLOAD_CONCURRENCY, tasks.length);
      await Promise.all(Array.from({ length: uploadConcurrency }, uploadNext));
      const sourceMapFiles = dataArr.filter(Boolean);

      if (sourceMapFiles && sourceMapFiles.length > 0) {
        this.logSourceMapDebug('upload:save-metadata', { base, count: sourceMapFiles.length, sampleCloudPaths: sourceMapFiles.slice(0, 5).map((item) => item.cloud_path) });
        await this.addSourceMapFile(sourceMapFiles);
      } else {
        this.logSourceMapDebug('upload:no-metadata-to-save', { base });
      }
      if (uploadErrors.length) {
        const message = uploadErrors.length + ' 个 sourceMap 文件上传失败，已保存成功上传的文件元数据';
        this.logSourceMapDebug('upload:partial-failed', { base, failedCount: uploadErrors.length, errors: uploadErrors.slice(0, 5).map((error) => String(error)) });
        uni.showToast({ title: message, icon: 'none', duration: 3000 });
      }
    });
  },
  openErrPopup(item) {
    this.errorItem = item;
    this.$refs.errMsg.open();
  },

  // 将sourceMap资源文件写入数据库
  async addSourceMapFile(dataArr) {
    const cloudPathArr = dataArr.map((item) => item.cloud_path);
    // 先删除同版本的文件（避免重复上传时出现错误）
    await db
      .collection(dbNameSourceMap)
      .where({
        cloud_path: _.in(cloudPathArr),
      })
      .remove();
    // 再添加
    await db.collection(dbNameSourceMap).add(dataArr);
  },
  // 从数据库中获取sourceMap资源文件
  async getSourceMapFileList(obj) {
    let { base, candidateCloudPaths = [] } = obj || {};
    candidateCloudPaths = Array.from(new Set((Array.isArray(candidateCloudPaths) ? candidateCloudPaths : [candidateCloudPaths]).filter(Boolean)));
    const where = { base };
    if (candidateCloudPaths.length) where.cloud_path = _.in(candidateCloudPaths);
    let fileListRes = await db.collection(dbNameSourceMap).where(where).limit(1000).get();
    const result = fileListRes.result.data || [];
    this.logSourceMapDebug('parseError:query-source-map-files', {
      base,
      candidateCloudPaths,
      count: result.length,
      sampleCloudPaths: result.slice(0, 5).map((item) => item.cloud_path),
    });
    return result;
  },
};
