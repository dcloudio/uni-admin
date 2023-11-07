// 开发文档：https://uniapp.dcloud.io/uniCloud/clientdb?id=action
const db = uniCloud.database();
const dbCmd = db.command
const signInTable = db.collection('opendb-sign-in');
const scoresTable = db.collection('uni-id-scores');
module.exports = {
	before: async (state, event) => {
		// console.log({state});
		if(state.type == 'create'){
			let date = todayTimestamp()
			let {total} = await signInTable.where({
				user_id:state.auth.uid,
				date,
				isDelete:false
			}).count()
			console.log(total);
			if(total){
			  throw new Error("今天已经签到")
			}
			state.newData.date = date
			state.newData.isDelete = false
		}
	},
	after: async (state, event, error, result) => {
		if (error) {
			throw error
		}
		let date = todayTimestamp()
		//查最近7天的签到情况
		let {data:signInData} = await signInTable.where({
			user_id:state.auth.uid,
			date:dbCmd.gte(date-3600*24*6*1000),
			isDelete:false
		}).get()
		
		let allDate = signInData.map(item=>item.date)
		
		//今天是本轮签到的第几天
		const n = ( date - Math.min(...allDate) )/3600/24/1000+1;
		//换成数字--第几天
		let days = signInData.map(item=>{
			return (n*10000 - (date - item.date)/3600/24/1000*10000)/10000  -1
		})
		
		//查出来用户当前有多少积分
		let {data: [userScore]} = await scoresTable
										.where({user_id:state.auth.uid})
										.orderBy("create_date", "desc")
										.limit(1)
										.get()
		let balance = 0
		if(userScore){
			balance = userScore.balance
		}
		
		if(state.type == 'create'){
			if(n == 7){ //如果已经满一轮就软删除之前的内容
				let setIsDeleteRes = await signInTable.where({
					user_id:state.auth.uid,
					date:dbCmd.neq(date)
				}).update({isDelete:true})
				console.log({setIsDeleteRes});
			}
			//给加积分
			let score = n+days.length==14?60:10 //如果连续签到7天就多加50分，也就是60分
			balance += score
			let addScores = await scoresTable.add({
				user_id:state.auth.uid,
				balance,
				score,
				type:1,
				create_date:Date.now()
			})
			console.log({addScores});
		}
		return {...result,score:balance,signInData,n,days}
	}
}


function todayTimestamp(){
	//时区
	let timeZone = new Date().getTimezoneOffset()/60
	//获得相对于北京时间的时间戳
	let timestamp = Date.now()+3600*1000*(8+timeZone)
	//一天一共多少毫秒
	const D = 3600*24*1000
	//去掉余数，再减去东8区的8小时 得到当天凌晨的时间戳
	return parseInt(timestamp/D)*D - 3600*1000*8
}