; 安装前初始化（此处可添加系统检测等）
!macro customInit
  ; 例如检查是否已安装并提示
!macroend

!macro customInstall

!macroend

!macro customUnInstall
  # 卸载时删除用户数据
  # 注意: ${APP_FILENAME} 是由 electron-builder 自动替换的变量
  RMDir /r "$APPDATA\${APP_FILENAME}"

  # 删除开始菜单快捷方式目录
  RMDir /r "$SMPROGRAMS\${COMPANY_NAME}"

  # 删除桌面快捷方式
  Delete "$DESKTOP\${PRODUCT_FILENAME}.lnk"
!macroend
