# Auth Guard Decision Tree

分析项目中与权限校验相关的核心代码（如 `permission.ts`、`auth.ts` 以及路由拦截器）。

## 流程节点

- 从用户发起页面访问开始，完整画出决策树：登录状态检查 → 角色判断 → 具体权限校验 → 最终通过或拦截

## 分支去向

- 判断节点需写明校验逻辑，拦截分支需清晰标明重定向去向（如跳往 `/login` 或 `/403`）

## 输出

- 保存为 `./docs/auth-guard.svg`

## 扫描策略

1. 读取 `src/permission.js/ts`、`src/directives/permission.js`、`src/utils/auth.js` 等权限文件
2. 读取路由守卫中权限拦截逻辑：`beforeEach` 中的 token 检查、角色判断
3. 读取 store 中用户信息/角色数据
4. 构建决策树：入口 → token 是否存在？ → 角色/权限是否匹配？ → 放行/拦截/重定向
5. 每个判断节点标注判断函数名（如 `hasToken()`、`hasRole('admin')`）
6. 拦截分支标注重定向路径（如 `/login`、`/403`）
