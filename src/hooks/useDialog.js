import { render, h, ref, isRef } from 'vue'
import { ElButton } from 'element-plus'
import ModalDialog from '@/components/ModalDialog/index.vue'

/**
 * @description useDialog - 函数式调用 ModalDialog
 * @param {Object} options - 弹窗配置项
 * @param {string} options.title - 标题
 * @param {string} options.subtitle - 副标题
 * @param {string} options.icon - 图标
 * @param {string} options.width - 宽度
 * @param {boolean} options.showClose - 是否显示关闭按钮
 * @param {boolean} options.glass - 是否启用玻璃拟态
 * @param {Function|Object|string} options.content - 弹窗内容 (render函数 / 组件 / 字符串)
 * @param {Function|Object|string} options.footer - 弹窗底部 (render函数 / 组件 / 字符串)
 * @param {Function} options.onConfirm - 确认回调 (如果提供了 footer 且包含确认逻辑)
 * @param {Function} options.onCancel - 取消/关闭回调
 * @param {Object} options.componentProps - 传递给内容组件的 componentProps
 * @returns {Object} { close, update }
 */
export function useDialog() {
  let dialogInstance = ref(null)
  let container = document.createElement('div')

  const close = () => {
    if (dialogInstance.value) {
      // 触发关闭动画
      dialogInstance.value.component.props.modelValue = false
      // 等待动画结束后销毁
      setTimeout(() => {
        if (container) {
          render(null, container)
          container.remove()
          container = null
        }
        dialogInstance.value = null
        dialogInstance = null
      }, 200) // 增加到 300ms 确保动画完成
    }
  }

  const open = (options = {}) => {
    // 确保每次 open 时如果之前的实例被销毁，重新创建
    if (!container) {
      container = document.createElement('div')
      dialogInstance = ref(null)
    }
    const {
      title,
      subtitle,
      icon,
      width,
      showClose,
      glass,
      component,
      footer,
      onConfirm,
      onCancel,
      componentProps: componentProps = {}
    } = options

    const visible = ref(true)
    const componentRef = ref(null)

    const handleClose = () => {
      visible.value = false
      if (onCancel) onCancel()
      close()
    }
    //  构建虚拟节点
    const vnode = h(
      ModalDialog,
      {
        modelValue: visible.value,
        'onUpdate:modelValue': (val) => {
          visible.value = val
          if (!val) handleClose()
        },
        'onUpdate:download': () => {
          console.log('download')
        },
        title,
        subtitle,
        icon,
        width,
        showClose,
        glass,
        // 透传其他el-dialog属性
        ...options.dialogProps
      },
      {
        default: () => {
          if (typeof component === 'function') return component(componentProps)
          if (typeof component === 'object')
            return h(component, { ...componentProps, ref: componentRef })
          return component
        },
        footer: footer
          ? () => {
              if (Array.isArray(footer)) {
                return footer.map((item) => {
                  return h(
                    ElButton,
                    {
                      ...item,
                      onClick: () => {
                        if (item.onClick)
                          item.onClick({
                            close: handleClose,
                            componentRef,
                            exposed: componentRef.value
                          })
                        else if (item.action === 'cancel') handleClose()
                        else if (item.action === 'confirm' && onConfirm)
                          onConfirm()
                      }
                    },
                    () => item.label
                  )
                })
              }
              if (typeof footer === 'function')
                return footer({
                  close: handleClose,
                  confirm: onConfirm,
                  componentRef,
                  exposed: componentRef.value
                })
              if (typeof footer === 'object')
                return h(footer, {
                  close: handleClose,
                  confirm: onConfirm,
                  componentRef,
                  exposed: componentRef.value
                })
              return footer
            }
          : undefined
      }
    )

    // 挂载
    document.body.appendChild(container)
    render(vnode, container)
    dialogInstance.value = vnode

    return {
      close: handleClose,
      //通过componentRef可以获取到传入的子组件的实例，需要访问子组件的方法或者变量，主要在子组件从使用defineExpose暴露出来
      componentRef,
      exposed: componentRef, // alias for convenience

      update: (newOptions) => {
        // TODO: 实现动态更新逻辑
        console.warn('useDialog update not implemented yet')
      }
    }
  }

  return {
    open,
    close
  }
}
