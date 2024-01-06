export default {
  data () {
    return {
      authUserInfo: uniCloud.getCurrentUserInfo()
    }
  },
  methods: {
    hasPermission (permission) {
      const {permission: userPermissions, role: userRoles} = this.authUserInfo

      return userRoles.includes('admin') || userPermissions.includes(permission)
    }
  }
}
