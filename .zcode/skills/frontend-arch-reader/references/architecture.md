# Layered Architecture Diagram

## 分层规范

- 按照【组件层（UI）】、【路由层（Router）】、【状态管理层（Store/Context）】、【API 请求层（Service）】进行分层
- 展现粒度：模块级即可，不要展开具体实现细节，每个模块需标注名称和一句话核心职责
- 基础设施：构建工具、部署方案、CI/CD 等放到一个单独的方框（Infrastructure）里，别展开细节

## 输出

- 保存为 `./docs/frontend-architecture.svg`

## 扫描策略

1. 列出 `src/components/`、`src/views/` 下所有组件/页面 → 归入 **组件层**
2. 读取 `src/router/` 路由配置 → 归入 **路由层**
3. 读取 `src/store/`（Pinia/Vuex）或 `src/contexts/` → 归入 **状态管理层**
4. 读取 `src/api/` 或 `src/services/` → 归入 **API 请求层**
5. 读取 `vite.config.*`、`electron-builder.*`、CI 配置 → 归入 **Infrastructure**
