const {
    Service
} = require('uni-cloud-router')
const uniID = require('uni-id')
module.exports = class UserService extends Service {
    async login({
        username,
        password
    }) {
        return uniID.login({
            username,
            password,
            needPermission: true
        })
    }
}
