# State Flow Diagram

深度解析指定组件/页面的源码，提取其中控制核心交互的所有状态变量。

## 覆盖流转

- 完整绘制状态流转图，必须覆盖 idle、loading、success、error 等核心状态及边缘异常分支

## 触发条件

- 在每一次状态转换的连线上，明确标注触发该流转的动作或事件名称

## 输出

- 保存为 `./docs/state-<组件名>.svg`

## 扫描策略

1. 用户指定组件名或页面名
2. 读取该组件的 `ref` / `reactive` / `data()` 定义，提取所有状态变量
3. 识别状态转换点：事件 handler → 状态赋值、API 调用 → then/catch → 状态赋值
4. 构建状态机图：idle → loading → success / error，以及边缘分支（timeout、cancel、retry 等）
5. 每条转换边标注触发动作名（如 `handleSubmit`、`onApiSuccess`、`onError`）
