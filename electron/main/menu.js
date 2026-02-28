import { Menu } from 'electron'
// 创建菜单栏的函数
const createMenu = () => {
  const template = [
    {
      label: '文件',
      submenu: [
        { label: '打开', click: () => console.log('打开文件') },
        { label: '保存', click: () => console.log('保存文件') },
        { type: 'separator' },
        { role: 'quit' } // 退出应用
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' }, // 撤销
        { role: 'redo' }, // 重做
        { type: 'separator' },
        { role: 'cut' }, // 剪切
        { role: 'copy' }, // 复制
        { role: 'paste' } // 粘贴
      ]
    }
  ]

  // 构建菜单并设置为应用菜单
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

export default createMenu
