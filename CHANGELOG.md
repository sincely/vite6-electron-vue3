# Changelog

All notable changes to this project will be documented in this file.


## [0.0.8](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.7...v0.0.8) (2026-03-09)

### ✨ Features

* 新增Card组件并重构BackTop组件，优化样式和布局 ([e7b4294](https://github.com/sincely/vite6-electron-vue3/commit/e7b4294a074aa1d4a632ec6a4ed994ac3b72d3f1))
* 新增占位图标并更新页面组件样式 ([dad0bb9](https://github.com/sincely/vite6-electron-vue3/commit/dad0bb9e0c16ca1523321622417b48963c9f77d4))
* 添加主题工厂技能和UI/UX设计资源 ([eed3d7e](https://github.com/sincely/vite6-electron-vue3/commit/eed3d7e8f291cf7c7688b3ac122ba9965d3073f5))
* 添加操作日志表格和全局返回顶部组件 ([44ae3a9](https://github.com/sincely/vite6-electron-vue3/commit/44ae3a9179b3dd00b6c559b7be6376dd87f3cdab))
* 集成mock数据功能用于前后端分离开发 ([e5d58b4](https://github.com/sincely/vite6-electron-vue3/commit/e5d58b4bd437c2a2c2348b15a46055e163e0239c))

### 🔧 Chores

* 将 artifacts 目录添加到代码检查工具的忽略列表 ([79ffac4](https://github.com/sincely/vite6-electron-vue3/commit/79ffac42646b8e9766a0d6227b4760bf504f7a43))
* 更新构建配置文件和忽略规则 ([4e95d59](https://github.com/sincely/vite6-electron-vue3/commit/4e95d5906d0f2d5da8e0ca209615b5fcc33163cc))
* 添加 concurrently 并更新 npm scripts ([f3916da](https://github.com/sincely/vite6-electron-vue3/commit/f3916da5e562229f994908cf035f038694ce6ced))
* 移除不再需要的 .browserslistrc 配置文件 ([e4cb96a](https://github.com/sincely/vite6-electron-vue3/commit/e4cb96aaa490fa33eca5d39a49416ab2f68b4287))

### ♻️ Code Refactoring

* 重构网络状态检测钩子并更新依赖项 ([48426a6](https://github.com/sincely/vite6-electron-vue3/commit/48426a602e21f24e7025feef904de8206b6814e3))

### 🏭 Build System

* **nsis:** 添加Windows安装包配置和文档 ([52fef35](https://github.com/sincely/vite6-electron-vue3/commit/52fef35e586f569490f5d99dd17c387ccbfb4d01))

### 🤖 Continuous Integration

* 添加 GitHub Actions 工作流以自动化发布流程 ([a32affc](https://github.com/sincely/vite6-electron-vue3/commit/a32affcdc1555396192c7db34d7972330ca8e6ac))
* 添加 GitHub Actions 工作流配置修改 ([2231263](https://github.com/sincely/vite6-electron-vue3/commit/223126378949c949408daefe7e4a9a76e1d682ce))

## [0.0.7](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.6...v0.0.7) (2026-03-06)

### ✨ Features

* 新增 toast 工具函数并更新请求错误处理 ([3882050](https://github.com/sincely/vite6-electron-vue3/commit/38820502ee5f49bb52bfe53bd4133759ebb3dd97))
* 新增ECharts集成、用户认证、工具函数及设置模块 ([f9e298f](https://github.com/sincely/vite6-electron-vue3/commit/f9e298f44dcbd64961bb68bbfe8b98eb7afb6cfb))
* 新增多种文件类型的SVG图标 ([023ea3e](https://github.com/sincely/vite6-electron-vue3/commit/023ea3e6e5530479968a8b875bcf8dfc27eb6a7c))
* 更新macOS构建配置，修改artifactName格式以支持不同架构 ([518f1b7](https://github.com/sincely/vite6-electron-vue3/commit/518f1b7629d99e2740f89935a149a6062a037c1a))
* 更新macOS构建配置，支持x64和arm64架构的dmg和zip目标 ([3706e4d](https://github.com/sincely/vite6-electron-vue3/commit/3706e4d230dc82be3fe2317785201f4111c2a7a3))
* 更新图标生成逻辑，支持多平台图标输出并优化路径和格式; 重构自动更新模块并完善文档; 优化样式和组件配置 ([f7a774f](https://github.com/sincely/vite6-electron-vue3/commit/f7a774fe88d224dab126d2dc06680503baa46b9d))
* 添加登录页面、权限控制和用户管理功能 ([c147f63](https://github.com/sincely/vite6-electron-vue3/commit/c147f631ebba43bb5e80f9bf6f900aa7bc7681d7))
* 添加网络状态监听并优化通知配置 ([d263aaf](https://github.com/sincely/vite6-electron-vue3/commit/d263aaf6ba325e4f8fb0e0773d2af8f74b51bd17))

### 🐞 Bug Fixes

* 修复loadingTargets持久化问题并添加latestVersion持久化 ([d056e2c](https://github.com/sincely/vite6-electron-vue3/commit/d056e2c3d12cbe5288d6a97c41bb99fd6c07073d))
* 将通知持续时间从3000毫秒减少到2500毫秒 ([0961fdc](https://github.com/sincely/vite6-electron-vue3/commit/0961fdccd43f19f3a633f5b57d7b89f24989695a))

### 🎨 Styles

* 优化登录组件样式和交互效果 ([965916b](https://github.com/sincely/vite6-electron-vue3/commit/965916b451d677ba79fc445e59de4b53f436b921))

### ♻️ Code Refactoring

* 清理代码并添加应用状态重置功能 ([8ca671c](https://github.com/sincely/vite6-electron-vue3/commit/8ca671cb10d8aea85cf84ae8088121d52d1f86a9))

## [0.0.6](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.5...v0.0.6) (2026-03-05)

### ✨ Features

* **electron-update:** 重构自动更新模块并完善文档 ([01dff29](https://github.com/sincely/vite6-electron-vue3/commit/01dff29632132163efb08155f0ed1312563f628c))
* 启动时重置更新过渡态，防止崩溃后遗留脏状态 ([b5a3a9a](https://github.com/sincely/vite6-electron-vue3/commit/b5a3a9a5657693e5eab841973e20a1ee62ebc012))
* 在svgIcon插件中添加自定义插入位置，更新symbolId配置；修复windowManager.js中的导入格式；移除vite.config.js中的tree-shaking配置 ([d164b06](https://github.com/sincely/vite6-electron-vue3/commit/d164b06b252333a757b5fc655dc02042917c334b))
* 更新README.md，完善项目描述和技术栈信息，优化安装和构建说明 ([dbe42a6](https://github.com/sincely/vite6-electron-vue3/commit/dbe42a61a5e43a1586ff1899b19b72ac2aed79e8))
* 更新图标生成逻辑，支持多平台图标输出，优化图标路径和格式 ([3b549be](https://github.com/sincely/vite6-electron-vue3/commit/3b549bea3e72e0ed85a7b5dad60526eb9cf7e71b))
* 添加 Linux 平台构建脚本，支持开发、测试和生产模式 ([4df1d9d](https://github.com/sincely/vite6-electron-vue3/commit/4df1d9d53230836a187e60a7c95ff2d135e5402f))
* 添加多个SVG图标文件，更新全局组件样式和布局 ([731dc3c](https://github.com/sincely/vite6-electron-vue3/commit/731dc3cb01bd5356282fd2518252cd241aca2bd7))
* 添加样式导入插件，优化通知功能，更新组件导入逻辑 ([eca1268](https://github.com/sincely/vite6-electron-vue3/commit/eca12681c5ccb1f879af24297780a2bb1a199f95))
* 添加自动注入更新说明功能，优化更新对话框的显示和样式 ([18325b9](https://github.com/sincely/vite6-electron-vue3/commit/18325b90773cfd45246813502413aac1ba292b2d))
* 重构更新模块，优化版本管理和状态控制，更新相关组件和日志记录 ([d8166f4](https://github.com/sincely/vite6-electron-vue3/commit/d8166f48809f4448a5ece9571bd67491e457d79b))
* 重构登录页面并添加扫码登录功能 ([8176a10](https://github.com/sincely/vite6-electron-vue3/commit/8176a103ff13e9f2f1e6b8f291d4d071dc6437c9))
* 重构请求模块，优化axios封装，添加请求队列管理和进度条功能 ([7837638](https://github.com/sincely/vite6-electron-vue3/commit/7837638a1af0f7408beabfbfd831370ce59885ad))

### 🐞 Bug Fixes

* 修复关闭按钮图标类名，确保正确显示 ([186389b](https://github.com/sincely/vite6-electron-vue3/commit/186389b9c07642e4092a6f601ae406151b8dd273))
* 修复计算属性 updateDownloaded 的格式错误 ([06f2da2](https://github.com/sincely/vite6-electron-vue3/commit/06f2da21aa1b927b3ab27a4d3f8ecd522fa207a1))
* 更新 .gitignore 和 .stylelintignore，添加 .nsh 文件类型忽略 ([c785bb3](https://github.com/sincely/vite6-electron-vue3/commit/c785bb3d6ba15f4e19d29c60ee2063ad09da6339))
* 更新 lint 配置，移除不必要的文件检查，优化 prettier 和 stylelint 命令 ([6827ad5](https://github.com/sincely/vite6-electron-vue3/commit/6827ad5fe62cd310b2a8836c38227be7b183064f))
* 更新 lint 钩子，使用 lint:check 进行检查 ([f3ef469](https://github.com/sincely/vite6-electron-vue3/commit/f3ef4690f0212ef75882391980d4d773d3ccee36))
* 更新 Windows 安装程序的 artifactName 并启用卸载时删除应用数据 ([59674be](https://github.com/sincely/vite6-electron-vue3/commit/59674be2bef05f29ac023fdca474aefa8c56e508))

### 📝 Documentation

* 新增 init 和 release 提交类型 ([ec9a8d1](https://github.com/sincely/vite6-electron-vue3/commit/ec9a8d1374a51d83cfd1a5094fa41205c8636dde))

### 🎨 Styles

* 统一代码格式与优化配置 ([2c560df](https://github.com/sincely/vite6-electron-vue3/commit/2c560dfdf21d9d610d1c658ccc1beccd25acd460))

### 🔧 Chores

* **release:** v0.0.6-0 ([e35c556](https://github.com/sincely/vite6-electron-vue3/commit/e35c55606021dcb4a970721d2cff589764a2c2f7))
* 优化 .release-it.json 文件格式，简化数组结构；调整主题样式中的渐变背景格式 ([40213d0](https://github.com/sincely/vite6-electron-vue3/commit/40213d0fe9f1632ac6f61e8e0fd4424b7f087256))
* 将项目名称从Crab重命名为lightning ([ff5f00a](https://github.com/sincely/vite6-electron-vue3/commit/ff5f00ac2fa74b081702b6aceb425f61e0b5d023))
* 更新.stylelintignore，添加dist-electron目录到忽略列表 ([3ccd035](https://github.com/sincely/vite6-electron-vue3/commit/3ccd03583cf8e33a1d15af699338563801988b6e))
* 标准化项目名称为Crab ([9ea6973](https://github.com/sincely/vite6-electron-vue3/commit/9ea6973197168f7a3f756d91702668c65cb7fafc))
* 格式化 .release-it.json 文件，优化代码可读性 ([bcfdfa1](https://github.com/sincely/vite6-electron-vue3/commit/bcfdfa1c360c83d30aa10849285fe959938bee5f))
* 重构环境配置与构建脚本，优化项目配置 ([7d2c017](https://github.com/sincely/vite6-electron-vue3/commit/7d2c017ce4aad998a6aa82dbe6eb945b2bb7d90a))

### ♻️ Code Refactoring

* 移除不必要的样式导入插件，优化插件配置 ([8a99b4d](https://github.com/sincely/vite6-electron-vue3/commit/8a99b4d74a04583d6e158e994ffcb9eed16bbb59))

### 🤖 Continuous Integration

* 将构建命令更改为生产版本 ([60e8156](https://github.com/sincely/vite6-electron-vue3/commit/60e8156d56c4ea8c50bc30e6bcc93db428ef1f19))
* 简化发布流程并改为单作业构建 ([4a2184d](https://github.com/sincely/vite6-electron-vue3/commit/4a2184dad8ec35ba40a85be3619ebba3cb1b5299))

## v0.0.6

[compare changes](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.5...v0.0.6)

### 🚀 Enhancements

- 添加样式导入插件，优化通知功能，更新组件导入逻辑 ([eca1268](https://github.com/sincely/vite6-electron-vue3/commit/eca1268))
- 在svgIcon插件中添加自定义插入位置，更新symbolId配置；修复windowManager.js中的导入格式；移除vite.config.js中的tree-shaking配置 ([d164b06](https://github.com/sincely/vite6-electron-vue3/commit/d164b06))
- 添加多个SVG图标文件，更新全局组件样式和布局 ([731dc3c](https://github.com/sincely/vite6-electron-vue3/commit/731dc3c))

### 🏡 Chore

- 标准化项目名称为Crab ([9ea6973](https://github.com/sincely/vite6-electron-vue3/commit/9ea6973))

### ❤️ Contributors

- Chengzhou <1738248438@qq.com>

## [0.0.5](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.3...v0.0.5) (2026-03-03)

### ✨ Features

* 优化托盘图标功能，添加窗口最小化到托盘的支持 ([c98beb3](https://github.com/sincely/vite6-electron-vue3/commit/c98beb3731a35f7d9d50b672fb363755c8105e8b))
* 新增通知功能，包含通知面板和通知吐司组件 ([6321806](https://github.com/sincely/vite6-electron-vue3/commit/63218064686b19d9c06228fc41776a911ea3f5cb))
* 新增通知面板和图标，移除未使用的组件导入 ([a1a4305](https://github.com/sincely/vite6-electron-vue3/commit/a1a4305d490c7bae1aca69677f8d7c9853ab19f2))
* 更新弹框修改 ([a7fdc92](https://github.com/sincely/vite6-electron-vue3/commit/a7fdc92896a663fb9df807928820ebb87e798175))
* 更新样式覆盖文件，添加element-plus主题色变量配置 ([1769742](https://github.com/sincely/vite6-electron-vue3/commit/17697421bb95231a8aeefaedd84a7108e5524594))
* 添加多平台图标生成脚本并更新应用图标 ([42df984](https://github.com/sincely/vite6-electron-vue3/commit/42df9845174669b07de275da54012f6895a7291f))
* 添加对多语言支持的配置，包括简体中文、繁体中文和英语 ([8b70b92](https://github.com/sincely/vite6-electron-vue3/commit/8b70b92748dd1cb4f8509d4f429dddba3da9e8b1))
* 添加更新对话框和进度条组件以支持应用更新功能 ([93add34](https://github.com/sincely/vite6-electron-vue3/commit/93add34cfcd5f2ca1f7fd33cb9f42c1cd08756e7))
* 添加模拟下载功能并更新图标，优化更新对话框 ([5a8d21c](https://github.com/sincely/vite6-electron-vue3/commit/5a8d21c2d70b28576c47d5685080e8694e2a3379))
* 添加额外资源配置以支持托盘图标和应用图标的加载 ([e80da70](https://github.com/sincely/vite6-electron-vue3/commit/e80da70d4baa5717680c7d580926d28d69f521c4))
* 调整更新对话框图标大小并修复版本显示 ([804378f](https://github.com/sincely/vite6-electron-vue3/commit/804378f6f80b7f3bda7fedf395fdec6a39493b8a))
* 调整用户设置图标大小并优化样式 ([a00e6eb](https://github.com/sincely/vite6-electron-vue3/commit/a00e6eb14ea3f84d6d076fa9fc60b91ac3a4c13c))
* 重构应用布局并替换占位页面为美观的占位组件 ([ef7e463](https://github.com/sincely/vite6-electron-vue3/commit/ef7e4630df009e275774733b57c00d3dd088119f))
* 重构应用更新流程，新增更新弹框组件 ([8e3872a](https://github.com/sincely/vite6-electron-vue3/commit/8e3872a13cd71c53ec50340735749caec3f6b1ed))
* 重构自动更新功能并添加发布指南 ([200621b](https://github.com/sincely/vite6-electron-vue3/commit/200621b61d6cf112bee0ab80410b76e90e85b606))

### 🐞 Bug Fixes

* 优化全局内容组件的缓存逻辑，修复 keep-alive 页面渲染问题 ([72f81e0](https://github.com/sincely/vite6-electron-vue3/commit/72f81e0c534ef1f1f4220d1eb03013d32fdbbf78))
* 修复展开状态：父级只在自身路由匹配时高亮，子菜单有自己的高亮，折叠状态：父级在自身路由或任意子路由匹配时高亮 ([8878eaa](https://github.com/sincely/vite6-electron-vue3/commit/8878eaa982fe78e900854610abac20c69659c751))
* 修复更新提示中的版本号显示，确保显示当前版本而非最新版本 ([4ef60ac](https://github.com/sincely/vite6-electron-vue3/commit/4ef60ac1890ff48599faf7d2c6a84ec841a28ab8))
* 删除关于页面及其路由，简化应用结构 ([948f243](https://github.com/sincely/vite6-electron-vue3/commit/948f2439c23d6412437455ee1f0785afb9911c10))
* 删除无用的调试代码，清理代码库 ([4bec029](https://github.com/sincely/vite6-electron-vue3/commit/4bec0297656348e83d4f7974adaefec70a9744e6))
* 更新提供商路由图标，修正为正确的图标名称 ([098f4cf](https://github.com/sincely/vite6-electron-vue3/commit/098f4cf81cc6ed6d59fa9da6a206f178a314c6b1))
* 调整 mac 平台下 logo 区域的高度和内边距 ([ad8b65b](https://github.com/sincely/vite6-electron-vue3/commit/ad8b65bd8887ede34d7b2301aaa91db2b6b3c831))

### 📝 Documentation

* 更新构建文档并修复版权信息中的特殊字符 ([6e364cb](https://github.com/sincely/vite6-electron-vue3/commit/6e364cbcae8604c5477076beb989ad590618300b))

### 🎨 Styles

* **ui:** 更新主题色系与视觉样式为科技蓝风格 ([756cd87](https://github.com/sincely/vite6-electron-vue3/commit/756cd87c988b84e19e098ae43a0a22435c1552a3))
* 移除图标前缀以统一图标命名规范 ([37a99de](https://github.com/sincely/vite6-electron-vue3/commit/37a99de6a798283d6111f659bba95338eabf16e3))
* 移除小屏幕下的全局内容内边距媒体查询 ([39c4a20](https://github.com/sincely/vite6-electron-vue3/commit/39c4a207336917725bc8017f2a63f668da0da760))

### 🔧 Chores

* 优化 .release-it.json 和 electron-builder.json 文件格式，简化数组结构 ([68dc391](https://github.com/sincely/vite6-electron-vue3/commit/68dc3910ae3c43635322aadf55d1eca64bb200a8))
* 删除不再使用的字体文件 DMSans 和 Montserrat ([d17657a](https://github.com/sincely/vite6-electron-vue3/commit/d17657a39df72e6c2ca1ba6709f08df5e89fe2a0))
* 将项目名称从deep-ai重命名为Crab ([3f19fd9](https://github.com/sincely/vite6-electron-vue3/commit/3f19fd9ca106d916289fe180bacc1bae05762ffc))
* 更新 .gitignore 和 .release-it.json 文件格式，优化推送参数和资产列表 ([2aa046d](https://github.com/sincely/vite6-electron-vue3/commit/2aa046d6b23aa083e348c19cf609587a0119ac41))

### ♻️ Code Refactoring

* 启用更新模块持久化并修复通知模块变量名 ([1d4b36c](https://github.com/sincely/vite6-electron-vue3/commit/1d4b36cb593cb11b83abd8d810e102971318a357))
* 重构项目配置、样式和状态管理 ([761d1e6](https://github.com/sincely/vite6-electron-vue3/commit/761d1e648e26982ee95ae92d3cf54299f874063c))

## [0.0.3](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.2...v0.0.3) (2026-03-01)

### 🏭 Build System

* 优化项目打包体积，将依赖项移至 devDependencies 并条件启用 legacy 插件 ([ff53b38](https://github.com/sincely/vite6-electron-vue3/commit/ff53b380bf7a92143d477ee5fb4f4a33d9c80606))

## 0.0.2 (2026-03-01)

### ✨ Features

* **router:** 为API密钥页面添加加载过渡动画 ([6582152](https://github.com/sincely/vite6-electron-vue3/commit/658215209584db8dfbab61a2843796a86fde89a6))
* 基本框架搭建 ([6d6b625](https://github.com/sincely/vite6-electron-vue3/commit/6d6b6253a8432d68b909919c84a254b9e75906e3))
* 实现侧边栏，伸缩侧边栏，自定义titlebar,使用sass实现主题切换 ([ed793c3](https://github.com/sincely/vite6-electron-vue3/commit/ed793c301851173bc974183517a601679ceb57a8))
* 实现手动更新检查和版本显示功能 ([b3d0e82](https://github.com/sincely/vite6-electron-vue3/commit/b3d0e827230f866f64d6e434ed02c663660c96f3))
* 更新侧边栏设计并替换应用logo ([6852650](https://github.com/sincely/vite6-electron-vue3/commit/6852650d708743bce09ee91496c0c3924a713a38))
* 更新样式处理，迁移至SCSS并添加全局样式 ([f98b490](https://github.com/sincely/vite6-electron-vue3/commit/f98b4907752ef6f28a215967f95023cacb696015))
* 更新样式导入方式，使用[@use](https://github.com/use)替代[@import](https://github.com/import) ([6bf90c4](https://github.com/sincely/vite6-electron-vue3/commit/6bf90c465cc90c5635fe5850913efffe1904756c))
* 添加 IPC 处理器和窗口管理功能，支持文件操作和更新检查 ([07d4216](https://github.com/sincely/vite6-electron-vue3/commit/07d42160b3e3653149ddcf14f98de9282f3e9870))
* 添加IPC相关文件并更新jsconfig.json和package.json依赖 ([89dee10](https://github.com/sincely/vite6-electron-vue3/commit/89dee1059fa313d1889a22bad616f39125377cf2))
* 添加发布工作流，支持手动触发和版本选择 ([df1824f](https://github.com/sincely/vite6-electron-vue3/commit/df1824f5db2478b3a9bd34b9dce95c98e0a423e6))
* 添加发布脚本和配置文件，支持交互式发布流程 ([5460d03](https://github.com/sincely/vite6-electron-vue3/commit/5460d03cf7362658733ccd02dfbf5e5904b3a2f2))
* 添加检测更新逻辑 ([6f64ebc](https://github.com/sincely/vite6-electron-vue3/commit/6f64ebcbcf1a8d7cae68feb92208034b9fd4b459))
* 添加自动更新进度显示组件 ([1e39a13](https://github.com/sincely/vite6-electron-vue3/commit/1e39a13a36e17572b704a04df58ac7bd71cc04b0))
* 重构应用界面并添加系统集成功能 ([d9b2d77](https://github.com/sincely/vite6-electron-vue3/commit/d9b2d7701dfe7d9ea9fb90cf8ed2c043a6e4eed4))
* 重构登录界面并优化应用样式与打包配置 ([360930d](https://github.com/sincely/vite6-electron-vue3/commit/360930db6c3216f3312e82c21112c171e658a889))
* 集成element-plus ([5e59de8](https://github.com/sincely/vite6-electron-vue3/commit/5e59de859b0b8e2084f8d6f49dcdc10efce14cf1))
* 项目初始化 ([8cde7fa](https://github.com/sincely/vite6-electron-vue3/commit/8cde7fa0032807116c7c441ab7fd11d78590b66d))
* 项目基本架构完成 ([4dcc1ad](https://github.com/sincely/vite6-electron-vue3/commit/4dcc1adf6ec29074caf297f1c58971e76c7f7a9a))

### 🐞 Bug Fixes

* 修改构建命令为针对mac的构建 ([ff17fd2](https://github.com/sincely/vite6-electron-vue3/commit/ff17fd237e091386db3f93e53b65d81d0e03a225))
* 修正构建配置并增强Electron窗口稳定性 ([04f3ac2](https://github.com/sincely/vite6-electron-vue3/commit/04f3ac261a5b66aae614ed80c37a026d9095e10e))
* 修正窗口扩展功能中的变量引用错误 ([fbf1877](https://github.com/sincely/vite6-electron-vue3/commit/fbf1877a7ea43b3bcf883932bbc696a6c854726e))
* 提交锁文件 ([43f711c](https://github.com/sincely/vite6-electron-vue3/commit/43f711c9e0aa2653b66407b2aa0df18680cee23f))
* 放开gitlignore ([6338f6b](https://github.com/sincely/vite6-electron-vue3/commit/6338f6bd01165e7e725d32c4e91e17e43512f096))
* 更新发布配置以支持macOS构建和Linux应用打包 ([c13576e](https://github.com/sincely/vite6-electron-vue3/commit/c13576ed2a290b4bf1ac049151fba9dcb512ed90))
* 更新构建命令，简化构建流程 ([9f4147f](https://github.com/sincely/vite6-electron-vue3/commit/9f4147f2c4160a254d40594e51f7ecbee6d6fab6))

### 📝 Documentation

* 更新发布说明，明确上传至更新服务器的文件 ([84cbb2f](https://github.com/sincely/vite6-electron-vue3/commit/84cbb2f49d419c08dcd93a7de807799cdc3c04cf))

### 🎨 Styles

* 统一 CSS 类名命名规范，使用连字符代替 BEM 双下划线 ([3892fa7](https://github.com/sincely/vite6-electron-vue3/commit/3892fa7aad96434eb171abe3560b41a24be72057))

### 🔧 Chores

* 回退版本号并调整依赖项 ([0c64289](https://github.com/sincely/vite6-electron-vue3/commit/0c64289fb6bfae60385191df5c42d58b227b18d7))
* 将 dmg-license 移至 optionalDependencies ([75cd029](https://github.com/sincely/vite6-electron-vue3/commit/75cd029e2fcf51d78bf01ef8d352af728e14a250))
* 扩展 ESLint 忽略文件列表以排除构建产物和配置文件 ([b553b61](https://github.com/sincely/vite6-electron-vue3/commit/b553b61d1c5268199965b4ea571e8964b0643d0e))
* 更新版本号至0.0.11 ([6680aed](https://github.com/sincely/vite6-electron-vue3/commit/6680aed6f5c312db4983622f5ce59e1990dffd0b))
* 更新环境配置、样式和依赖，优化构建脚本和窗口管理 ([2a6f35e](https://github.com/sincely/vite6-electron-vue3/commit/2a6f35eb76f90140f2f0cf9ff715ad171c5bb503))
* 更新项目名称为vite6-electron-vue3并移除描述字段 ([1da4cba](https://github.com/sincely/vite6-electron-vue3/commit/1da4cbae77f9c85755b3cc7abd034e37e45b5689))
* 移除 .eslintignore 并更新 ESLint 配置 ([659fa00](https://github.com/sincely/vite6-electron-vue3/commit/659fa003ea97c91d75de67eea686ffe750a7b3ea))
* 移除electron_mirror配置中的多余空格 ([c1aac4f](https://github.com/sincely/vite6-electron-vue3/commit/c1aac4f1ca4782c4067acebdb153fe8ab4e44893))
* 简化构建脚本，分离构建与打包步骤 ([6d0d036](https://github.com/sincely/vite6-electron-vue3/commit/6d0d036069c138a9bb48bcd60de2c939680d2729))

### 🏭 Build System

* 优化构建配置并引入Element Plus自动导入 ([2f2e912](https://github.com/sincely/vite6-electron-vue3/commit/2f2e91219e84d51322b83ae0b2075f8b3333bdde))
* 修复发布 ([9fb157e](https://github.com/sincely/vite6-electron-vue3/commit/9fb157ea91a3a9ffb69dad77dbbd9cf86cfe42d2))
