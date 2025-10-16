# 个人博客前端项目

基于 Vue 3 + Vite 构建的现代化个人博客系统前端部分。

## 🎯 项目概述

这是一个功能完整的博客前端应用，采用现代化的设计系统和组件化架构。

### 主要特性

- ✅ **现代化设计**：玻璃拟态、柔和渐变、精美动画
- ✅ **响应式布局**：完美适配桌面端（≥768px）和移动端（<768px）
- ✅ **公共端**：首页、文章详情、归档、分组、关于页
- ✅ **后台管理**：登录、仪表盘、文章管理、分组管理、评论管理
- ✅ **状态管理**：Pinia 实现全局状态
- ✅ **路由守卫**：自动认证和权限控制
- ✅ **组件库**：可复用的基础组件（Button, Input, Pagination, Tag等）

## 📁 项目结构

```
src/
├── api/                    # API 接口
│   ├── auth.js            # 认证接口
│   ├── article.js         # 文章接口
│   ├── comment.js         # 评论接口
│   ├── group.js           # 分组接口
│   └── dashboard.js       # 仪表盘接口
├── components/            # 组件
│   ├── base/             # 基础组件
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── BasePagination.vue
│   │   └── BaseTag.vue
│   ├── ArticleCard.vue   # 文章卡片
│   ├── NavBar.vue        # 导航栏
│   └── Footer.vue        # 页脚
├── layouts/              # 布局组件
│   ├── PublicLayout.vue  # 公共端布局
│   └── AdminLayout.vue   # 后台布局
├── router/               # 路由配置
│   └── index.js
├── stores/               # 状态管理
│   ├── auth.js          # 认证状态
│   ├── article.js       # 文章状态
│   ├── group.js         # 分组状态
│   └── comment.js       # 评论状态
├── styles/              # 样式
│   └── tokens.css       # 设计系统变量
├── views/               # 页面组件
│   ├── HomeView.vue     # 首页
│   ├── PostDetailView.vue  # 文章详情
│   ├── ArchiveView.vue  # 归档页
│   ├── GroupsView.vue   # 分组列表
│   ├── GroupDetailView.vue  # 分组详情
│   ├── AboutView.vue    # 关于页
│   ├── LoginView.vue    # 登录页
│   ├── NotFoundView.vue # 404页面
│   └── admin/           # 后台页面
│       ├── DashboardView.vue
│       ├── ArticlesManageView.vue
│       ├── ArticleEditView.vue
│       ├── GroupsManageView.vue
│       └── CommentsManageView.vue
├── App.vue
└── main.js
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env.development` 文件：

```bash
# 开发环境配置
VITE_API_BASE_URL=http://localhost:8080
```

在项目根目录创建 `.env.production` 文件：

```bash
# 生产环境配置
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将运行在 `http://localhost:5173`

### 4. 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录

## 🎨 设计系统

### 色彩体系

- **主色**：`#3F7AFE`（科技蓝）
- **辅助色**：`#FF8D6B`（活力橙）
- **成功色**：`#10B981`
- **警告色**：`#F59E0B`
- **错误色**：`#EF4444`

### 断点系统

- **桌面端**：≥768px
- **移动端**：<768px

### 组件规范

所有基础组件都支持：
- 多种变体（primary, secondary, ghost等）
- 多种尺寸（sm, md, lg）
- 加载状态
- 禁用状态

## 📋 功能清单

### 公共端

- [x] 导航栏（支持暗色模式切换）
- [x] 首页（Hero区 + 文章网格 + 侧边栏）
- [x] 文章详情页
- [x] 归档页（按年份/月份展示）
- [x] 分组列表页
- [x] 分组详情页
- [x] 关于页
- [x] 404页面
- [x] 响应式适配

### 后台管理

- [x] 登录页
- [x] 仪表盘（统计卡片）
- [x] 侧边栏导航
- [x] 文章管理（占位）
- [x] 文章编辑器（占位）
- [x] 分组管理（占位）
- [x] 评论管理（占位）
- [x] 文件管理（完整功能，用于上传文章封面、PDF等）
- [x] 路由守卫

## 🔧 技术栈

- **框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **路由**：Vue Router 4
- **状态管理**：Pinia
- **HTTP客户端**：Axios
- **日期处理**：dayjs
- **Markdown**：markdown-it (待集成)
- **代码高亮**：highlight.js (待集成)
- **PDF预览**：pdfjs-dist (待集成)

## 📝 待完成功能

### 高优先级

1. **Markdown 渲染器**
   - 集成 markdown-it
   - 代码高亮
   - 图片懒加载
   - 目录生成

2. **PDF 预览**
   - 集成 pdfjs-dist
   - 页码控制
   - 缩放功能

3. **评论系统**
   - 评论列表组件
   - 评论表单
   - 实时提交

4. **后台功能完善**
   - 文章列表（表格/卡片）
   - 富文本编辑器
   - 图片上传
   - 文章发布流程

### 中优先级

5. **搜索功能**
   - 全局搜索
   - 搜索结果页
   - 关键词高亮

6. **性能优化**
   - 图片懒加载
   - 路由懒加载优化
   - 虚拟滚动（长列表）

7. **用户体验**
   - 骨架屏
   - 加载动画
   - 错误边界
   - Toast 提示

### 低优先级

8. **PWA 支持**
   - Service Worker
   - 离线缓存
   - 安装提示

9. **国际化**
   - i18n 集成
   - 多语言支持

## 🌐 API 对接

### 配置说明

所有 API 调用都已封装，自动处理：
- ✅ **Token注入**: 自动从 localStorage 读取并添加到请求头
- ✅ **错误处理**: 401错误自动跳转登录页
- ✅ **统一响应**: 自动解析响应数据

### 配置步骤

1. **设置API地址**: 在 `.env.development` 或 `.env.production` 中配置
   ```bash
   VITE_API_BASE_URL=http://localhost:8080
   ```

2. **后端接口要求**:
   - 返回格式：`{ code: 200, data: {...}, message: "..." }`
   - 认证方式：`Authorization: Bearer <token>`
   - 状态码：401表示未认证

### API 示例

```javascript
// 获取文章列表
import { getArticles } from '@/api/article'

const res = await getArticles({
  page: 1,
  size: 10,
  groupId: 1
})
```

## 📚 参考文档

- [设计文档](./docs/frontend-design.md) - 完整的前端设计方案
- [后端接口文档](./docs/blog-plan.md) - 后端API设计

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**最后更新**：2025-10-16

