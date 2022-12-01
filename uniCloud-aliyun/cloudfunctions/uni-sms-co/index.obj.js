// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const createConfig = require('uni-config-center')
const buildTemplateData = require('./build-template-data')
const { parserDynamicField, checkIsStaticTemplate } = require('./utils')
const schemaNameAdapter = require('./schema-name-adapter')

const uniSmsCo = uniCloud.importObject('uni-sms-co')
const db = uniCloud.database()
const smsConfig = createConfig({
  pluginId: 'uni-sms-co'
}).config()

function errCode(code) {
  return 'uni-sms-co-' + code
}

const tableNames = {
	template: 'opendb-sms-template',
	task: 'opendb-sms-task',
	log: 'opendb-sms-log'
}

module.exports = {
  _before: async function () { // 通用预处理器
    if (!smsConfig.smsKey || smsConfig.smsKey.length <= 20 || !smsConfig.smsSecret  || smsConfig.smsSecret.length <= 20) {
      throw new Error('请先配置smsKey和smsSecret')
    }

	this.tableNames = tableNames

	/**
	* 优化 schema 的命名规范，需要兼容 uni-admin@2.1.6 以下版本
	* 如果是在uni-admin@2.1.6版本以上创建的项目可以将其注释
	* */
	await schemaNameAdapter.call(this)
  },
  _after: function (error, result) {
	  if (error) {
		if (error instanceof Error) {
			return {
				errCode: 'error',
				errMsg: error.message
			}
		}

		if (error.errCode) {
			return error
		}

		throw error
	  }

	  return result
  },
  /**
 * 创建短信任务
 * @param {Object} to
 * @param {Boolean} to.all=false 全部用户发送
 * @param {String} to.type=user to.all=true时用来区分发送类型
 * @param {Array} to.receiver 用户ID's / 用户标签ID's
 * @param {String} templateId 短信模板ID
 * @param {Array} templateData 短信模板数据
 * @param {String} options.taskName 任务名称
 */
  async createSmsTask(to, templateId, templateData, options = {}) {
    if (!templateId) {
      return {
        errCode: errCode('template-id-required'),
        errMsg: '缺少templateId'
      }
    }

    if (!to.all && (!to.receiver || to.receiver.length <= 0)) {
      return {
        errCode: errCode('send-users-is-null'),
        errMsg: '请选择要发送的用户'
      }
    }

    const clientInfo = this.getClientInfo()

    const {data: templates} = await db.collection(this.tableNames.template).where({_id: templateId}).get()
    if (templates.length <= 0) {
      return {
        errCode: errCode('template-not-found'),
        errMsg: '短信模板不存在'
      }
    }
    const [template] = templates

    // 创建短信任务
    const task = await db.collection(this.tableNames.task).add({
      app_id: clientInfo.appId,
      name: options.taskName,
      template_id: templateId,
      template_contnet: template.content,
      vars: templateData,
      to,
      send_qty: 0,
      success_qty: 0,
      fail_qty: 0,
      create_date: Date.now()
    })

    uniSmsCo.createUserSmsMessage(task.id)

    return new Promise(resolve => setTimeout(() => resolve({
      errCode: 0,
      errMsg: '任务创建成功',
      taskId: task.id
    }), 300))
  },
  async createUserSmsMessage(taskId, execData = {}) {
    const parallel = 100
    let beforeId
    const { data: tasks } = await db.collection(this.tableNames.task).where({ _id: taskId }).get()

    if (tasks.length <= 0) {
      return {
        errCode: errCode('task-id-not-found'),
        errMsg: '任务ID不存在'
      }
    }

    const [task] = tasks
    const query = {
      mobile: db.command.exists(true)
    }

    // 指定用户发送
    if (!task.to.all && task.to.type === 'user') {
      let index = 0
      if (execData.beforeId) {
        const i = task.to.receiver.findIndex(id => id === execData.beforeId)
        index = i !== -1 ? i + 1 : 0
      }

      const receiver = task.to.receiver.slice(index, index + parallel)
      query._id = db.command.in(receiver)
      beforeId = receiver[receiver.length - 1]
    }

    // 指定用户标签
    if (task.to.type === 'userTags') {
      query.tags = db.command.in(task.to.receiver)
    }

    // 全部用户
    if (task.to.all && execData.beforeId) {
      query._id = db.command.gt(execData.beforeId)
    }

    // 动态数据仅支持uni-id-users表字段
    const dynamicField = parserDynamicField(task.vars)
    const userFields = dynamicField['uni-id-users'] ? dynamicField['uni-id-users'].reduce((res, field) => {
      res[field] = true
      return res
    }, {}): {}
    const { data: users } = await db.collection('uni-id-users')
      .where(query)
      .field({
        mobile: true,
        ...userFields
      })
      .limit(parallel)
      .orderBy('_id', 'asc')
      .get()

    if (users.length <= 0) {
      // 更新要发送的短信数量
      const count = await db.collection(this.tableNames.log).where({ task_id: taskId }).count()
      await db.collection(this.tableNames.task).where({ _id: taskId }).update({
        send_qty: count.total
      })

      // 开始发送
      uniSmsCo.sendSms(taskId)

      return new Promise(resolve => setTimeout(() => resolve({
        errCode: 0,
        errMsg: '创建完成'
      }), 500))
    }

    if (!beforeId) {
      beforeId = users[users.length - 1]._id
    }

    let docs = []
    for (const user of users) {
      const varData = await buildTemplateData(task.vars, user)
      docs.push({
        uid: user._id,
        task_id: taskId,
        mobile: user.mobile,
        var_data: varData,
        status: 0,
        create_date: Date.now()
      })
    }

    await db.collection(this.tableNames.log).add(docs)

    uniSmsCo.createUserSmsMessage(taskId, { beforeId })

    return new Promise(resolve => setTimeout(() => resolve(), 500))
  },
  async sendSms(taskId) {
    const { data: tasks } = await db.collection(this.tableNames.task).where({ _id: taskId }).get()
    if (tasks.length <= 0) {
      console.warn(`task [${taskId}] not found`)
      return
    }

    const [task] = tasks
    const isStaticTemplate = !task.vars.length

    let sendData = {
      appId: task.app_id,
      smsKey: smsConfig.smsKey,
      smsSecret: smsConfig.smsSecret,
      templateId: task.template_id,
      data: {}
    }

    const { data: records } = await db.collection(this.tableNames.log)
      .where({ task_id: taskId, status: 0 })
      .limit(isStaticTemplate ? 50 : 1)
      .field({ mobile: true, var_data: true })
      .get()

    if (records.length <= 0) {
      return {
        errCode: 0,
        errMsg: '发送完成'
      }
    }

    if (isStaticTemplate) {
      sendData.phoneList = records.reduce((res, user) => {
        res.push(user.mobile)
        return res
      }, [])
    } else {
      const [record] = records
      sendData.phone = record.mobile
      sendData.data = record.var_data
    }

    try {
      //   await sendSms(sendData)
      await uniCloud.sendSms(sendData)
      // 修改发送状态为已发送
      await db.collection(this.tableNames.log).where({
        _id: db.command.in(records.map(record => record._id))
      }).update({
        status: 1,
        send_date: Date.now()
      })
      // 更新任务的短信成功数
      await db.collection(this.tableNames.task).where({ _id: taskId })
        .update({
          success_qty: db.command.inc(records.length)
        })
    } catch (e) {
      console.error('[sendSms Fail]', e)
      // 修改发送状态为发送失败
      await db.collection(this.tableNames.log).where({
        _id: db.command.in(records.map(record => record._id))
      }).update({
        status: 2,
        reason: e.errMsg || '未知原因',
        send_date: Date.now()
      })
      // 更新任务的短信失败数
      await db.collection(this.tableNames.task).where({ _id: taskId })
        .update({
          fail_qty: db.command.inc(records.length)
        })
    }

    uniSmsCo.sendSms(taskId)

    return new Promise(resolve => setTimeout(() => resolve(), 500))
  },
  async template() {
    const {data: templates = []} = await db.collection(this.tableNames.template).get()
    return templates
  },
  async task (id) {
    const {data: tasks} = await db.collection(this.tableNames.task).where({_id: id}).get()
    if (tasks.length <= 0) {
      return null
    }

    return tasks[0]
  },
  async updateTemplates (templates) {
    if (templates.length <= 0) {
      return {
        errCode: errCode('template-is-null'),
        errMsg: '缺少模板信息'
      }
    }

    let group = []
    for (const template of templates) {
      group.push(
        db.collection(this.tableNames.template).doc(String(template.templateId)).set({
          name: template.templateName,
          content: template.templateContent,
          type: template.templateType,
          sign: template.templateSign
        })
      )
    }

    await Promise.all(group)

    return {
      errCode: 0,
      errMsg: '更新成功'
    }
  },
  async preview (to, templateId, templateData) {
    const count  = 1
    let query = {
      mobile: db.command.exists(true)
    }

    // 指定用户发送
    if (!to.all && to.type === 'user') {
      const receiver = to.receiver.slice(0, 10)
      query._id = db.command.in(receiver)
    }

    // 指定用户标签
    if (to.type === 'userTags') {
      query.tags = db.command.in(to.receiver)
    }

    const {data: users} = await db.collection('uni-id-users').where(query).limit(count).get()
	  console.log({users, query})
    if (users.length <= 0) {
      return {
        errCode: errCode('users-is-null'),
        errMsg: '请添加要发送的用户'
      }
    }

    const {data: templates} = await db.collection(this.tableNames.template).where({_id: templateId}).get()
    if (templates.length <= 0) {
      return {
        errCode: errCode('template-not-found'),
        errMsg: '模板不存在'
      }
    }
    const [template] = templates

    let docs = []
    for (const user of users) {
      const varData = buildTemplateData(templateData, user)
      const content = template.content.replace(/\$\{(.*?)\}/g, ($1, param) => varData[param] || $1)
      docs.push(`【${template.sign}】${content}`)
    }

    return {
      errCode: 0,
      errMsg: '',
      list: docs
    }
  }
}
