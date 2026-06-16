# Component Lifecycle & Async Timeline

针对项目中的核心组件，绘制其从挂载到卸载的完整生命周期及异步执行时序图。

## 关键节点

- 必须包含 Props 更新、useEffect/watch 执行顺序、Suspense 挂起状态、ErrorBoundary 错误捕获以及组件 lazy load 异步加载的时机

## 执行流

- 清晰标出各个阶段的触发条件，以及副作用（Side Effects）的执行先后顺序

## 输出

- 保存为 `./docs/lifecycle-<组件名>.svg`

## 扫描策略

1. 用户指定组件名
2. 读取组件源码，提取生命周期钩子：`onMounted`、`onUpdated`、`onUnmounted`、`watch`、`watchEffect`、`computed`
3. 提取异步操作：API 调用、定时器、事件监听注册/销毁
4. 提取 Props 定义 + watch 监听
5. 查找 lazy load / Suspense 包装
6. 查找 ErrorBoundary 使用
7. 构建时序图：挂载 → setup → onMounted → watch 触发 → onUpdated → onUnmounted
8. 标注每步触发条件和副作用名称
