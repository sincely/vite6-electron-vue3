import { render, h, ref } from 'vue'
import ModalDialog from '@/components/ModalDialog/index.vue'

/**
 * useDialog - 函数式调用 ModalDialog
 *
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
 * @param {Object} options.props - 传递给内容组件的 props
 *
 * @returns {Object} { close, update }
 */
export function useDialog() {
  const dialogInstance = ref(null)
  const container = document.createElement('div')

  const close = () => {
    if (dialogInstance.value) {
      dialogInstance.value.component.props.modelValue = false
      // 等待动画结束后销毁
      // setTimeout(() => {
      //   render(null, container)
      //   container.remove()
      //   dialogInstance.value = null
      // }, 200)
      render(null, container)
      container.remove()
      dialogInstance.value = null
    }
  }

  const open = (options = {}) => {
    const {
      title,
      subtitle,
      icon,
      width,
      showClose,
      glass,
      content,
      footer,
      onConfirm,
      onCancel,
      props: contentProps = {}
    } = options

    const visible = ref(true)

    const handleClose = () => {
      visible.value = false
      if (onCancel) onCancel()
      close()
    }

    const vnode = h(
      ModalDialog,
      {
        modelValue: visible.value,
        'onUpdate:modelValue': (val) => {
          visible.value = val
          if (!val) handleClose()
        },
        title,
        subtitle,
        icon,
        width,
        showClose,
        glass,
        // 透传其他 el-dialog 属性
        ...options.dialogProps
      },
      {
        default: () => {
          if (typeof content === 'function') return content()
          if (typeof content === 'object') return h(content, contentProps)
          return content
        },
        footer: footer
          ? () => {
              if (typeof footer === 'function')
                return footer({ close: handleClose, confirm: onConfirm })
              if (typeof footer === 'object')
                return h(footer, { close: handleClose, confirm: onConfirm })
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
