export default {
	//调试模式
	"debug": true,
	/*
		登录类型 未列举到的或运行环境不支持的，将被自动隐藏。
		如果需要在不同平台有不同的配置，直接用条件编译即可
	*/
	"loginTypes": [
		// "qq",
		// "xiaomi",
		// "sinaweibo",
		// "taobao",
		// "facebook",
		// "google",
		// "alipay",
		// "douyin",
		
		// #ifdef APP
		"univerify",
		// #endif
		// #ifndef H5
		"weixin",
		// #endif
		"username",
		// #ifdef APP
		"apple",
		// #endif
		"smsCode"
	],
	//政策协议
	"agreements": {
		"serviceUrl": "https://xxx", //用户服务协议链接
		"privacyUrl": "https://xxx", //隐私政策条款链接
		// 哪些场景下显示，1.注册（包括登录并注册，如：微信登录、苹果登录、短信验证码登录）、2.登录（如：用户名密码登录）
		"scope": ['register', 'login']
	}
}
