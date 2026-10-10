'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const http = require('node:http');
const { PassThrough } = require('node:stream');
const test = require('node:test');

const { downloadSha256 } = require('../get-file-sha256');

function sha256OfChunks(chunks) {
  const hash = crypto.createHash('sha256');
  for (const chunk of chunks) hash.update(chunk);
  return hash.digest('hex');
}

function createLocalHttpClient() {
  let lastOptions;
  return {
    get lastOptions() {
      return lastOptions;
    },
    request(url, options) {
      lastOptions = options;
      return new Promise((resolve, reject) => {
        const request = http.get(url, { headers: options.headers }, (res) => {
          resolve({ status: res.statusCode, headers: res.headers, res });
        });
        request.once('error', reject);
      });
    },
  };
}

async function withServer(handler, callback) {
  const server = http.createServer((request, response) => {
    Promise.resolve(handler(request, response)).catch(() => {
      if (!response.destroyed) response.destroy();
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const url = `http://127.0.0.1:${address.port}`;
  const httpClient = createLocalHttpClient();

  try {
    return await callback(url, httpClient);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function sendChunks(response, chunks) {
  for (const chunk of chunks) {
    if (response.destroyed) return;
    response.write(chunk);
    await new Promise((resolve) => setImmediate(resolve));
  }
  if (!response.destroyed) response.end();
}

test('不同 chunk 切分得到相同 SHA256，并发送流式请求头', async () => {
  const payload = Buffer.from('streamed payload with several chunks');
  const expected = sha256OfChunks([payload]);

  await withServer((request, response) => {
    const chunks = request.url.endsWith('/split')
      ? [payload.subarray(0, 3), payload.subarray(3, 11), payload.subarray(11)]
      : [payload];
    return sendChunks(response, chunks);
  }, async (url, httpClient) => {
    const oneChunk = await downloadSha256(httpClient, `${url}/one`);
    const splitChunks = await downloadSha256(httpClient, `${url}/split`);

    assert.equal(oneChunk, expected);
    assert.equal(splitChunks, expected);
    assert.equal(httpClient.lastOptions.streaming, true);
    assert.equal(httpClient.lastOptions.headers['Accept-Encoding'], 'identity');
  });
});

test('HTTP 非 200 拒绝而不返回摘要', async () => {
  await withServer((_request, response) => {
    response.writeHead(404);
    response.end('missing');
  }, async (url, httpClient) => {
    await assert.rejects(
      downloadSha256(httpClient, url),
      /HTTP 404/
    );
  });
});

test('unexpected compression 被拒绝', async () => {
  await withServer((_request, response) => {
    response.writeHead(200, { 'content-encoding': 'gzip' });
    response.end('compressed-but-not-decoded');
  }, async (url, httpClient) => {
    await assert.rejects(
      downloadSha256(httpClient, url),
      /不支持压缩响应/
    );
  });
});

test('截断流和 early close 拒绝部分 hash', async () => {
  await withServer((_request, response) => {
    response.writeHead(200, { 'content-length': '100' });
    response.write('partial data');
    setTimeout(() => {
      if (response.socket) response.socket.destroy();
    }, 10);
  }, async (url, httpClient) => {
    await assert.rejects(
      downloadSha256(httpClient, url),
      /响应流提前结束|响应流错误|响应流已中止/
    );
  });
});

test('end 但 complete=false 时拒绝部分 hash', async () => {
  const stream = new PassThrough();
  stream.complete = false;
  const httpClient = {
    request: async () => ({ status: 200, headers: {}, res: stream }),
  };
  const result = downloadSha256(httpClient, 'http://local.test/file');
  stream.end('partial data');

  await assert.rejects(result, /响应流提前结束/);
});

test('body idle deadline 独立于响应头超时', async () => {
  await withServer((_request, response) => {
    response.write('first chunk');
    setTimeout(() => {
      if (!response.destroyed) response.end('late chunk');
    }, 80);
  }, async (url, httpClient) => {
    await assert.rejects(
      downloadSha256(httpClient, url, { idleTimeout: 25, overallTimeout: 500 }),
      /响应流空闲超时/
    );
  });
});

test('overall deadline 独立于持续有数据的响应流', async () => {
  await withServer((_request, response) => {
    let timer;
    const writeAgain = () => {
      if (response.destroyed) return;
      response.write('tick');
      timer = setTimeout(writeAgain, 10);
    };
    response.on('close', () => clearTimeout(timer));
    writeAgain();
  }, async (url, httpClient) => {
    await assert.rejects(
      downloadSha256(httpClient, url, { idleTimeout: 100, overallTimeout: 45 }),
      /响应流总超时/
    );
  });
});

test('数十 MB 流式响应使用背压并完成 hash，成功后不遗留计时器', async () => {
  const chunk = Buffer.alloc(64 * 1024, 0x5a);
  const totalBytes = 24 * 1024 * 1024;
  const expectedHash = crypto.createHash('sha256');
  for (let written = 0; written < totalBytes; written += chunk.length) {
    expectedHash.update(chunk);
  }
  const expected = expectedHash.digest('hex');

  await withServer((_request, response) => {
    let written = 0;
    const writeAgain = () => {
      try {
        while (!response.destroyed && written < totalBytes) {
          written += chunk.length;
          if (!response.write(chunk)) {
            response.once('drain', writeAgain);
            return;
          }
        }
        if (!response.destroyed) response.end();
      } catch (_e) {
        response.destroy();
      }
    };
    writeAgain();
  }, async (url, httpClient) => {
    const actual = await downloadSha256(httpClient, url, {
      idleTimeout: 5000,
      overallTimeout: 10000,
    });
    assert.equal(actual, expected);
  });
});
