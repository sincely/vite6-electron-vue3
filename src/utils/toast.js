import SvgIcon from '../components/SvgIcon/index.vue'
export const showToast = (options) => {
  ElNotification({
    title: options.title || '通知',
    message: options.message || '欢迎回来',
    icon:
      options.icon ||
      h(SvgIcon, {
        iconClass: 'celebrate',
        width: '25px',
        height: '25px'
      }),
    type: options.icon ? '' : 'info',
    showClose: options.showClose || false,
    position: options.position || 'top-right',
    duration: options.duration || 2500
  })
}
