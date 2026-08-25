# Changelog

All notable changes to this project will be documented in this file.


## [1.0.6](https://github.com/sincely/vite6-electron-vue3/compare/v1.0.3...v1.0.6) (2026-08-25)

### ✨ Features

*  charts下的目录组件改为 和components 下存放 ([286e144](https://github.com/sincely/vite6-electron-vue3/commit/286e144fd0deb42db1b489679fef7e3125b48c33))
* pc端 ([ffe333a](https://github.com/sincely/vite6-electron-vue3/commit/ffe333a3780e56b0e80fad2da434333c9db3e58a))
* 为 Lightning 应用新增网站组件与配置 ([7fedae5](https://github.com/sincely/vite6-electron-vue3/commit/7fedae567938dca39bb3c4405295f70fe8653e85))
* 为布局组件添加过渡效果，提升用户体验 ([7afd006](https://github.com/sincely/vite6-electron-vue3/commit/7afd006179af894fa0a2607bf122688471c5f60d))
* 从主进程拉取用户 token，确保路由守卫正确判断登录状态 ([efcdffc](https://github.com/sincely/vite6-electron-vue3/commit/efcdffce7754f0d7e4e0aeb63d7efcaa2c38ef92))
* 优化 Element Plus 组件加载逻辑，移除强制合包以减少登录窗口的静态依赖 ([7ec4a62](https://github.com/sincely/vite6-electron-vue3/commit/7ec4a620066c24272bec152962865b1cb3d6af30))
* 优化 logo 组件样式，调整高度和内边距以改善布局 ([b077004](https://github.com/sincely/vite6-electron-vue3/commit/b0770046843b08c8e772ee690bc4fe2c851837f9))
* 优化全屏体验，添加全屏提示信息并调整多标签导航显示逻辑 ([a554b7b](https://github.com/sincely/vite6-electron-vue3/commit/a554b7bc2f7760621786f31e9b13b32ff9f660fe))
* 优化启动动画处理，确保主窗口加载时动画展示时间不低于 2s ([bd75dc1](https://github.com/sincely/vite6-electron-vue3/commit/bd75dc1d02a6bf5dba5b97b30e70c5e5c36985d1))
* 优化操作按钮样式，统一使用 Element Plus 按钮组件并调整布局 ([b5fcc95](https://github.com/sincely/vite6-electron-vue3/commit/b5fcc951e3d031b3e7ce62042cf4741be4d60cbd))
* 优化模块加载，惰性加载 axios 和 electron-updater，减少主进程启动开销；按需生成 Element Plus 图标注册文件 ([de52889](https://github.com/sincely/vite6-electron-vue3/commit/de528895e07c5a10f540932fe9bd4101eea2ab68))
* 优化登录窗口显示逻辑，基于登录态决定是否显示主窗口或登录窗口 ([b1d4bfb](https://github.com/sincely/vite6-electron-vue3/commit/b1d4bfb914662cf6c3331050f8e325332d1b436f))
* 优化登录窗口管理，确保新窗口可见并清理旧窗口引用 ([a0bcd80](https://github.com/sincely/vite6-electron-vue3/commit/a0bcd80e49e582177d3db395f701f267071b9ae9))
* 在菜单配置中为外部链接添加 iframe 支持 ([b4154b8](https://github.com/sincely/vite6-electron-vue3/commit/b4154b883b2dd5502eb4a2fa22bf9510320b69c5))
* 增加主题管理功能，支持持久化主题设置并同步到主进程 ([b6749a3](https://github.com/sincely/vite6-electron-vue3/commit/b6749a37d0ae4df413852af4495d1582676cbb88))
* 增加侧边栏折叠开关的可用性提示，优化界面显示逻辑 ([37a61b3](https://github.com/sincely/vite6-electron-vue3/commit/37a61b39f59e92925c4dee46534846fa77fb5ffc))
* 增强二级菜单悬停效果，优化对齐和显示逻辑 ([1f5f7f8](https://github.com/sincely/vite6-electron-vue3/commit/1f5f7f82a382c8aa8b0dda8d4916047fe4cdafa4))
* 增强加载组件，支持浅色和暗色主题的动态样式 ([d9976ce](https://github.com/sincely/vite6-electron-vue3/commit/d9976ce6f08b8b64338e98d3e391e00e48b794c8))
* 实现应用激活与路由的深度链接支持 ([6feb567](https://github.com/sincely/vite6-electron-vue3/commit/6feb567ab7f64bbca6bb8c0563b6b63fab04e58a))
* 实现更新下载进度反馈与托盘提示，优化用户体验 ([065e3ab](https://github.com/sincely/vite6-electron-vue3/commit/065e3ab7f51980a22ca07c0bbbec2d6d5c295196))
* 拆分app目录存放不同项目 ([345e620](https://github.com/sincely/vite6-electron-vue3/commit/345e620e3ced03514710b083a1ad449a74e6db97))
* 新增图标并优化仪表盘布局 ([c068b0f](https://github.com/sincely/vite6-electron-vue3/commit/c068b0f24678774144bd0a395cd09b3d8ec77814))
* 新增多种小组件，包括图标展示、图片裁剪、二维码生成、文本滚动、视频播放、富文本编辑及水印功能 ([3e81ca6](https://github.com/sincely/vite6-electron-vue3/commit/3e81ca65924e0e3a3b4c16e7cd00034633949f76))
* 新增登录界面 ([4fc4b02](https://github.com/sincely/vite6-electron-vue3/commit/4fc4b02d5be86f1f394b6796de8c280ec577e400))
* 更新 echarts 引入逻辑，优化组件和图表类型的引入 ([cdf9387](https://github.com/sincely/vite6-electron-vue3/commit/cdf93875cd925f7f260965404d17035f86997e4e))
* 更新 ESLint 配置以包含网站构建输出目录，优化代码检查范围 ([1861dd6](https://github.com/sincely/vite6-electron-vue3/commit/1861dd69cbc2c556d605c6402b370a87c6960904))
* 更新 loadHash 函数文档，明确 DevTools 快捷键使用方式 ([05f606d](https://github.com/sincely/vite6-electron-vue3/commit/05f606d01433b7a3f6ad7337e0c3e6e84c3056af))
* 更新 web-admin 和 backend 启动脚本路径，确保正确引用 ([b4ce283](https://github.com/sincely/vite6-electron-vue3/commit/b4ce283cd08bf6d2a53223f84f8983f7069fd995))
* 更新全局页脚组件，显示公司信息并优化样式 ([c5f5d1a](https://github.com/sincely/vite6-electron-vue3/commit/c5f5d1ace154797d491e062970127eb36f55208c))
* 更新密码重置成功界面的图标和样式，提升视觉效果 ([d28b090](https://github.com/sincely/vite6-electron-vue3/commit/d28b09015530838500fa4ee7b688d050b9b7078e))
* 更新工具栏插槽名称为 toolbar-left，并在用户管理页面添加过滤功能 ([77ed6f3](https://github.com/sincely/vite6-electron-vue3/commit/77ed6f3551a23defe67c4596439d2df8a8fe7941))
* 更新打包配置，增加排除的文件和目录 ([983670f](https://github.com/sincely/vite6-electron-vue3/commit/983670f501c4dcf4d73d6b23d612233287e48a67))
* 更新用户和角色管理API，支持手机号登录，优化错误提示信息 ([88366c3](https://github.com/sincely/vite6-electron-vue3/commit/88366c333db5f7cca98fc050dab42bf953f4f19b))
* 更新通知 API 调用方式，统一使用 window.notification.show() ([565133f](https://github.com/sincely/vite6-electron-vue3/commit/565133fb8e02fdd19b61f24199c777f48a0923f1))
* 更新项目配置，优化启动性能，移除不必要的依赖，添加新的模拟数据 ([0dfcefb](https://github.com/sincely/vite6-electron-vue3/commit/0dfcefb27afceb59561f43b25a49c6d94f3e6b31))
* 添加 loading 组件样式，支持主窗口 splash 显示期间拖拽 ([52343b5](https://github.com/sincely/vite6-electron-vue3/commit/52343b5af645ed2474bc417a2ccc586ad8086f83))
* 添加 no-drag 样式以确保图标和名称可点击，优化拖拽体验 ([63c0ec7](https://github.com/sincely/vite6-electron-vue3/commit/63c0ec767e64f0592d4006eada878051f0333a03))
* 添加 splashFailsafe 脚本以处理 Vue 启动异常，确保应用顺利加载 ([03067c6](https://github.com/sincely/vite6-electron-vue3/commit/03067c6b3612256e49b6a8999fbddd5f4f338276))
* 添加 webhook 图标并更新请求演示路由图标 ([f013712](https://github.com/sincely/vite6-electron-vue3/commit/f013712c6165163269c4c1a33087462fd1cb60f0))
* 添加src/backend目录到构建文件列表中 ([87d8098](https://github.com/sincely/vite6-electron-vue3/commit/87d80980a52672bdc688453d9f8e1a621a727979))
* 添加关于弹窗，展示版本号、提交哈希和构建日期 ([7e2a02e](https://github.com/sincely/vite6-electron-vue3/commit/7e2a02ed13427e052149d4e63ccaead9e8205e63))
* 添加启动画面和背景色，优化窗口切换体验 ([4405a58](https://github.com/sincely/vite6-electron-vue3/commit/4405a58ffa4a1935c333e2c6fd52bb31cc5ffcde))
* 添加图标按钮组件，支持自定义尺寸和圆形样式 ([dadc7cd](https://github.com/sincely/vite6-electron-vue3/commit/dadc7cd38e6c65459b6746e8d096c27400a45c6f))
* 添加左右滚动箭头以优化标签视图的滚动体验 ([c7a746c](https://github.com/sincely/vite6-electron-vue3/commit/c7a746c1138ad9e1c847b5b090ddd6cf5d13164d))
* 添加生产环境模拟登录功能，更新相关配置和请求逻辑 ([fa9aa0a](https://github.com/sincely/vite6-electron-vue3/commit/fa9aa0acc0555143a3d5f52274939877b77c99e5))
* 添加预设主题色功能，允许用户快速选择主题色并同步相关颜色设置 ([ca8ccbc](https://github.com/sincely/vite6-electron-vue3/commit/ca8ccbc92872e112b2dded3a45f6608c94fd7cc7))
* 移除不再使用的 eslint-define-config 依赖，优化配置文件 ([b1b1f7f](https://github.com/sincely/vite6-electron-vue3/commit/b1b1f7f93c1de415ba95ad3cab17e63bebe9b92e))
* 移除全局错误处理逻辑，简化应用初始化代码 ([635c9ac](https://github.com/sincely/vite6-electron-vue3/commit/635c9aca349f83d1b8ecc503c74e7933e7f77846))
* 移除全局页脚组件中的多余公司信息和链接，简化代码 ([45c7b72](https://github.com/sincely/vite6-electron-vue3/commit/45c7b726534433457acef13ed8f55ac1caaddcb8))
* 移除设置对话框中的系统信息和相关链接，简化界面 ([60591e6](https://github.com/sincely/vite6-electron-vue3/commit/60591e6c534cf9eb2579e0364893de1e9521f5af))
* 请求改造 ([9081282](https://github.com/sincely/vite6-electron-vue3/commit/90812821a43dba2a95457eae28ee9c0aad3d9938))

### 🐞 Bug Fixes

* 优化启动速度 ([c783dbd](https://github.com/sincely/vite6-electron-vue3/commit/c783dbd5bd5c61f3d155caff08662ac8fc9beebd))
* 修复正式环境打包失败白屏问题 ([48aac8a](https://github.com/sincely/vite6-electron-vue3/commit/48aac8a752919cd042b82011d786346be5a732a5))
* 修复结果页样式，确保内容垂直居中显示 ([5cbfd33](https://github.com/sincely/vite6-electron-vue3/commit/5cbfd33b1f64bfcdc66fc5c54dbd5dbe2624f3c3))
* 修复配置轮询间隔和缓存控制，确保每次请求获取最新配置 ([77d214e](https://github.com/sincely/vite6-electron-vue3/commit/77d214e595ae19d94e0eb33ff1b8454a3e74d42a))
* 更新 axios 依赖版本至 1.19.0 ([f6ea005](https://github.com/sincely/vite6-electron-vue3/commit/f6ea005663dd85259a018cf0fde33439f63d5037))
* 更新Content-Security-Policy中的connect-src，添加localhost支持 ([ee3a3dd](https://github.com/sincely/vite6-electron-vue3/commit/ee3a3dd6b6b7741a3a4cd4706209cafbd6624679))
* 渲染进程负责交互与参数传递，主进程负责真实请求与系统能力 ([ba7eade](https://github.com/sincely/vite6-electron-vue3/commit/ba7eade9a23b54290380605af92c52104ef0341a))
* 设置请求头的 Content-Type 为 application/json;charset=UTF-8 ([3c169c0](https://github.com/sincely/vite6-electron-vue3/commit/3c169c0b645f38754599eb58b0a124cbb3b52f69))

### ♻️ Code Refactoring

* 修复登录页面优化 ([65d0f50](https://github.com/sincely/vite6-electron-vue3/commit/65d0f505e077d09a26a3be04b837575f205e7579))
* 移除vue api 手动引入 ([a98f058](https://github.com/sincely/vite6-electron-vue3/commit/a98f058ecf11c221ec5d6a5f59ec8867249c82bd))

## [1.0.3](https://github.com/sincely/vite6-electron-vue3/compare/v1.0.2...v1.0.3) (2026-08-13)

### ✨ Features

* 修复关于弹框icon错误 ([a2130e8](https://github.com/sincely/vite6-electron-vue3/commit/a2130e8ff66b9502e60c84a95e275240bc44f402))
* 修复弹框样式 ([7f0a5f8](https://github.com/sincely/vite6-electron-vue3/commit/7f0a5f87ee82a79d93fdf4c2bb9652f580d97aa4))
* 删除不再使用的图标文件 ([3831375](https://github.com/sincely/vite6-electron-vue3/commit/38313758c0c6d79ea9a212348770182420dc260d))
* 增加tag-view 支持 keep-alive ([cafe69a](https://github.com/sincely/vite6-electron-vue3/commit/cafe69a99a4c693fb083998ca5da2b1369d48bf5))
* 增加后端服务 ([ba4228d](https://github.com/sincely/vite6-electron-vue3/commit/ba4228d1f434ca2a203ede1fd9f31152307d8aec))
* 增强 macOS 支持，调整窗口标题栏样式及拖拽区域 ([41b1425](https://github.com/sincely/vite6-electron-vue3/commit/41b1425401c81eb3f3443624ab0a85a4a4902ce9))
* 完善主进程通知模块，增加平台图标适配及通知创建逻辑 ([6f66e04](https://github.com/sincely/vite6-electron-vue3/commit/6f66e04a7bc01a9f06e9a9f0e30543307eb102b5))
* 实现主进程 HTTP 请求管理，支持 IPC 调用并处理响应 ([e6e88fd](https://github.com/sincely/vite6-electron-vue3/commit/e6e88fdb48fc5762776ff2850124b1b625e26ec9))
* 实现配置持久化和日志功能 ([73fe695](https://github.com/sincely/vite6-electron-vue3/commit/73fe695a071ea58dd2fee06c5f94f501555d0923))
* 更新 connect-src 以支持更多外部资源 ([55eee82](https://github.com/sincely/vite6-electron-vue3/commit/55eee82192737a7d757d6b1f353278ded1282ac2))
* 更新 Vite 配置，排除 Electron 模块以避免打包警告 ([a561437](https://github.com/sincely/vite6-electron-vue3/commit/a561437ac302141466c61d622d9df9480b53afa6))
* 更新 Windows 配置注释，说明代码签名选项影响 ([36c10e9](https://github.com/sincely/vite6-electron-vue3/commit/36c10e91b417c862f94bbd76c1e302bade714222))
* 更新入口文件路径，新增主进程渲染逻辑 ([ad6bf42](https://github.com/sincely/vite6-electron-vue3/commit/ad6bf42d20f7ebcc39680d09aae8e7ee59d9ebad))
* 更新图标资源路径，新增应用图标文件 ([20493b3](https://github.com/sincely/vite6-electron-vue3/commit/20493b3310e6a3285da3b19058a796e85f6b3cd1))
* 添加 src/backend/.nitro/ 到 .gitignore ([1f10f1c](https://github.com/sincely/vite6-electron-vue3/commit/1f10f1c3bcf9810d005fe0c7cb4314b5c9502c90))
* 添加主题切换过渡动画，支持圆形扩散效果，优化用户体验 ([16aadd1](https://github.com/sincely/vite6-electron-vue3/commit/16aadd1452e24dafcb348a4b76aa59101b4d9eb5))
* 添加卡片、图表和定价模板页面 ([192af22](https://github.com/sincely/vite6-electron-vue3/commit/192af22b8f5ad01eeb957c62733a2eaa9d61a0c6))
* 添加样式设置组件，支持表格样式自定义，更新图标使用，替换为 Iconify 图标库 ([2a91e77](https://github.com/sincely/vite6-electron-vue3/commit/2a91e7732cc30d631161874ac32eda9a0c9e324a))
* 添加结果页面组件，支持成功和失败状态，优化用户反馈体验 ([05a6b13](https://github.com/sincely/vite6-electron-vue3/commit/05a6b1389c168e046d19ddbdba4eb09f95b6b362))
* 添加聊天窗口组件（Lightning Bot），支持消息发送和状态管理 ([baa655c](https://github.com/sincely/vite6-electron-vue3/commit/baa655cfe4ad408a54d6e9ab61bfe3d54f49bfc4))
* 添加自定义协议 app:// 注册及处理器 ([0cb9101](https://github.com/sincely/vite6-electron-vue3/commit/0cb9101ac1a059564ef0cf31621520d2b3655264))
* 移除不再需要的 asarUnpack 配置项 ([f882954](https://github.com/sincely/vite6-electron-vue3/commit/f882954b7c7431f013dd607bc406e35693d0b3b2))
* 移除不必要的环境变量日志输出 ([527752a](https://github.com/sincely/vite6-electron-vue3/commit/527752aa065c6b4fcb8c2d4d3cf42208f1e34910))
* 移除面包屑导航组件的代码 ([e617dba](https://github.com/sincely/vite6-electron-vue3/commit/e617dba607456fb0918f923043450f98055bbb6d))
* 重构全局搜索组件，添加搜索弹窗和历史记录功能，优化用户体验 ([48bdf4a](https://github.com/sincely/vite6-electron-vue3/commit/48bdf4a849c4202549f75feb51fecfd57699b47a))

### 🐞 Bug Fixes

* 修复 KeepAlive 和 Transition 组件的嵌套关系，确保缓存正常工作 ([e1fc373](https://github.com/sincely/vite6-electron-vue3/commit/e1fc373a297ef140011e9b4a5d435b64e28a8ebd))
* 将 logo 名称从 "AI Desktop" 修改为 "Lightning" ([a7f05a0](https://github.com/sincely/vite6-electron-vue3/commit/a7f05a024894b41933651c82afb40bdaecc591ed))
* 替换固定指示器小圆点为 pin 图标，优化标签显示样式 ([a4da2e8](https://github.com/sincely/vite6-electron-vue3/commit/a4da2e8c2aeeb4d49fe130e34d451df3294cd020))
* 移除页面入场动效类，简化系统页面结构 ([bb72edb](https://github.com/sincely/vite6-electron-vue3/commit/bb72edb11847917c9855916dc93e5e2830b21611))
* 调整 PagePlaceholder 组件样式，修复宽度和高度设置 ([a7c7081](https://github.com/sincely/vite6-electron-vue3/commit/a7c70810c57baa4b8d109df5a3d863da92ed922f))

## [1.0.2](https://github.com/sincely/vite6-electron-vue3/compare/v1.0.1...v1.0.2) (2026-08-12)

### ✨ Features

* 为菜单项和子菜单项添加图标支持，优化用户界面 ([5892350](https://github.com/sincely/vite6-electron-vue3/commit/5892350a98b36bfb2e6e62526bc66a09689ce085))
* 优化表格组件样式，增加状态徽标和工具栏按钮美化 ([f449181](https://github.com/sincely/vite6-electron-vue3/commit/f449181c7950baae5a319854ac2aba9ee980c916))
* 优化顶部菜单组件，增加横向滚动支持，改善用户交互体验 ([eb243c5](https://github.com/sincely/vite6-electron-vue3/commit/eb243c5fe0c209174883a0dc8767fe3d3a2cd39d))
* 增加notification ([394f85a](https://github.com/sincely/vite6-electron-vue3/commit/394f85a3ecc6ef2b44e4307013d2166769aecacd))
* 增加标签关闭操作的可用性检测，动态禁用无效选项 ([e935da7](https://github.com/sincely/vite6-electron-vue3/commit/e935da7fb266fcd5e8e6ffbd90c8bcee95c4214d))
* 实现与 QoderWork 对齐的更新系统，新增远端配置支持与强制升级逻辑 ([e401a37](https://github.com/sincely/vite6-electron-vue3/commit/e401a370c5780eb38409de1b6de09bb2ce0ef7d8))
* 更新定宽模式下的具体宽度值至1600px，优化内容显示 ([5bb1165](https://github.com/sincely/vite6-electron-vue3/commit/5bb1165ce08cb8e1b7675a6feaa1944c17e2e503))
* 更新菜单和logo组件的拖拽区域设置，优化用户交互体验 ([eed62f5](https://github.com/sincely/vite6-electron-vue3/commit/eed62f5dc1f14ff2d25e78effe990a887bcdd170))
* 更新通知面板和更新对话框，增加未读通知徽标和模拟通知功能 ([590611d](https://github.com/sincely/vite6-electron-vue3/commit/590611db43be8a0ede12290af0333bd5bd158267))
* 添加 ResizeObserver 以优化图表尺寸监听，修复组件销毁时的资源释放问题 ([04fc3c0](https://github.com/sincely/vite6-electron-vue3/commit/04fc3c060f9556ac57cf74e10130667fba05a292))
* 添加.zcode到.prettierignore文件 ([722c527](https://github.com/sincely/vite6-electron-vue3/commit/722c5272b329ac14bbc58c2a81621a82bbf18c50))
* 添加archity技能 ([f498e37](https://github.com/sincely/vite6-electron-vue3/commit/f498e37473c7d887b6b03856d76324ab03bc3b95))
* 添加关于对话框和相对时间计算，优化更新检查功能 ([a12dc23](https://github.com/sincely/vite6-electron-vue3/commit/a12dc2350a89f3038e8513019f47bc41f2c15a91))
* 添加左右滚动箭头至顶部菜单，优化用户导航体验 ([6fcfae6](https://github.com/sincely/vite6-electron-vue3/commit/6fcfae6567776316f4a7972070a2579cbda1fd1f))
* 添加检查更新功能至托盘菜单，确保用户能及时看到更新提示 ([f8a6c7c](https://github.com/sincely/vite6-electron-vue3/commit/f8a6c7c0b6aaceb8cdb695fe914561b82ff7d9e9))
* 添加登录和密码找回功能 ([f38d5c7](https://github.com/sincely/vite6-electron-vue3/commit/f38d5c78570009214a3207bc61f278069adc34e6))
* 添加窗口最大化状态监听功能，优化用户界面交互体验；新增最大化和最小化图标 ([0012a5d](https://github.com/sincely/vite6-electron-vue3/commit/0012a5d85b4cc26f56961c8eb35056ddfe8f4855))
* 添加系统信息 API，记录系统运行环境信息 ([7877a89](https://github.com/sincely/vite6-electron-vue3/commit/7877a898ab1a9f6e9ff5e50ef93c13809d331548))
* 移除调试代码，优化用户登出流程 ([5e37c45](https://github.com/sincely/vite6-electron-vue3/commit/5e37c4548f6ee05a6f1514e4a794067270f4ee01))
* 移除非核心功能的延迟初始化，优化应用启动速度 ([61acbb4](https://github.com/sincely/vite6-electron-vue3/commit/61acbb47a792832e0576effbf17366b97c379061))
* 移除顶部菜单条件，始终显示搜索组件 ([57f2c97](https://github.com/sincely/vite6-electron-vue3/commit/57f2c973a2117f155d39e021635b16451eff671d))
* 简化jsconfig.json格式，优化路径配置 ([1d95c05](https://github.com/sincely/vite6-electron-vue3/commit/1d95c055a5a28913b4e61f0608afe1d1cd5b8c81))

### 🐞 Bug Fixes

* 修正jsconfig.json错误 ([6d90a53](https://github.com/sincely/vite6-electron-vue3/commit/6d90a53575f50de5449da200f2b2ce5bec1bccbb))
* 修正主题样式中的边框颜色和侧边栏背景色 ([f391982](https://github.com/sincely/vite6-electron-vue3/commit/f391982ed7c76a77156bd63cab482c462509f4eb))
* 去除无用的日志 ([678efbc](https://github.com/sincely/vite6-electron-vue3/commit/678efbc2bd56f4aa366b5ea2fe184c5c10389cbc))
* 添加自定义类到退出登录确认框以改善样式 ([694796c](https://github.com/sincely/vite6-electron-vue3/commit/694796cda661a93d36953b7991d7d4ed5163384c))
* 禁用 Windows 可执行文件的代码签名 ([9775a0f](https://github.com/sincely/vite6-electron-vue3/commit/9775a0f75b6935c9fc1b3f634bd46761523e7cc2))

### 📝 Documentation

* 更新发布与自动更新指南，简化内容并调整结构 ([7fecf93](https://github.com/sincely/vite6-electron-vue3/commit/7fecf93200b05a319463ca5fbe400116dce3c20f))
* 更新开发环境调试与更新模拟部分，增加核心原理和模拟方式说明 ([82c80da](https://github.com/sincely/vite6-electron-vue3/commit/82c80dabb7fa4c7584ae00cc772510e947867a1c))

### 🔧 Chores

* 将 electron-builder 及相关依赖更新至 25.1.8 ([6ed6702](https://github.com/sincely/vite6-electron-vue3/commit/6ed670216522ed539cef5b1469cfe4791956e636))
* 更新 Vite 版本至 6.4.3，调整 pnpm-lock.yaml 中的依赖项 ([bc3b74a](https://github.com/sincely/vite6-electron-vue3/commit/bc3b74a96ea240ce9d4416f2cfa42e8a4b164594))

### ♻️ Code Refactoring

* 移除主进程无用文件 ([ac2e8f3](https://github.com/sincely/vite6-electron-vue3/commit/ac2e8f3985048517e2033ac073bdbf658f02552f))
* 移除更新通道解析和负载构建逻辑，简化更新处理 ([8e634ee](https://github.com/sincely/vite6-electron-vue3/commit/8e634eeca4af9f10fe82fbc099b228e59642588a))

## [1.0.1](https://github.com/sincely/vite6-electron-vue3/compare/v1.0.0...v1.0.1) (2026-08-06)

### ✨ Features

* add profile management and update dialog enhancements ([812d2fe](https://github.com/sincely/vite6-electron-vue3/commit/812d2fea96435aa2a39c1c3301d437cb11b6548b))
* 增加对Electron、Node和Chromium版本的支持，并优化全局页脚布局 ([3e4013d](https://github.com/sincely/vite6-electron-vue3/commit/3e4013dcbe905d2cbdd837d0ae7d3fa140abd179))
* 添加 WebGL 流体动画背景组件 SpectraBackground ([c731d1b](https://github.com/sincely/vite6-electron-vue3/commit/c731d1bc73727afc370a3604c068a68953840e70))
* 添加更新检查功能和更新对话框样式优化 ([32cfe65](https://github.com/sincely/vite6-electron-vue3/commit/32cfe650b5cd55eb541152aebfa8ed1719d44ee1))
* 添加自定义菜单功能，支持文件、编辑、视图、窗口和帮助选项 ([71c9a01](https://github.com/sincely/vite6-electron-vue3/commit/71c9a013c9f22be5c35aa8730a4d4bd801ac624f))
* 重构用户管理界面并增强仪表盘视觉效果 ([b00fb0a](https://github.com/sincely/vite6-electron-vue3/commit/b00fb0a942eb5f484d7cc4cdbdadf0462b732702))

### 🐞 Bug Fixes

* 修复401退出登录问题 ([25ab951](https://github.com/sincely/vite6-electron-vue3/commit/25ab951645165553cfe4b60beb5de7ee08de6c68))
* 修复系统主题监听错误问题 ([477668d](https://github.com/sincely/vite6-electron-vue3/commit/477668d9762d1155294d9efc0fc9e65219d37f15))
* 修复退出登录问题 ([385e93f](https://github.com/sincely/vite6-electron-vue3/commit/385e93f173ded2f46efc5915a7e52ef6e9d01b02))

### 🎨 Styles

* 优化卡片样式，调整边框半径和阴影，更新主题颜色 ([9cf2dd3](https://github.com/sincely/vite6-electron-vue3/commit/9cf2dd3e51ca9690b46cbfa113ae7cb0982b7fc9))
* 优化样式，移除多余的背景裁剪属性，调整装饰性光斑的内联样式 ([efe4908](https://github.com/sincely/vite6-electron-vue3/commit/efe490872bc731f8872c168a18a8c3ee26262ae3))

### ♻️ Code Refactoring

* 更新颜色变量并改进组件样式 ([c46ed41](https://github.com/sincely/vite6-electron-vue3/commit/c46ed410ed95356954ca47a5e4129e91fde26e6f))
* 移除菜单风格相关代码，优化样式变量使用 ([6eb22e2](https://github.com/sincely/vite6-electron-vue3/commit/6eb22e2399a89afcda47ea9b2e02d818a1b697e8))

## [1.0.0](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.23...v1.0.0) (2026-07-13)

### 🐞 Bug Fixes

* 修复主题切换闪烁问题 ([7b235ab](https://github.com/sincely/vite6-electron-vue3/commit/7b235ab8fee2d9f80ba7bfa808d5214185935718))

### 🔧 Chores

* 更新electron及相关构建工具版本 ([3939a8c](https://github.com/sincely/vite6-electron-vue3/commit/3939a8cb99315c426bf8c15da38181424e56d5d2))

## [0.0.23](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.22...v0.0.23) (2026-07-13)

### ✨ Features

* 初始化 Electron 主进程框架和窗口管理 ([393ca7b](https://github.com/sincely/vite6-electron-vue3/commit/393ca7b783019d9ab100e170da7815e62ecbf557))
* 新增前端项目架构分析及图表生成能力 ([e8d40ec](https://github.com/sincely/vite6-electron-vue3/commit/e8d40ecb549a040f2197e3452385ddef04238a1a))

### 📝 Documentation

* 重构架构文档，新增构建优化与发布流程 ([13a44ef](https://github.com/sincely/vite6-electron-vue3/commit/13a44effade4b04ed4e499fa9db826168a4967ad))

### 🔧 Chores

* **deps:** 升级 Node.js 版本规范并调整依赖版本 ([5180ea5](https://github.com/sincely/vite6-electron-vue3/commit/5180ea54b4c208b343198edc5cfbf7081ecb1ee7))
* v0.0.22 ([633552b](https://github.com/sincely/vite6-electron-vue3/commit/633552ba6c64c9a08db13a1cb0d187d2a8b9f977))

* chore(deps): 升级 Node.js 版本规范并调整依赖版本 (5180ea5)
* feat: 初始化 Electron 主进程框架和窗口管理 (393ca7b)
* feat: 新增前端项目架构分析及图表生成能力 (e8d40ec)

## [0.0.22](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.21...v0.0.22) (2026-06-16)

### ✨ Features

* 优化更新逻辑并增强界面体验 ([ef3ec72](https://github.com/sincely/vite6-electron-vue3/commit/ef3ec726ef94541ddfa6dad1f2b1cff36f93138c))
* 实现主窗口和登录窗口切换及登出流程优化 ([ed4de71](https://github.com/sincely/vite6-electron-vue3/commit/ed4de710a49aa02b546045b42d6b4ba59c6db849))
* 添加impeccable技能的工具、脚本与参考文档 ([1f9bc27](https://github.com/sincely/vite6-electron-vue3/commit/1f9bc27c6198334046e82eb0aaa4295786c4195b))

### 🐞 Bug Fixes

* 修复.npmrc文件中的空格问题 ([9f65772](https://github.com/sincely/vite6-electron-vue3/commit/9f657724505f66fb790496a8b94f397d18165fc3))
* 修复窗口恢复时未显示的问题 ([bc66e0d](https://github.com/sincely/vite6-electron-vue3/commit/bc66e0d0d0a8ed7c4ce4e3cc0f5a7c9429ecd6dc))
* 修正electron-builder配置和资源路径 ([bc59c30](https://github.com/sincely/vite6-electron-vue3/commit/bc59c30c0f33d52ea713ff2a574195573eefc0e8))
* 解决stylelint不对称依赖 ([4e8b063](https://github.com/sincely/vite6-electron-vue3/commit/4e8b063b63fc0c4f7dd734ab46ad3a80ef6cd86e))

### ⚡ Performance Improvements

* 为开发服务器添加组件预热以提升热更新速度 ([692a8ae](https://github.com/sincely/vite6-electron-vue3/commit/692a8ae69f707c8de224f0e86756d8bb82ede8b4))

### 📝 Documentation

* 添加 ui-to-vue 转换器技能说明文档 ([1e42647](https://github.com/sincely/vite6-electron-vue3/commit/1e42647242a040cab9e8e5c2e7eb375d688524d6))

### 🎨 Styles

* 优化白蓝主题样式与界面配色 ([e947f85](https://github.com/sincely/vite6-electron-vue3/commit/e947f8525d770de00de76948d5a7c605cb74a663))

### 🔧 Chores

* 使用 pnpm 替换 npm 并删除旧的 release 工作流 ([d92fea0](https://github.com/sincely/vite6-electron-vue3/commit/d92fea0c57a30b10a307dfb5175806a4a3a0db04))
* 初始化算法艺术技能结构和模板文件 ([a61ee97](https://github.com/sincely/vite6-electron-vue3/commit/a61ee979c4159cde11d697a7746900f0a9e8cb5f))
* 升级构建工具和依赖版本 ([bc2153c](https://github.com/sincely/vite6-electron-vue3/commit/bc2153c03e9b9577cc3f7579972cb4ecc96f9cd8))

## [0.0.21](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.20...v0.0.21) (2026-04-27)

### ✨ Features

* 新增用户、角色和菜单管理模块 ([e9bbfb1](https://github.com/sincely/vite6-electron-vue3/commit/e9bbfb1c61f4b9310c4b5c084c9053df854892b1))
* 添加底部状态栏显示控制与高度设置 ([4b96724](https://github.com/sincely/vite6-electron-vue3/commit/4b96724954f6e0a41115ed5979be91c5ea9d7907))
* 重构页面切换动画为全局可配置 ([fdf2f65](https://github.com/sincely/vite6-electron-vue3/commit/fdf2f6506e5833f958fb5ecb6049d4f08fd1e5ee))

### 🐞 Bug Fixes

* 修复图表在移动端布局和响应式调整的问题 ([fdb707e](https://github.com/sincely/vite6-electron-vue3/commit/fdb707e9a0ecf00cb9774671108565bc15fab371))
* 修复子菜单项悬停和激活状态的样式冲突 ([b623989](https://github.com/sincely/vite6-electron-vue3/commit/b62398998d2de8daa29a67b001505258805cc3af))
* 修复菜单展开状态逻辑和点击行为 ([5b91ec7](https://github.com/sincely/vite6-electron-vue3/commit/5b91ec7e6fbfa01ad659e68c862b5942753c5733))
* 移除未使用的响应式逻辑并简化布局样式 ([5a7d6d3](https://github.com/sincely/vite6-electron-vue3/commit/5a7d6d38acb241c6ea6d68ce4e57b7d93e4f302a))

### 📝 Documentation

* 更新增量更新验证示例中的下载文件路径 ([e24eb9d](https://github.com/sincely/vite6-electron-vue3/commit/e24eb9de51751bc0541928635d08d3209f6519a5))
* 补充 Electron 打包、自动更新及接口请求实践文档 ([7a358e6](https://github.com/sincely/vite6-electron-vue3/commit/7a358e65c2aca384851c6a929d349347af8d9be5))

### 🎨 Styles

* 为查询和重置按钮添加图标 ([659c0b3](https://github.com/sincely/vite6-electron-vue3/commit/659c0b3f7ca0a4b1ec7cd697bd02965e2b41120a))

### 🔧 Chores

* 添加推荐的VSCode Vue扩展配置 ([1aafacb](https://github.com/sincely/vite6-electron-vue3/commit/1aafacb15d99224e488defd1ef516164826992e0))

### ♻️ Code Refactoring

* **AdvanceTable:** 移除本地存储并添加请求延迟处理 ([81e56ed](https://github.com/sincely/vite6-electron-vue3/commit/81e56ed7ed3966795d9fb16096c64dd7fd020d35))
* **update:** 移除热更新功能，仅保留全量更新 ([b4c7f6a](https://github.com/sincely/vite6-electron-vue3/commit/b4c7f6ac1e80564ca2c58f7760c4775b6e04fe5a))
* 将侧边栏菜单和用户面板拆分为独立组件 ([a3d2e16](https://github.com/sincely/vite6-electron-vue3/commit/a3d2e16f36b805e91281ae5247b5eae15af85c38))

### 🏭 Build System

* 在 asarUnpack 中包含 dist 目录 ([bd5ce39](https://github.com/sincely/vite6-electron-vue3/commit/bd5ce396857be1cac0e5889dc4dae84c8f76a755))

## [0.0.20](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.19...v0.0.20) (2026-04-13)

### 🏭 Build System

* 回退 electron-builder 和 electron-updater 版本 ([1ceef68](https://github.com/sincely/vite6-electron-vue3/commit/1ceef68298fb86287b4f48fe1c8cc993faadcee1))

## [0.0.19](https://github.com/sincely/vite6-electron-vue3/compare/v0.0.18...v0.0.19) (2026-04-13)

### 🔧 Chores

* v0.0.18 ([ce1af5e](https://github.com/sincely/vite6-electron-vue3/commit/ce1af5edac7ee0d136e228908a268f73227b36f6))
* v0.0.18 ([cee3135](https://github.com/sincely/vite6-electron-vue3/commit/cee31351e140613c02520de78624c3ba9e56a4bb))
* v0.0.18 ([0556f76](https://github.com/sincely/vite6-electron-vue3/commit/0556f76ab80196082c2b20ab3d37e9afb2c752f2))
* 回滚版本并更新依赖项 ([731aa5e](https://github.com/sincely/vite6-electron-vue3/commit/731aa5e72c418137188b8b02e0dc357deeaaafb3))
* 回退版本号并更新CI依赖安装步骤 ([89f9a7c](https://github.com/sincely/vite6-electron-vue3/commit/89f9a7c8898401e34486d82d672754a1606e058b))
* 移除package.json文件末尾的换行符 ([d4833b6](https://github.com/sincely/vite6-electron-vue3/commit/d4833b66c8aa659e4d1455b9d40b452263c7e074))

### 🤖 Continuous Integration

* 为 Windows 和 Linux/macOS 添加单独的清理步骤 ([73014af](https://github.com/sincely/vite6-electron-vue3/commit/73014afdfcb80e863b4179aa4f880e98bb584bb5))
* 使用 npm ci 替换 npm install 并锁定依赖版本 ([0e48ff5](https://github.com/sincely/vite6-electron-vue3/commit/0e48ff5171947df9b8f9c95fd16abb8ce08b977a))
* 修复工作流中的缩进错误 ([44391d7](https://github.com/sincely/vite6-electron-vue3/commit/44391d75a5434a8d6f037ea107e29d8b0d2fb1ae))
* 将 npm ci 替换为 npm install 以解决依赖问题 ([823516c](https://github.com/sincely/vite6-electron-vue3/commit/823516c1604eead40412a622821f04097207e5bb))

* ci: 修复工作流中的缩进错误 (44391d7)
* chore: 回退版本号并更新CI依赖安装步骤 (89f9a7c)
* chore: v0.0.18 (cee3135)
* chore: 回滚版本并更新依赖项 (731aa5e)
* chore: v0.0.18 (0556f76)
* chore: 移除package.json文件末尾的换行符 (d4833b6)
* ci: 使用 npm ci 替换 npm install 并锁定依赖版本 (0e48ff5)
* ci: 将 npm ci 替换为 npm install 以解决依赖问题 (823516c)

* chore: 回滚版本并更新依赖项 (731aa5e)
* chore: v0.0.18 (0556f76)
* chore: 移除package.json文件末尾的换行符 (d4833b6)
* ci: 使用 npm ci 替换 npm install 并锁定依赖版本 (0e48ff5)
* ci: 将 npm ci 替换为 npm install 以解决依赖问题 (823516c)

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
