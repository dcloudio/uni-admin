import {
    formatDate
} from '@/components/common/date-format'
export function initUtil(Vue) {
    Vue.prototype.$formatDate = formatDate
}
