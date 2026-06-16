# Module Dependency Topology

## 分析规则

- 扫描所有源文件中的内部导入语句（基于 tsconfig paths 别名）
- 下钻到子模块粒度（取别名后两级路径），合并无出度的叶子节点
- 节点数控制在 10~20，每个节点标注模块名 + 一句话职责
- 构建邻接表，DFS 检测双向边和最小环，标注循环引用计数
- 循环依赖用红色加粗虚线高亮，底部附上统计概要和循环对详情

## 输出

- `./docs/module-deps.svg`

## 扫描策略

1. 读取 `tsconfig.json` / `jsconfig.json` 中的 `paths` 别名映射
2. 遍历 `src/` 下所有 `.js/.ts/.vue/.mjs` 文件，提取 `import` / `require` 语句
3. 将导入路径按别名拆为两级：如 `@/store/app` → `store/app`
4. 合并无出度叶子到其父级或相关模块，使节点数落在 10–20
5. 构建邻接表，DFS 查找双向边和最小环
6. 统计循环引用总数，列出每条循环对的模块名
