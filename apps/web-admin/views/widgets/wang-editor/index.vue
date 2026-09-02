<!-- 组件中心 - 富文本编辑器 -->
<template>
  <div class="wang-editor-page">
    <PageHeader
      title="富文本编辑器"
      subtitle="基于 wangEditor，支持完整/简化工具栏与内容实时预览"
      icon="edit"
    />

    <!-- 完整工具栏编辑器 -->
    <ElCard class="editor-card">
      <template #header>
        <div class="card-header">
          <span>🛠️ 完整工具栏编辑器</span>
          <div class="header-buttons">
            <ElButton size="small" @click="clearFullEditor">清空</ElButton>
            <ElButton size="small" @click="getFullEditorContent">
              获取内容
            </ElButton>
            <ElButton size="small" @click="setFullEditorDemo">
              设置示例
            </ElButton>
          </div>
        </div>
      </template>

      <WangEditor
        ref="fullEditorRef"
        v-model="fullEditorHtml"
        height="400px"
        placeholder="请输入内容，体验完整的编辑功能..."
        :exclude-keys="[]"
      />
    </ElCard>

    <!-- 简化工具栏编辑器 -->
    <ElCard class="editor-card">
      <template #header>
        <div class="card-header">
          <span>✨ 简化工具栏编辑器</span>
          <div class="header-buttons">
            <ElButton size="small" @click="clearSimpleEditor">清空</ElButton>
            <ElButton size="small" @click="getSimpleEditorContent">
              获取内容
            </ElButton>
            <ElButton size="small" @click="setSimpleEditorDemo">
              设置示例
            </ElButton>
          </div>
        </div>
      </template>

      <WangEditor
        ref="simpleEditorRef"
        v-model="simpleEditorHtml"
        height="400px"
        placeholder="请输入内容，体验简化的编辑功能..."
        :toolbar-keys="simpleToolbarKeys"
      />
    </ElCard>

    <!-- 内容对比预览 -->
    <ElCard class="preview-card">
      <template #header>
        <span>📖 内容预览对比</span>
      </template>

      <ElRow :gutter="20">
        <ElCol :xs="24" :md="12" class="preview-col">
          <h3>完整编辑器内容</h3>
          <ElTabs v-model="fullActiveTab">
            <ElTabPane label="渲染效果" name="preview">
              <div class="content-preview" v-html="fullEditorHtml"></div>
            </ElTabPane>
            <ElTabPane label="HTML源码" name="html">
              <ElInput
                v-model="fullEditorHtml"
                type="textarea"
                :rows="8"
                placeholder="HTML源码"
                readonly
              />
            </ElTabPane>
          </ElTabs>
        </ElCol>

        <ElCol :xs="24" :md="12" class="preview-col">
          <h3>简化编辑器内容</h3>
          <ElTabs v-model="simpleActiveTab">
            <ElTabPane label="渲染效果" name="preview">
              <div class="content-preview" v-html="simpleEditorHtml"></div>
            </ElTabPane>
            <ElTabPane label="HTML源码" name="html">
              <ElInput
                v-model="simpleEditorHtml"
                type="textarea"
                :rows="8"
                placeholder="HTML源码"
                readonly
              />
            </ElTabPane>
          </ElTabs>
        </ElCol>
      </ElRow>
    </ElCard>

    <!-- 使用说明 -->
    <ElCard class="usage-card">
      <template #header>
        <span>📚 使用说明</span>
      </template>

      <ElCollapse v-model="activeCollapse">
        <ElCollapseItem title="基础用法" name="basic">
          <pre><code>&lt;template&gt;
  &lt;WangEditor v-model="content" /&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref } from 'vue'

const content = ref('&lt;p&gt;初始内容&lt;/p&gt;')
&lt;/script&gt;</code></pre>
        </ElCollapseItem>

        <ElCollapseItem title="完整工具栏配置" name="full">
          <pre><code>&lt;!-- 显示所有工具，不排除任何功能 --&gt;
&lt;WangEditor
  v-model="content"
  :exclude-keys="[]"
/&gt;</code></pre>
        </ElCollapseItem>

        <ElCollapseItem title="简化工具栏配置" name="simple">
          <pre><code>&lt;!-- 只显示基础编辑工具 --&gt;
&lt;WangEditor
  v-model="content"
  :toolbar-keys="[
    'bold', 'italic', 'underline', '|',
    'bulletedList', 'numberedList', '|',
    'insertLink', 'insertImage', '|',
    'undo', 'redo'
  ]"
/&gt;</code></pre>
        </ElCollapseItem>

        <ElCollapseItem title="自定义配置" name="config">
          <pre><code>&lt;WangEditor
  v-model="content"
  height="600px"
  placeholder="请输入您的内容..."
  :exclude-keys="['fontFamily', 'fontSize']"
  :upload-config="{
    maxFileSize: 5 * 1024 * 1024,
    maxNumberOfFiles: 5
  }"
/&gt;</code></pre>
        </ElCollapseItem>

        <ElCollapseItem title="组件方法调用" name="methods">
          <pre><code>&lt;template&gt;
  &lt;WangEditor ref="editorRef" v-model="content" /&gt;
  &lt;ElButton @click="handleClear"&gt;清空&lt;/ElButton&gt;
  &lt;ElButton @click="handleFocus"&gt;聚焦&lt;/ElButton&gt;
  &lt;ElButton @click="handleGetContent"&gt;获取内容&lt;/ElButton&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref } from 'vue'

const editorRef = ref()
const content = ref('')

const handleClear = () =&gt; {
  editorRef.value?.clear()
}

const handleFocus = () =&gt; {
  editorRef.value?.focus()
}

const handleGetContent = () =&gt; {
  const html = editorRef.value?.getHtml()
  console.log('编辑器内容:', html)
}
&lt;/script&gt;</code></pre>
        </ElCollapseItem>

        <ElCollapseItem title="工具栏配置说明" name="toolbar-config">
          <div class="toolbar-explanation">
            <h4>完整工具栏 vs 简化工具栏</h4>
            <ElRow :gutter="16">
              <ElCol :xs="24" :md="12">
                <h5>✅ 完整工具栏包含：</h5>
                <ul>
                  <li>文本格式：加粗、斜体、下划线、字体颜色、背景色</li>
                  <li>段落格式：标题、引用、对齐方式、缩进</li>
                  <li>列表：有序列表、无序列表、待办事项</li>
                  <li>插入：链接、图片、表格、分割线、表情</li>
                  <li>代码：代码块、行内代码</li>
                  <li>操作：撤销、重做、全屏、清除格式</li>
                </ul>
              </ElCol>
              <ElCol :xs="24" :md="12">
                <h5>⚡ 简化工具栏包含：</h5>
                <ul>
                  <li>基础格式：加粗、斜体、下划线</li>
                  <li>列表：有序列表、无序列表</li>
                  <li>插入：链接、图片</li>
                  <li>操作：撤销、重做</li>
                </ul>
                <p class="note">适用于简单的文本编辑场景，界面更清爽。</p>
              </ElCol>
            </ElRow>
            <p class="note">
              桌面端无图片上传服务器，编辑器内插入的图片会转为 base64 内嵌存储。
            </p>
          </div>
        </ElCollapseItem>
      </ElCollapse>
    </ElCard>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

defineOptions({ name: 'WidgetsWangEditor' })

const fullEditorRef = ref()
const simpleEditorRef = ref()
const fullActiveTab = ref('preview')
const simpleActiveTab = ref('preview')
const activeCollapse = ref(['basic'])

/**
 * 简化工具栏配置
 * 只包含基础的编辑功能
 */
const simpleToolbarKeys = [
  'bold',
  'italic',
  'underline',
  '|',
  'bulletedList',
  'numberedList',
  '|',
  'insertLink',
  'insertImage',
  '|',
  'undo',
  'redo'
]

// 完整编辑器内容
const fullEditorHtml = ref(`<h1>🎨 完整工具栏编辑器示例</h1>
<p>这个编辑器包含所有功能，您可以体验丰富的格式编辑功能。</p>

<h2>✨ 文本样式</h2>
<p><strong>这是加粗的文字</strong></p>
<p><em>这是斜体文字</em></p>
<p><u>这是下划线文字</u></p>
<p><span style="color: rgb(194, 79, 74);">这是彩色文字</span></p>

<h2>📝 列表和待办</h2>
<ul>
  <li>无序列表项 1</li>
  <li>无序列表项 2</li>
</ul>

<ol>
  <li>有序列表项 1</li>
  <li>有序列表项 2</li>
</ol>

<h2>💬 引用和表格</h2>
<blockquote>
  这是一段引用文字，展示引用格式的效果。
</blockquote>

<table style="border-collapse: collapse; width: 100%;" border="1">
  <thead>
    <tr><th>功能</th><th>描述</th></tr>
  </thead>
  <tbody>
    <tr><td>完整工具栏</td><td>包含所有编辑功能</td></tr>
    <tr><td>自定义配置</td><td>支持灵活的工具栏配置</td></tr>
  </tbody>
</table>

<p>🔗 <a href="https://www.wangeditor.com/" target="_blank">访问官网了解更多</a></p>`)

// 简化编辑器内容
const simpleEditorHtml = ref(`<h1>✨ 简化工具栏编辑器示例</h1>
<p>这个编辑器只包含基础的编辑功能，界面更加简洁。</p>

<h2>基础文本格式</h2>
<p><strong>加粗文字</strong></p>
<p><em>斜体文字</em></p>
<p><u>下划线文字</u></p>

<h2>列表功能</h2>
<ul>
  <li>无序列表项 1</li>
  <li>无序列表项 2</li>
</ul>

<ol>
  <li>有序列表项 1</li>
  <li>有序列表项 2</li>
</ol>

<h2>链接和图片</h2>
<p>支持插入 <a href="https://www.wangeditor.com/" target="_blank">链接</a> 和图片。</p>

<p>简化版编辑器专注于基础功能，适合简单的内容编辑需求。</p>`)

/**
 * 清空完整编辑器内容
 */
const clearFullEditor = () => {
  fullEditorRef.value?.clear()
  ElMessage.success('完整编辑器已清空')
}

/**
 * 获取完整编辑器内容
 */
const getFullEditorContent = () => {
  const content = fullEditorRef.value?.getHtml()
  console.log('完整编辑器内容:', content)
  ElMessage.success('完整编辑器内容已输出到控制台')
}

/**
 * 设置完整编辑器演示内容
 */
const setFullEditorDemo = () => {
  const demoContent = `<h2>🎉 完整编辑器演示内容</h2>
<p>这是通过方法设置的演示内容，展示完整编辑器的强大功能。</p>
<ul>
  <li>支持丰富的文本格式</li>
  <li>包含表格等高级功能</li>
  <li>提供完整的编辑体验</li>
</ul>
<table style="border-collapse: collapse; width: 100%;" border="1">
  <tr><th>特性</th><th>状态</th></tr>
  <tr><td>完整工具栏</td><td>✅ 已启用</td></tr>
  <tr><td>高级功能</td><td>✅ 已启用</td></tr>
</table>`

  fullEditorRef.value?.setHtml(demoContent)
  ElMessage.success('已设置完整编辑器演示内容')
}

/**
 * 清空简化编辑器内容
 */
const clearSimpleEditor = () => {
  simpleEditorRef.value?.clear()
  ElMessage.success('简化编辑器已清空')
}

/**
 * 获取简化编辑器内容
 */
const getSimpleEditorContent = () => {
  const content = simpleEditorRef.value?.getHtml()
  console.log('简化编辑器内容:', content)
  ElMessage.success('简化编辑器内容已输出到控制台')
}

/**
 * 设置简化编辑器演示内容
 */
const setSimpleEditorDemo = () => {
  const demoContent = `<h2>⚡ 简化编辑器演示内容</h2>
<p>这是通过方法设置的演示内容，展示简化编辑器的核心功能。</p>
<ul>
  <li><strong>基础格式</strong>：加粗、斜体、下划线</li>
  <li><em>列表支持</em>：有序和无序列表</li>
  <li><u>媒体插入</u>：链接和图片</li>
</ul>
<ol>
  <li>界面简洁清爽</li>
  <li>功能专注实用</li>
  <li>适合快速编辑</li>
</ol>
<p>🔗 <a href="https://www.wangeditor.com/" target="_blank">这是一个链接示例</a></p>`

  simpleEditorRef.value?.setHtml(demoContent)
  ElMessage.success('已设置简化编辑器演示内容')
}
</script>

<style lang="scss" scoped>
.wang-editor-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.editor-card {
  margin-bottom: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-buttons {
  display: flex;
  gap: 8px;
}

.preview-card {
  margin-bottom: 8px;

  h3 {
    margin: 0 0 16px;
    font-size: 16px;
    color: var(--color-text-primary);
  }
}

.preview-col {
  margin-bottom: 16px;
}

.content-preview {
  min-height: 200px;
  max-height: 300px;
  padding: 16px;
  overflow-y: auto;
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);

  :deep(h1),
  :deep(h2),
  :deep(h3) {
    margin: 16px 0 8px;
  }

  :deep(p) {
    margin: 8px 0;
    line-height: 1.6;
  }

  :deep(table) {
    margin: 16px 0;
  }

  :deep(table th),
  :deep(table td) {
    padding: 8px 12px;
  }

  :deep(blockquote) {
    padding-left: 16px;
    margin: 16px 0;
    color: var(--color-text-secondary);
    border-left: 4px solid var(--color-primary);
  }
}

.usage-card {
  :deep(.el-collapse-item__content) {
    padding-bottom: 16px;
  }

  pre {
    padding: 16px;
    margin: 0;
    overflow-x: auto;
    background-color: var(--color-bg-input);
    border-radius: var(--radius-sm);

    code {
      font-family: Consolas, Monaco, 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.5;
    }
  }
}

.toolbar-explanation {
  h4 {
    margin: 0 0 16px;
    color: var(--color-text-primary);
  }

  h5 {
    margin: 0 0 8px;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  ul {
    padding-left: 20px;
    margin: 8px 0 16px;

    li {
      margin: 4px 0;
      font-size: 13px;
      color: var(--color-text-secondary);
    }
  }

  .note {
    margin: 8px 0 0;
    font-size: 12px;
    font-style: italic;
    color: var(--color-text-muted);
  }
}
</style>
