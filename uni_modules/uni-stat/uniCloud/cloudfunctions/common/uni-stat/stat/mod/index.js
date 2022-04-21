/**
 * 基础对外模型
 */
module.exports = {
	BaseMod: require('./base'),
	SessionLog: require('./sessionLog'),
	UserSessionLog: require('./userSessionLog'),
	PageLog: require('./pageLog'),
	EventLog: require('./eventLog'),
	ShareLog: require('./shareLog'),
	ErrorLog: require('./errorLog'),
	AppCrashLogs: require('./appCrashLogs'),
	StatResult: require('./statResult'),
	ActvieUsers: require('./actvieUsers'),
	ActvieDevices: require('./actvieDevices'),
	PageResult: require('./pageResult'),
	EventResult: require('./eventResult'),
	ErrorResult: require('./errorResult'),
	Loyalty: require('./loyalty'),
	RunErrors: require('./runErrors'),
}