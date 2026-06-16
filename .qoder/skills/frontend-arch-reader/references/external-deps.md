# External Dependencies Diagram

综合分析 `package.json`、`.env` 配置文件（如 `.env.production`）和项目文档，梳理该前端项目的所有对外依赖。

## 分类归纳

将所有对外依赖严格划分为以下三类：

- **核心框架与重度依赖**：如 React/Vue 生态、UI 组件库、全局/局部状态管理、图像处理库等
- **中间件与基础设施**：如打包工具 Vite/Webpack、单元测试框架 Vitest、Node/BFF 层、Docker 配置等
- **外部 API 与三方服务**：如大模型 API、客服系统、监控/埋点服务等

## 视觉呈现

- 绘制成一张架构关系图，每一类依赖使用不同的颜色进行高亮区分

## 输出

- 保存为 `./docs/external-deps.svg`

## 扫描策略

1. 读取 `package.json` 的 `dependencies` 和 `devDependencies`
2. 读取 `.env.development`、`.env.production`、`.env.test` 中外部服务 URL/Key
3. 读取项目文档中提到的三方集成
4. 分类归纳：框架生态、构建/测试工具、外部 API 服务
5. 每类用不同色系渲染：核心框架 → 蓝系、基础设施 → 绿系、外部服务 → 紫系
