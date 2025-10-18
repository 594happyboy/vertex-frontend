# 博客系统

一个基于 Vue 3 的个人博客/知识库系统，支持 Markdown 和 PDF 文档管理。

## 功能特性

- ✅ 用户认证（登录/游客模式）
- ✅ 文档分组管理（树形结构）
- ✅ Markdown 编辑器（实时预览）
- ✅ PDF 查看器
- ✅ 文档发布/草稿管理
- ✅ 明暗主题切换
- ✅ 响应式设计

## 技术栈

- **框架**: Vue 3 + Vite
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **HTTP 客户端**: Axios
- **Markdown 渲染**: markdown-it
- **代码高亮**: highlight.js
- **PDF 查看**: pdfjs-dist
- **图标**: @iconify/vue

## 项目结构

```
src/blog/
├── api/              # API 接口封装
│   ├── request.js    # Axios 实例配置
│   ├── auth.js       # 认证相关接口
│   ├── document.js   # 文档管理接口
│   ├── group.js      # 分组管理接口
│   └── file.js       # 文件管理接口
├── components/       # Vue 组件
│   ├── DocTree.vue          # 文档树组件
│   ├── TreeNode.vue         # 树节点组件
│   ├── DocWorkspace.vue     # 文档工作区
│   ├── DocToolbar.vue       # 工具栏
│   ├── MdViewer.vue         # Markdown 查看器
│   ├── MdEditor.vue         # Markdown 编辑器
│   ├── PdfViewer.vue        # PDF 查看器
│   ├── CreateDialog.vue     # 新建对话框
│   └── ToastContainer.vue   # 通知容器
├── router/           # 路由配置
│   └── index.js
├── stores/           # Pinia 状态管理
│   ├── auth.js       # 认证状态
│   ├── tree.js       # 目录树状态
│   ├── doc.js        # 文档状态
│   └── ui.js         # UI 状态
├── styles/           # 样式文件
│   ├── tokens.css    # 设计令牌（CSS 变量）
│   ├── base.css      # 基础样式
│   └── markdown.css  # Markdown 渲染样式
├── views/            # 页面组件
│   ├── LoginView.vue    # 登录页
│   ├── AdminView.vue    # 管理页
│   └── PublicView.vue   # 公开页
└── README.md         # 本文件
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.development` 文件：

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问应用

打开浏览器访问 `http://localhost:5173`

## 使用说明

### 登录

- **用户登录**: 使用用户名和密码登录，拥有完整的管理权限
- **游客访问**: 点击"游客访问"按钮，只能查看已发布的内容（只读模式）

### 文档管理

1. **创建分组**: 点击目录树顶部的 `+` 按钮或右键菜单
2. **创建文档**: 在分组上点击 `+` 按钮，选择创建 Markdown 文档
3. **编辑文档**: 选中文档后点击"编辑"按钮进入编辑模式
4. **保存文档**: 编辑完成后点击"保存"按钮或使用快捷键 `Ctrl/Cmd + S`
5. **发布文档**: 点击"发布"按钮，将文档状态改为已发布（游客可见）

### 快捷键

- `Ctrl/Cmd + S`: 保存文档

### 主题切换

点击顶部栏的主题切换按钮，在明暗主题之间切换。

## API 接口

系统与后端的 RESTful API 进行交互，主要接口包括：

- **认证**: `/api/auth/login`, `/api/auth/visitor`
- **分组**: `/api/groups` (CRUD)
- **文档**: `/api/documents` (CRUD)
- **文件**: `/api/files/upload`, `/api/files/{id}/download`
- **排序**: `/api/sort/groups`, `/api/sort/documents`

详细的 API 文档见 `docs/api-docs.json` (OpenAPI 3.0 格式)

## 状态管理

### authStore

管理用户认证状态、令牌等。

```js
const authStore = useAuthStore();
authStore.login(username, password);
authStore.loginAsVisitor();
authStore.logout();
```

### treeStore

管理完整的目录树状态（包含分组和文档）。

```js
const treeStore = useTreeStore();
// 加载完整目录树（分组 + 文档）
await treeStore.fetchTree();
// 创建分组
await treeStore.createGroup(name, parentId);
// 选中节点
treeStore.selectNode(id, type);
```

### docStore

管理当前文档、编辑状态等。

```js
const docStore = useDocStore();
await docStore.openDoc(id);
await docStore.saveDoc();
await docStore.publishDoc();
docStore.setMode('edit');
```

### uiStore

管理 UI 状态，如主题、通知等。

```js
const uiStore = useUiStore();
uiStore.toggleTheme();
uiStore.showSuccess('操作成功');
uiStore.showError('操作失败');
```

## 样式定制

所有的设计令牌（颜色、间距、字体等）都定义在 `styles/tokens.css` 中，可以根据需要进行定制。

```css
:root {
  --color-primary: #3b82f6;
  --color-text-primary: #1f2937;
  --spacing-md: 16px;
  /* ... */
}
```

## 浏览器兼容性

- Chrome/Edge >= 90
- Firefox >= 88
- Safari >= 14

## 待开发功能

- [ ] 文件导入（上传本地 Markdown/PDF）
- [ ] 导出功能（Markdown 导出为 PDF/HTML）
- [ ] 文档搜索（全文搜索）
- [ ] 标签系统
- [ ] 文档版本历史
- [ ] 拖拽排序
- [ ] 批量操作

## 开发建议

1. 遵循 Vue 3 Composition API 规范
2. 组件保持单一职责
3. 使用 TypeScript（可选，但推荐）
4. 编写单元测试
5. 遵循项目的代码风格

## 许可证

本项目基于 MIT 许可证开源。

