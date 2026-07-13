# 项目打包体积优化指南

## 已实施的优化方案

### 1. ✅ electron-builder.json5 优化

#### 增强的文件排除规则
- **添加了更多类型的文件排除** (`.tif`, `.tiff` 等图片格式)
- **排除了更多的 git 相关文件** (`.git/**`, `.gitignore`, `.npmignore`)
- **排除了 gsap 的 sourcemap 文件** (`gsap/dist/gsap.map*`)
- **排除了 Element Plus 的文档和类型文件** (`element-plus/docs/**`, `*.d.ts`)
- **排除了 ECharts 的附加库** (`echarts/dist/ecStat/**`)

#### 修复拼写错误
- 将 `election-builder` 修正为 `electron-builder`

#### 优化 ASAR 打包
```json5
"asarUnpack": [
  "**/node_modules/sharp/**",
  "**/node_modules/@img/**"
]
```
- 仅解包必要的库（sharp 用于图片处理）

### 2. ✅ vite.config.js 构建优化

#### Terser 压缩配置增强
```javascript
terserOptions: {
  compress: {
    drop_console: true,           // 删除所有 console 语句
    drop_debugger: true,          // 删除 debugger 语句
    pure_funcs: [...],            // 删除纯函数调用
    passes: 3,                    // 增加到 3 次压缩
    reduce_funcs: true            // 新增：减少函数体积
  },
  mangle: {
    toplevel: true                // 新增：混淆顶级变量名
  },
  format: {
    comments: false               // 移除所有注释
  }
}
```

#### 智能代码分割（Tree-shaking）
```javascript
rollupOptions: {
  treeshake: {
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    moduleSideEffects: false      // 新增：启用更激进的 tree-shaking
  }
}
```

#### 优化的分包策略
- **vue-vendor**: Vue, Vue Router, Pinia 核心库
- **element-plus**: Element Plus 组件库
- **element-icons**: Element Plus 图标库
- **echarts**: ECharts 图表库（新增）
- **utils-vendor**: Axios, Dayjs, Lodash-es
- **gsap**: GSAP 动画库
- **nprogress**: 页面进度条
- **qrcode**: 二维码库（新增）

#### 更精细的资源输出配置
```javascript
assetFileNames(assetInfo) {
  // 按文件类型分类输出
  // 图片 -> images/
  // 字体 -> fonts/
  // CSS  -> css/
  // 其他 -> assets/
}
```

#### 生产构建优化
```javascript
cssCodeSplit: true,               // 启用 CSS 代码分割
assetsInlineLimit: 4096,          // 小于 4KB 内联为 base64
compact: true                     // 压缩生成代码空白字符
```

### 3. ✅ Electron 主进程和 Preload 优化

#### 主进程优化
- 启用 toplevel 变量混淆
- 增加 reduce_funcs 优化
- 启用激进的 tree-shaking

#### Preload 脚本优化
- 同步应用所有压缩策略
- 保持最小化的代码体积

### 4. ✅ 添加构建体积分析工具

#### 新增脚本
- `npm run analyze:size` - 分析构建输出的文件体积
- 所有构建命令现在会自动运行体积分析

#### 分析内容
- 输出 Web 应用包体积
- 输出 Electron 进程包体积
- 显示最大的 10 个 Web 文件
- 显示最大的 5 个 Electron 文件
- 总体积统计

## 预期的体积优化效果

### 估算优化幅度
| 优化项 | 预期优化率 | 说明 |
|------|---------|------|
| Terser passes 3 | 2-5% | 增加压缩次数 |
| Toplevel mangle | 3-7% | 混淆顶级变量 |
| reduce_funcs | 2-4% | 减少函数体积 |
| 激进 tree-shaking | 3-8% | 移除更多死代码 |
| 文件排除 | 5-15% | 从 asar 移除不必要文件 |
| **总体优化** | **15-35%** | 综合效果 |

## 使用建议

### 开发流程
```bash
# 构建并自动分析体积
npm run build-mac:prod

# 或单独分析已构建的文件
npm run analyze:size
```

### 性能检查点
1. **首次构建后** - 记录基线体积
2. **添加新功能后** - 对比体积变化
3. **定期优化** - 监控大型依赖的增长

## 进一步的优化空间

### 1. 依赖优化
```javascript
// 考虑替代方案的库：
- lodash-es → 使用原生方法或 lodash
- gsap → 如果不需要高级动画，可考虑 CSS 动画
- element-plus → 按需加载组件
```

### 2. 资源优化
```javascript
// 图片压缩
// SVG 优化
// 字体子集化
```

### 3. 代码优化
```javascript
// 定期检查未使用的组件
// 移除冗余的样式
// 优化正则表达式
```

## 相关配置文件

### 修改的文件
1. **electron-builder.json5** - 增强的打包排除规则
2. **vite.config.js** - 优化的构建配置
3. **package.json** - 添加体积分析脚本
4. **build/utils/sizeAnalyzer.js** - 新增体积分析工具
5. **scripts/analyze-build-size.js** - 新增分析脚本

## 监控与维护

### 定期检查
- 每次构建后查看输出体积
- 监控最大的文件列表
- 跟踪体积变化趋势

### 性能基准
记录不同构建模式下的体积：
- 开发模式 (dev)
- 测试模式 (test)
- 生产模式 (prod)

---

**最后更新**: 2026年3月26日
**优化版本**: v0.0.13+
