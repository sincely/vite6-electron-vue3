# Data Model Diagram

深度解析项目中状态管理或上下文定义文件（如 `src/stores` 或 `src/contexts`），分析并梳理核心数据模型。

## 图表内容

- 绘制数据模型关系图，清晰标注每个 Model/Store 的状态字段、核心 Actions 及其数据类型

## 关系映射

- 用线条标出各 Model/Store 之间的引用、组合或派生依赖关系

## 输出

- 保存为 `./docs/data-model.svg`

## 扫描策略

1. 读取 `src/store/` 下所有 Pinia/Vuex store 文件
2. 提取每个 store 的：`state` 字段名 + 类型、`actions` 名称 + 参数类型、`getters` 名称 + 返回类型
3. 查找 store 间交叉引用：一个 store 的 action 调用另一个 store 的 action/state
4. 标注组合关系：store A 的 state 包含 store B 的实例引用
5. 标注派生关系：store A 的 getter 依赖 store B 的 state
