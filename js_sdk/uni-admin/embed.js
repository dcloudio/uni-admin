/**
 * 嵌入模式：解析 URL 参数，支持通过外部链接注入 token 和控制窗口显隐
 * 仅在 H5 平台生效
 *
 * URL 参数：
 *   token          - 登录 token
 *   tokenExpired   - token 过期时间戳（毫秒）
 *   hideLeftWindow - 隐藏左侧导航窗口（任意非空值生效）
 *   hideTopWindow  - 隐藏顶部窗口（任意非空值生效）
 *
 * 用法：<iframe src="http://host/admin/#/pages/home?token=xxx&hideLeftWindow=1&hideTopWindow=1"></iframe>
 */
export function initEmbed() {
  // #ifdef WEB
  const searchStr = location.hash.includes('?') ? location.hash.split('?')[1] : location.search.replace(/^\?/, '');
  const urlParams = new URLSearchParams(searchStr);

  const hideLeftWindow = urlParams.get('hideLeftWindow');
  const hideTopWindow = urlParams.get('hideTopWindow');
  const token = urlParams.get('token');
  const tokenExpired = urlParams.get('tokenExpired');

  // 立即从 URL 中移除敏感参数，防止 token 残留在浏览器地址栏和历史记录中
  if (token || tokenExpired) {
    try {
      if (location.hash.includes('?')) {
        const cleanHash = location.hash.split('?')[0];
        const cleanParams = new URLSearchParams(location.hash.split('?')[1]);
        cleanParams.delete('token');
        cleanParams.delete('tokenExpired');
        const remaining = cleanParams.toString();
        history.replaceState(null, '', location.pathname + cleanHash + (remaining ? '?' + remaining : ''));
      }
    } catch (e) {
      // 部分环境下 replaceState 可能受限，降级忽略
    }
  }

  // 外部注入 token（在登录检查之前）
  if (token) {
    uni.setStorageSync('uni_id_token', token);
    if (tokenExpired) {
      uni.setStorageSync('uni_id_token_expired', Number(tokenExpired));
    }
  }

  // 隐藏窗口（通过 CSS 类名控制）
  if (hideLeftWindow) {
    document.body.classList.add('uni-embed-hide-left');
    document.body.classList.remove('uni-app--showleftwindow');
  }
  if (hideTopWindow) {
    document.body.classList.add('uni-embed-hide-top');
  }
  // #endif
}
