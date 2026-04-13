# Changelog

All notable changes to this project will be documented in this file.


* chore: 移除package.json文件末尾的换行符 (d4833b6)
* ci: 使用 npm ci 替换 npm install 并锁定依赖版本 (0e48ff5)
* ci: 将 npm ci 替换为 npm install 以解决依赖问题 (823516c)

## [0.0.18](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.17...v0.0.18) (2026-04-13)

### ✨ Features

* 优化表单布局并调整默认编辑状态 ([7ae2f5c](https://github.com/sincely/vite6-electron-vue3/commit/7ae2f5c3778bf0cfd0d3f40656e16975bb32f6e0))

### 🐞 Bug Fixes

* 修复Windows系统控制台中文乱码问题 ([4e24675](https://github.com/sincely/vite6-electron-vue3/commit/4e24675c60d0853519f1878b55f180f1ff09c5f9))

### 🎨 Styles

* 移除标题栏冗余背景渐变样式 ([7363911](https://github.com/sincely/vite6-electron-vue3/commit/73639112467fd6df844b08e23a13216ff1a0de3a))

### 🔧 Chores

* 更新依赖及构建配置 ([e90ed1a](https://github.com/sincely/vite6-electron-vue3/commit/e90ed1a947b6e4810d3d448ffa8318126cc5d867))

## [0.0.17](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.16...v0.0.17) (2026-04-02)

### ✨ Features

* 为侧边栏和标题栏添加进入/离开过渡动画 ([a99e99b](https://github.com/sincely/vite6-electron-vue3/commit/a99e99b59a3af830d65200ce5f54a766fdcf712d))
* 新增布局模式选择和主题颜色自定义功能 ([59a0efa](https://github.com/sincely/vite6-electron-vue3/commit/59a0efa4c52e79c842b5641d4f6557aac303d1bd))
* 新增顶部菜单布局模式 ([aa3f50e](https://github.com/sincely/vite6-electron-vue3/commit/aa3f50e1be2503adfdd5e8c85f706859fbcddf50))
* 添加主题切换按钮并优化全屏功能 ([f2cc68d](https://github.com/sincely/vite6-electron-vue3/commit/f2cc68d222f640e56ff543cdbc9f8ce568259494))
* 添加全屏模式支持 ([d4b0be0](https://github.com/sincely/vite6-electron-vue3/commit/d4b0be0ebdff0f1d7833e96e9718fd716abb6d66))
* 添加新图标并更新500错误页面图标 ([94b7dfc](https://github.com/sincely/vite6-electron-vue3/commit/94b7dfc7c09c7633b90b33143afb55fc9beef973))
* 重构用户菜单并改进通知与主题切换样式 ([8965879](https://github.com/sincely/vite6-electron-vue3/commit/8965879c82d7880d985a704b17ebd10814d392b5))

### 🐞 Bug Fixes

* 优化 ([88e9e7e](https://github.com/sincely/vite6-electron-vue3/commit/88e9e7e193a47f98bc42ba3017922ef9473c74e4))
* 修复 bug ([c69a469](https://github.com/sincely/vite6-electron-vue3/commit/c69a469a505b4c1a0d621bac55fe1922371aaa02))
* 修复图表报错 ([305d76b](https://github.com/sincely/vite6-electron-vue3/commit/305d76bed46ce82e2b9d16128e8c4fbd3d06235e))
* 修复错误 ([f3df980](https://github.com/sincely/vite6-electron-vue3/commit/f3df980b19ad2c0f29945c66dfd7a5618eda764c))
* 修复问题 ([4b695bf](https://github.com/sincely/vite6-electron-vue3/commit/4b695bf1b40dc94441ff13a1dac2242fe3dc7013))
* 增量更新提交 ([19a55c2](https://github.com/sincely/vite6-electron-vue3/commit/19a55c2fdcf4486cac51e75a69b3fdd2a36a2ec6))
* 调整图表组件高度并注释掉底部图例位置 ([3b5c912](https://github.com/sincely/vite6-electron-vue3/commit/3b5c912cb5e2e9dc135ccbd468a54ba722a5ca29))

### 🎨 Styles

* **global-header:** 调整用户菜单宽度并移除冗余样式 ([20a3d2f](https://github.com/sincely/vite6-electron-vue3/commit/20a3d2fb736a9be9ee737653bff6eb03880e0ba8))
* 为操作按钮添加统一工具提示并调整布局 ([bfb739e](https://github.com/sincely/vite6-electron-vue3/commit/bfb739e04339fb7709224bec18fea0ab9e8dfd3d))
* 优化卡片、设置对话框和面包屑导航的样式细节 ([7b36e01](https://github.com/sincely/vite6-electron-vue3/commit/7b36e01d935b527c8452feef697578a96d574b95))
* 优化顶部导航菜单的视觉样式和交互细节 ([a03e062](https://github.com/sincely/vite6-electron-vue3/commit/a03e062572b3de097664fda875d873f2791899c5))
* 优化顶部菜单和设置对话框的样式 ([e1ebe54](https://github.com/sincely/vite6-electron-vue3/commit/e1ebe54b0147a157bc143a9f282acde1e39e0838))
* 调整对话框内边距以改善视觉平衡 ([b1f488d](https://github.com/sincely/vite6-electron-vue3/commit/b1f488d6bbd78d6f21a1377aff08e1ce0a2635ae))

### ♻️ Code Refactoring

* 重命名顶部菜单组件以保持命名一致性 ([2c87beb](https://github.com/sincely/vite6-electron-vue3/commit/2c87bebce53257bfd436e46dbedd823ad13ed8a4))

## [0.0.16](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.15...v0.0.16) (2026-03-31)

### ✨ Features

* 在更新下载进度条中显示下载速度和体积信息 ([df097ed](https://github.com/sincely/vite6-electron-vue3/commit/df097edfa397724465cefa16f596588d37b8f189))
* 新增布局模式状态及设置方法 ([3c0d088](https://github.com/sincely/vite6-electron-vue3/commit/3c0d08858311d167993759e2278acf0f99a172ee))
* 添加日志记录以增强错误追踪 ([74ace40](https://github.com/sincely/vite6-electron-vue3/commit/74ace403cf7064e15aa52199152524a32efa82a2))
* 重构加载模块并添加卡车动画样式 ([f9993d3](https://github.com/sincely/vite6-electron-vue3/commit/f9993d3f3c89ea6e847c4a9e55747efc8b35be3a))
* 重构自动更新模块以支持分批更新和通道管理 ([7a2b0e3](https://github.com/sincely/vite6-electron-vue3/commit/7a2b0e3e3bb5f99799786a7e3b9ff3a21fcd6793))

### 📝 Documentation

* 更新发布与自动更新指南以反映当前实现 ([87645a0](https://github.com/sincely/vite6-electron-vue3/commit/87645a016ff239944325bc95556a697a912636cb))
* 添加部署指南并更新架构文档 ([34c0aef](https://github.com/sincely/vite6-electron-vue3/commit/34c0aefe15756ab19c29708caf637c583086b008))

### ♻️ Code Refactoring

* 将svg图标注册移至插件入口并清理通知代码 ([5c3dd1a](https://github.com/sincely/vite6-electron-vue3/commit/5c3dd1a4479e0d23b3bdce08bc8984f5cf35c294))
* 移除 DictTag 组件 ([2f08d75](https://github.com/sincely/vite6-electron-vue3/commit/2f08d75223ed43359b044efe8c246f1bb99a8472))
* 移除冗余控制台日志并统一使用中文日志记录 ([2a8f837](https://github.com/sincely/vite6-electron-vue3/commit/2a8f837cd85804c697ea65a9cb9fcd5ea3698a44))

## [0.0.15](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.14...v0.0.15) (2026-03-30)

### 🔧 Chores

* 将 .vscode 目录添加到 .gitignore 中 ([a44f6c2](https://github.com/sincely/vite6-electron-vue3/commit/a44f6c26060e3cee401d22b8be08028c3abb371c))

### ♻️ Code Refactoring

* 从插件导入echarts替代全局导入 ([81fe352](https://github.com/sincely/vite6-electron-vue3/commit/81fe352cc17317ecd82b3e63f71f77e4fe06057a))

### 🏭 Build System

* 优化 Electron 构建配置以减小应用体积 ([30a9c13](https://github.com/sincely/vite6-electron-vue3/commit/30a9c135c8b3c91c2ec4292474edb3bbdd94bffb))
* 添加 dmg-license 作为可选依赖 ([f5c456c](https://github.com/sincely/vite6-electron-vue3/commit/f5c456ce8d7a86aa2807a53b3a9ecc58a7440106))
* 添加 JSON schema 并包含必要的 node_modules 文件 ([9f9e64d](https://github.com/sincely/vite6-electron-vue3/commit/9f9e64d02a95c6baabcd461a95c6904a4e86d088))

### 🤖 Continuous Integration

* 重构发布流程，引入独立的版本准备任务 ([7d373db](https://github.com/sincely/vite6-electron-vue3/commit/7d373db75f77a4fba07cb48137dadcc5ae8dfb78))

## [0.0.14](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.13...v0.0.14) (2026-03-30)

### ✨ Features

* 优化表格大小设置，使用下拉菜单替代选择框，并添加箭头图标 ([46620c2](https://github.com/sincely/vite6-electron-vue3/commit/46620c23441c4bb71cd42dd82ca5a21fb9aaf30a))
* 更新全局搜索组件，添加下拉菜单和快捷键支持 ([75fc213](https://github.com/sincely/vite6-electron-vue3/commit/75fc2138bc5250739a1878c7260a4d6dd12e3c7c))
* 添加关闭窗口行为设置，支持最小化和退出选项 ([419d02f](https://github.com/sincely/vite6-electron-vue3/commit/419d02f2499953d73da5fccdc716dd9f0088cfb8))
* 添加开机自启设置和获取功能，支持 macOS 和 Windows 平台 ([92c4fd1](https://github.com/sincely/vite6-electron-vue3/commit/92c4fd180675779f06fe1e4f2c70c1650989826e))
* 添加树形表格操作列，支持行编辑、添加和删除功能 ([e3e0973](https://github.com/sincely/vite6-electron-vue3/commit/e3e097379c2a719853c76fde097a83637d7d198e))
* 添加表格大小设置功能，支持用户自定义表格显示大小 ([e5998ce](https://github.com/sincely/vite6-electron-vue3/commit/e5998ce42aeeff1bbe43e426e1cd46726c1ab351))

### 🐞 Bug Fixes

* 移除构建命令中的分析工具，以简化构建流程 ([acb1497](https://github.com/sincely/vite6-electron-vue3/commit/acb1497c35dda9004dbdab13c48d77e6261b7f9a))

### ⚡ Performance Improvements

* 优化构建配置以减少打包体积并添加分析工具 ([6de67d6](https://github.com/sincely/vite6-electron-vue3/commit/6de67d644d238986f11cbebe05f8e61e1606fc82))

### 🔧 Chores

* 删除未使用的图片资源以优化项目结构 ([bf26c50](https://github.com/sincely/vite6-electron-vue3/commit/bf26c507896caa4e151595e3f5ceb96a28b4b3f0))

## [0.0.13](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.12...v0.0.13) (2026-03-26)

### ✨ Features

* 完善首页 ([ed0b647](https://github.com/sincely/vite6-electron-vue3/commit/ed0b64769aad36b40f2e7f11007444e4a57dc48a))
* 添加应用启动加载动画并优化更新对话框显示逻辑 ([25266e8](https://github.com/sincely/vite6-electron-vue3/commit/25266e8551192242f41d3b323d3c080496e5a62b))

### 🐞 Bug Fixes

* 修复 bug ([c1b203c](https://github.com/sincely/vite6-electron-vue3/commit/c1b203cd4eb71c0e8ffffb5d2391fc6c2ec25978))
* 修复主窗口加载动画显示逻辑 ([7b6dea1](https://github.com/sincely/vite6-electron-vue3/commit/7b6dea130fd9480397d33f95152c335812f1b547))
* 修复可编辑表格 ([9ca5f5d](https://github.com/sincely/vite6-electron-vue3/commit/9ca5f5dff998dafcc4e774678db8f1e82cd6f2a3))

### 🎨 Styles

* 优化仪表盘及组件视觉间距与交互效果 ([8308b21](https://github.com/sincely/vite6-electron-vue3/commit/8308b2101565e4965e0ff58fd6bf462619495016))
* 移除图标内边距以统一视觉样式 ([7e59941](https://github.com/sincely/vite6-electron-vue3/commit/7e59941330823e83cab5486212031f0c06773cd2))
* 调整头像容器为 flex 居中布局 ([5a19cc7](https://github.com/sincely/vite6-electron-vue3/commit/5a19cc71d05f9f23c815f90180be78d0f6a9398e))

## [0.0.12](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.11...v0.0.12) (2026-03-26)

### ✨ Features

* 添加下载进度和状态事件处理 ([cbfac65](https://github.com/sincely/vite6-electron-vue3/commit/cbfac6515b7cc364799ca37fbcdf2ce8544d9a23))
* 集成vite-plugin-mock并启用生产环境mock数据 ([5457ca4](https://github.com/sincely/vite6-electron-vue3/commit/5457ca4dcb884c0b1591c72a52c61e17de8a9435))

### 🐞 Bug Fixes

* 禁止登录窗口最大化以防止双击标题栏扩大 ([b66255c](https://github.com/sincely/vite6-electron-vue3/commit/b66255c6a6f8b45fc9560f73c6029c7438b90f6e))

### 🎨 Styles

* 将配置常量从大写蛇形命名改为小写蛇形命名 ([72c528f](https://github.com/sincely/vite6-electron-vue3/commit/72c528fc0ddc3f7f4e79f93a3e4fd9626fbbf461))

### 🔧 Chores

* 从 clean 脚本中移除 release 目录并删除 fs-extra 依赖 ([089e981](https://github.com/sincely/vite6-electron-vue3/commit/089e981cfd8adca35064ef9375790fdc3ac165ab))
* 将API基础URL统一设置为根路径 ([c292e47](https://github.com/sincely/vite6-electron-vue3/commit/c292e4757257efe041a3cafe81036516c1d14c63))
* 移除mock插件和electron构建目标相关配置 ([95b8a3c](https://github.com/sincely/vite6-electron-vue3/commit/95b8a3c31a97569270722388b8b0f68972ffd37e))

### ♻️ Code Refactoring

* 将 SVG 图标注册移至主入口并调整 tree-shaking 配置 ([07655d6](https://github.com/sincely/vite6-electron-vue3/commit/07655d6c86cadcbcc319bda85bd664d1c1c033ab))
* 重构更新模块为事件驱动并简化状态管理 ([013f06a](https://github.com/sincely/vite6-electron-vue3/commit/013f06a012c9db0a1352efd6b46f18e46fa3bdc4))

### 🏭 Build System

* 从打包配置中移除fs-extra排除项和发行说明 ([9e9f602](https://github.com/sincely/vite6-electron-vue3/commit/9e9f6027e2d6ac3f59de5d1e71bf12b4bb91c256))

## [0.0.11](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.10...v0.0.11) (2026-03-26)

### ✨ Features

* **AdvanceTable:** 新增动态表格高度和视觉优化 ([7d9b6ac](https://github.com/sincely/vite6-electron-vue3/commit/7d9b6ac9a3363c75eee8d908715b1cccfabdc142))
* **AdvanceTable:** 添加列设置组件支持显示/隐藏和拖拽排序 ([9af54f9](https://github.com/sincely/vite6-electron-vue3/commit/9af54f9eed90f0943f6c84606503638f766d3ff7))
* **table:** 新增可编辑表格组件并替换原表格 ([fb44c07](https://github.com/sincely/vite6-electron-vue3/commit/fb44c07d325df471e5afdc7307ee7f580bfc60ed))
* 包装应用组件以支持Element Plus中文配置 ([86a3098](https://github.com/sincely/vite6-electron-vue3/commit/86a3098e49f18659b3e617f399acdd35e3cf657f))
* 增加表格多选功能支持 ([a7dcd24](https://github.com/sincely/vite6-electron-vue3/commit/a7dcd24ad634969aa47648ed5c46f6540997ce42))
* 增强安全配置并支持多环境构建 ([1796606](https://github.com/sincely/vite6-electron-vue3/commit/17966066503b372d1dd36a99f7795fe682ad2afe))
* 扩展可编辑表格组件以支持更多表单控件类型 ([1ea7793](https://github.com/sincely/vite6-electron-vue3/commit/1ea77937771197da83cfc83535378b88ff6eb2c6))
* 支持列排序和自定义表头插槽 ([e0b9a48](https://github.com/sincely/vite6-electron-vue3/commit/e0b9a4840bd39e710815a3aa3408365dbab3eb97))
* 支持表头自定义插槽 ([cefbe5d](https://github.com/sincely/vite6-electron-vue3/commit/cefbe5d53a9e2c255950679bd3786fa3ad7f609a))
* 新增可编辑表格、高级表格和树型表格功能 ([07db8fc](https://github.com/sincely/vite6-electron-vue3/commit/07db8fc3508523fb6e7da8fef6a6d78af4668266))
* 新增多个组合式函数和图表组件 ([b80185b](https://github.com/sincely/vite6-electron-vue3/commit/b80185b3f38be6e120ad6242d2e53e8a34dc4880))
* 新增对话框组件、按钮样式和日志查看功能 ([a925314](https://github.com/sincely/vite6-electron-vue3/commit/a925314df4802fd5c9ce2a43f2b79799c083e674))
* 新增树形表格组件支持数据分页和排序 ([055c58e](https://github.com/sincely/vite6-electron-vue3/commit/055c58e29e58ed0005bd17252c4e12f2505bd705))
* 新增表单页面并优化高级表单和模态框组件 ([0df2c80](https://github.com/sincely/vite6-electron-vue3/commit/0df2c8062a4e81e99c94900ef42ca97195041c46))
* **日志管理:** 重构日志页面并新增动态搜索栏和通用表格组件 ([5d9e102](https://github.com/sincely/vite6-electron-vue3/commit/5d9e1022aab2d6393354f0a8e096900730ff45eb))
* 更新列设置组件，优化图标和复选框逻辑，添加刷新功能 ([8967362](https://github.com/sincely/vite6-electron-vue3/commit/896736232a3f7d4ebc05e8a4312da17cbab9a35f))
* 更新可编辑表格组件，统一表单控件类型并添加校验规则 ([e4d5f4c](https://github.com/sincely/vite6-electron-vue3/commit/e4d5f4cec8577b4aa87ea59833a53599661c7699))
* 添加 electron-builder.json5 配置文件并更新注入更新日志脚本 ([83923aa](https://github.com/sincely/vite6-electron-vue3/commit/83923aa70fe6da66327ab9d5af15783faf4868ef))
* 添加Element Plus主题自定义支持 ([053ca5e](https://github.com/sincely/vite6-electron-vue3/commit/053ca5e69f6f778093ee1ac432ea937e53fc4ebb))
* 添加可编辑表格组件，支持动态列配置和表单验证规则 ([7191f64](https://github.com/sincely/vite6-electron-vue3/commit/7191f64a8ec5c81ddba2a88cc6d2d1ace0f817a1))
* 添加对 Vue 模板的支持并优化依赖项配置 ([01ed982](https://github.com/sincely/vite6-electron-vue3/commit/01ed98206749486a6c616d491e58d8c5ae9ff543))
* 添加行选择状态处理函数 ([a81a8cc](https://github.com/sincely/vite6-electron-vue3/commit/a81a8ccedbcf5b2957e6780aef41f4aef6b0f60a))
* 重构主题配置并添加应用设置模块 ([64dcbba](https://github.com/sincely/vite6-electron-vue3/commit/64dcbba7598b011fad67273793bf6f1c0e75f3ca))
* 重构日志页面并新增通用组件 ([d413a5c](https://github.com/sincely/vite6-electron-vue3/commit/d413a5c0022b7ac1b0628a85a8316805e992b9d0))

### 🐞 Bug Fixes

* **AdvanceTable:** 修复工具栏插槽命名错误并调整样式 ([d4d0d46](https://github.com/sincely/vite6-electron-vue3/commit/d4d0d46dc46199f7c785e4d48f38da26831956fb))
* **dark.scss:** 更新暗黑模式基础颜色以匹配设计规范 ([614ad23](https://github.com/sincely/vite6-electron-vue3/commit/614ad23613e423f4b098b84d16694c8066a19510))
* 修复主题切换 bug ([cedb3dc](https://github.com/sincely/vite6-electron-vue3/commit/cedb3dcb6784599601dee1d3250b88d2531f27ad))
* 修复列显示逻辑和插槽条件渲染问题 ([ac229f5](https://github.com/sincely/vite6-electron-vue3/commit/ac229f52f34c2d55ddceb089eadc4448175f2e33))
* 修复可编辑表格样式和功能问题 ([d07dabe](https://github.com/sincely/vite6-electron-vue3/commit/d07dabeed54cb3ecf64b3901a7ac83c4aa4f50ab))
* 修复浅色主题背景色设置错误 ([e46cbce](https://github.com/sincely/vite6-electron-vue3/commit/e46cbcea0f731a7a3053524d0693bba5c644e546))
* 修复窗口和主题监听器内存泄漏问题 ([1f77c96](https://github.com/sincely/vite6-electron-vue3/commit/1f77c96a480539d73f59d85184772a8a8f127551))
* 修复窗口控制按钮在macOS上的显示条件 ([6028504](https://github.com/sincely/vite6-electron-vue3/commit/6028504f4f5865e596c1e13983a63f1205a2e03c))
* 移除已废弃的 required 属性兼容校验逻辑 ([c0bdaec](https://github.com/sincely/vite6-electron-vue3/commit/c0bdaec2b7e79e36f7a40e06e03d6844c2fd9536))

### 📝 Documentation

* 添加相关技术文章的参考链接 ([e4ca1aa](https://github.com/sincely/vite6-electron-vue3/commit/e4ca1aa676fb8818f0fa4b99034a4d056f5a58ef))

### 🎨 Styles

* 优化登录界面样式和布局 ([4968edc](https://github.com/sincely/vite6-electron-vue3/commit/4968edc9e42cbda5c74964083ade5bea9f5fecde))
* 减少对话框模糊效果并优化窗口控制逻辑 ([b54414f](https://github.com/sincely/vite6-electron-vue3/commit/b54414f122156edd6f40902386367b57f7a42034))
* 更新 Element Plus 主题变量并移除冗余样式 ([679fdc7](https://github.com/sincely/vite6-electron-vue3/commit/679fdc732b1373edb9afc761ed978603fbe03027))

### 🔧 Chores

* 在Windows构建脚本中添加清理步骤 ([7a4ba0d](https://github.com/sincely/vite6-electron-vue3/commit/7a4ba0db68ffe039ec287728771bd134e034e4c6))
* 移除安装后显示目录的配置项 ([b0ea509](https://github.com/sincely/vite6-electron-vue3/commit/b0ea509dad26129ae364bd06591a0bf74225314b))

### ♻️ Code Refactoring

* 移除Windows 7硬件加速禁用逻辑并清理导入 ([9040d84](https://github.com/sincely/vite6-electron-vue3/commit/9040d84b03bd3581ef3a100ff5180f37dc9aeade))
* 移除未使用的日期格式化函数和模板 ([27e1f85](https://github.com/sincely/vite6-electron-vue3/commit/27e1f85abf90d76f1ba6a7951e9822d612526408))
* 移除调试日志并重构表格列配置 ([c6aaec5](https://github.com/sincely/vite6-electron-vue3/commit/c6aaec5d3480556c9ddeda1432e630d1644367fc))
* 统一对话框内容处理逻辑并支持字符串内容 ([dacadd5](https://github.com/sincely/vite6-electron-vue3/commit/dacadd5d9375eb155f34f2ad55b5297e2a5bbb01))
* 重构样式文件结构并优化组件复用 ([1f3336f](https://github.com/sincely/vite6-electron-vue3/commit/1f3336f7451b048f403deeeb19ff6f13943699c1))

### 🏭 Build System

* 更新 element-plus 依赖至 2.11.8 版本 ([f9915fe](https://github.com/sincely/vite6-electron-vue3/commit/f9915fecc6664cbeb33beec2120db4a3266d0a2b))

### 🤖 Continuous Integration

* 在发布工作流中优先使用 PAT_TOKEN 并添加 rebase 步骤 ([6930bb5](https://github.com/sincely/vite6-electron-vue3/commit/6930bb58f8166485b8601500c83c7d7e57352e71))
* 将Node.js版本从20升级到22并添加注释 ([1980ad1](https://github.com/sincely/vite6-electron-vue3/commit/1980ad12f760326568ca540ff92f39149d9a21ce))

## [0.0.10](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.9...v0.0.10) (2026-03-12)

### ✨ Features

* **login:** 重构登录界面并增加窗口高度 ([0e7838d](https://github.com/sincely/vite6-electron-vue3/commit/0e7838d8812b0441c628f7ea275ea86b9be735e5))
* **settings:** 新增设置对话框并支持主题切换和开机自启 ([cfe1eed](https://github.com/sincely/vite6-electron-vue3/commit/cfe1eed055d7dab71a06c8b359752190f84156e4))
* **UpdateDialog:** 添加对话框拖拽功能 ([a0ea5f4](https://github.com/sincely/vite6-electron-vue3/commit/a0ea5f41a4e8e57f34ccd8ecfa3572642dd7aa21))
* 优化登录界面样式并提取平台检测工具函数 ([ceb251e](https://github.com/sincely/vite6-electron-vue3/commit/ceb251e754e3618780e583e01c12284014234d1b))
* **窗口管理:** 动态调整主窗口大小并支持F12打开开发者工具 ([33880ad](https://github.com/sincely/vite6-electron-vue3/commit/33880ad9bb4fd54fb0b79866d43de88f54a977fc))

### 🐞 Bug Fixes

* 修复侧边栏子菜单动画和移除多余代码 ([c20b185](https://github.com/sincely/vite6-electron-vue3/commit/c20b18529d20f2ced1acf7fc32bd285a39688e3c))
* 修复日志路径设置和模态窗口创建逻辑 ([ff6d66b](https://github.com/sincely/vite6-electron-vue3/commit/ff6d66b4aa160cae8e4bcf8839456b387cc4d715))
* 修正仪表板菜单图标为 home ([c8e769c](https://github.com/sincely/vite6-electron-vue3/commit/c8e769c617d40155a7249d4a395360cdcedde6d5))

### 📝 Documentation

* 移除配置文件中的中文注释 ([12e4c44](https://github.com/sincely/vite6-electron-vue3/commit/12e4c44bcce08931a38ff3415c5a221b31c3f8a7))

### 🔧 Chores

* 将 Node.js 版本升级至 22.20.0 ([9297556](https://github.com/sincely/vite6-electron-vue3/commit/9297556c45e8abd93d80416499bec619989f39ce))
* 移除不再需要的legacy和restart插件及相关配置 ([a87718d](https://github.com/sincely/vite6-electron-vue3/commit/a87718d375090bb234db860160b9be6166efe2ee))
* 移除未使用的Vue组合式API导入以优化代码 ([b9f1d7a](https://github.com/sincely/vite6-electron-vue3/commit/b9f1d7ac6737159796344add57620db8c15aae54))

### ♻️ Code Refactoring

* 移除未使用的代码并调整全局搜索样式 ([9ecb3ac](https://github.com/sincely/vite6-electron-vue3/commit/9ecb3ac63a0844b2827094f3c961f73d9686b654))

## [0.0.9](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.8...v0.0.9) (2026-03-11)

### ✨ Features

* 使用视图过渡 API 实现圆形动画效果 ([d9c3abb](https://github.com/sincely/vite6-electron-vue3/commit/d9c3abb04501f47bed8ae63e672f0060ecd748e7))
* 新增HTTP相关枚举常量定义 ([0f08c03](https://github.com/sincely/vite6-electron-vue3/commit/0f08c03d439fa62c2801698556498008b374e5a7))
* 重构设置功能并添加异常处理页面 ([37d8925](https://github.com/sincely/vite6-electron-vue3/commit/37d8925c876269bfc59f114b44d6f84e3fc11e5e))

### 🐞 Bug Fixes

* 更新版权信息格式并优化配置文件的格式 ([833d12d](https://github.com/sincely/vite6-electron-vue3/commit/833d12db25c3e3aa4ba9a6b377d23439a3243a47))

### ⚡ Performance Improvements

* 优化构建配置以减小打包体积 ([5c2a4a0](https://github.com/sincely/vite6-electron-vue3/commit/5c2a4a0bae8fed0ec0af2ef749a2b8f883babc75))

### 📝 Documentation

* 更新增量更新完整实现指南，添加详细步骤和注意事项 ([0f52ee6](https://github.com/sincely/vite6-electron-vue3/commit/0f52ee60fcbf8fd7022a1fb53c1f04641df0fedd))
* 更新常见问题部分，添加 NSIS 安装器许可协议乱码解决方案 ([7d1a22d](https://github.com/sincely/vite6-electron-vue3/commit/7d1a22db2faff748349119aae26170c9da0bab5e))
* 添加 GitHub issue 模板以规范问题报告 ([f9eb334](https://github.com/sincely/vite6-electron-vue3/commit/f9eb334745c400c5e8ac5e72097637e039653ce6))
* 添加项目许可证文件 ([ef2da51](https://github.com/sincely/vite6-electron-vue3/commit/ef2da512198c8fbc5f566eedbc6e8b5b802f597c))

### 🔧 Chores

* 删除许可证文件 ([8e34ed7](https://github.com/sincely/vite6-electron-vue3/commit/8e34ed7536db71782b7550accc6692002a64ba5f))
* 更新 electron-builder 配置文件格式和发布说明 ([906480a](https://github.com/sincely/vite6-electron-vue3/commit/906480a6ffa3fd310b67428119408a819ec25e5c))
* 添加检查构建配置的 npm 脚本 ([28ed749](https://github.com/sincely/vite6-electron-vue3/commit/28ed749b2366c5352f24b9138954b75453e13cd4))
* 移除 autoprefixer 依赖及相关配置 ([846183d](https://github.com/sincely/vite6-electron-vue3/commit/846183d4a6e3c2219599eed82a9692bba1607558))
* 移除未使用的 HTML 和 Inspect 插件，优化依赖项,更新 Node.js 集成注释，明确上下文隔离设置 ([96df858](https://github.com/sincely/vite6-electron-vue3/commit/96df85836c06fb0bb817acc948a8da56fe335477))
* 精简构建配置，移除不必要的压缩选项以提高构建速度 ([211b715](https://github.com/sincely/vite6-electron-vue3/commit/211b715001742300b9ac810ebed2095effbdf9e4))

### 🏭 Build System

* 移除Windows安装包中的许可文件引用 ([a57f1f7](https://github.com/sincely/vite6-electron-vue3/commit/a57f1f72ae5626b96263872c543a4f93f672791f))

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
