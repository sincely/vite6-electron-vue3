# Router 约定

- 每个子路由使用 `new Router({ prefix })`，在路由内部使用相对路径（如 `/login`）。
- 路由处理链建议顺序：`validateBody` → `authenticate/permissions` → `errorControllerWrapper(controller)`。
- `ApiPrefix` 由环境变量 `API_PREFIX` 控制，在根路由中统一挂载（例如 `/api`），默认空字符串不改变现有路径。

## 模块路由说明

| 模块 | 文件 | 挂载点 | 说明 |
| --- | --- | --- | --- |
| 系统管理 | `systemManageRouter.js` | `routers/index.js` | 角色 / 用户 / 菜单 / 字典 / 公告管理 |
| 站内消息（用户侧） | `notificationRouter.js` → `notificationUserRouter` | `routers/index.js` | 消息列表 / 未读数 / 已读，仅需登录 |
| 站内消息（管理端） | `notificationRouter.js` → `notificationManageRouter` | `systemManageRouter.js` | 公告发送 / 列表 / 删除，需 `/manage/notification` 权限 |
