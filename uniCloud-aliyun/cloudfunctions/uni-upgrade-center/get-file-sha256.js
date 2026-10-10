'use strict';

const crypto = require('crypto');

// 云函数 timeout 为 120 秒；下载整体预算需与 qhash、getTempFileURL 及其它开销共同受控。
const DOWNLOAD_OVERALL_TIMEOUT = 100000;
const DOWNLOAD_IDLE_TIMEOUT = 15000;
const REQUEST_TIMEOUT = [5000, 10000];

function positiveTimeout(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function getHeader(headers, name) {
  if (!headers) return '';
  if (typeof headers.get === 'function') return String(headers.get(name) || '');

  const targetName = name.toLowerCase();
  const headerKey = Object.keys(headers).find((key) => key.toLowerCase() === targetName);
  if (!headerKey) return '';

  const value = headers[headerKey];
  return Array.isArray(value) ? value.join(',') : String(value || '');
}

function safeDestroy(stream) {
  if (!stream || typeof stream.destroy !== 'function' || stream.destroyed) return;
  try {
    stream.destroy();
  } catch (_e) {
    // 清理阶段不能覆盖原始流错误。
  }
}

function consumeResponseStream(response, options = {}) {
  const idleTimeout = positiveTimeout(options.idleTimeout, DOWNLOAD_IDLE_TIMEOUT);
  const overallTimeout = positiveTimeout(options.overallTimeout, DOWNLOAD_OVERALL_TIMEOUT);
  const stream = response && response.res;

  if (!stream || typeof stream.on !== 'function') {
    return Promise.reject(new Error('响应流不可用'));
  }

  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    let idleTimer;
    let overallTimer;
    let settled = false;

    function cleanup() {
      clearTimeout(idleTimer);
      clearTimeout(overallTimer);
      stream.removeListener('data', onData);
      stream.removeListener('end', onEnd);
      stream.removeListener('error', onError);
      stream.removeListener('aborted', onAborted);
      stream.removeListener('close', onClose);
    }

    function fail(error) {
      if (settled) return;
      settled = true;
      cleanup();
      safeDestroy(stream);
      reject(error instanceof Error ? error : new Error(String(error)));
    }

    function resetIdleTimer() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        fail(new Error('响应流空闲超时'));
      }, idleTimeout);
    }

    function onData(chunk) {
      if (settled) return;
      try {
        hash.update(chunk);
        resetIdleTimer();
      } catch (error) {
        fail(error);
      }
    }

    function onEnd() {
      if (stream.aborted) {
        fail(new Error('响应流已中止'));
        return;
      }
      if (stream.complete !== true) {
        fail(new Error('响应流提前结束'));
        return;
      }

      settled = true;
      cleanup();
      try {
        resolve(hash.digest('hex'));
      } catch (error) {
        reject(error);
      }
    }

    function onError(error) {
      fail(error || new Error('响应流错误'));
    }

    function onAborted() {
      fail(new Error('响应流已中止'));
    }

    function onClose() {
      if (!settled) fail(new Error('响应流提前结束'));
    }

    stream.on('data', onData);
    stream.once('end', onEnd);
    stream.once('error', onError);
    stream.once('aborted', onAborted);
    stream.once('close', onClose);

    resetIdleTimer();
    overallTimer = setTimeout(() => {
      fail(new Error('响应流总超时'));
    }, overallTimeout);
  });
}

async function downloadSha256(httpclient, url, options = {}) {
  if (!httpclient || typeof httpclient.request !== 'function') {
    throw new Error('HTTP 客户端不可用');
  }

  const overallTimeout = positiveTimeout(options.overallTimeout, DOWNLOAD_OVERALL_TIMEOUT);
  const requestStartedAt = Date.now();
  let requestTimer;
  let response;

  try {
    response = await Promise.race([
      httpclient.request(url, {
        method: 'GET',
        followRedirect: true,
        streaming: true,
        headers: {
          'Accept-Encoding': 'identity',
        },
        // urllib 的 timeout 只覆盖拿响应头之前的阶段，body 由本模块单独计时。
        timeout: REQUEST_TIMEOUT,
      }),
      new Promise((_, reject) => {
        requestTimer = setTimeout(() => {
          reject(new Error('响应流总超时'));
        }, overallTimeout);
      }),
    ]);
  } finally {
    clearTimeout(requestTimer);
  }

  if (!response || response.status !== 200) {
    safeDestroy(response && response.res);
    throw new Error('HTTP ' + (response && response.status));
  }

  const contentEncoding = getHeader(response.headers, 'content-encoding').trim().toLowerCase();
  if (contentEncoding && contentEncoding !== 'identity') {
    safeDestroy(response.res);
    throw new Error('不支持压缩响应：' + contentEncoding);
  }

  const remainingTimeout = overallTimeout - (Date.now() - requestStartedAt);
  if (remainingTimeout <= 0) {
    safeDestroy(response.res);
    throw new Error('响应流总超时');
  }

  return consumeResponseStream(response, {
    idleTimeout: options.idleTimeout,
    overallTimeout: remainingTimeout,
  });
}

module.exports = {
  consumeResponseStream,
  downloadSha256,
};
