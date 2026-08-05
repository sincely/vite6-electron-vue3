# Route Flow Diagram

分析路由配置文件（如 `router/index.ts` 或类似路由表定义），梳理全站的页面流转逻辑。

## 节点与连线

- 每个路由页面作为一个节点，箭头指向代表跳转方向，连线上需注明跳转方式（声明式链接、编程式导航或重定向）

## 守卫标注

- 对挂载了路由守卫（BeforeEach / Guards）的路由节点或全局拦截点，使用不同颜色进行高亮区分

## 输出

- 保存为 `./docs/route-flow.svg`

## 扫描策略

1. 读取 `src/router/` 下路由配置文件
2. 提取所有路由记录：path、name、component、redirect、children
3. 提取路由守卫：`beforeEach`、`beforeEnter`、`meta.requiresAuth` 等
4. 找出 `router.push` / `router.replace` 调用 → 编程式导航连线
5. 找出 `<router-link>` / `<a href>` → 声明式链接连线
6. 找出 `redirect` 配置 → 重定向连线
7. 守卫节点用高亮色（如橙色）标注，普通节点用默认色
