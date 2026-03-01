# Changelog

All notable changes to this project will be documented in this file.


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
