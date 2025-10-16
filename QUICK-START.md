# 🚀 快速启动指南

## 前置要求

- Node.js >= 16.0.0
- npm >= 8.0.0

## 5分钟快速启动

### 1️⃣ 克隆并安装

```bash
# 进入项目目录
cd multifunctional-frontend

# 安装依赖
npm install
```

### 2️⃣ 配置环境变量

创建 `.env.development` 文件：

```bash
# Windows PowerShell
@"
VITE_API_BASE_URL=http://localhost:8080
"@ | Out-File -FilePath .env.development -Encoding utf8

# macOS/Linux
cat > .env.development << EOF
VITE_API_BASE_URL=http://localhost:8080
EOF
```

### 3️⃣ 启动开发服务器

```bash
npm run dev
```

浏览器访问：`http://localhost:5173`

## 📂 项目目录说明

```
src/
├── api/          # API接口封装
├── components/   # 通用组件
├── layouts/      # 布局组件
├── router/       # 路由配置
├── stores/       # 状态管理
├── styles/       # 全局样式
└── views/        # 页面组件
```

## 🎯 核心功能

### 公共端（无需登录）
- 首页：`/`
- 文章详情：`/posts/:slug`
- 归档：`/archive`
- 分组：`/groups`
- 关于：`/about`

### 后台管理（需登录）
- 登录：`/login`
- 仪表盘：`/admin/dashboard`
- 文章管理：`/admin/articles`
- 评论管理：`/admin/comments`
- 分组管理：`/admin/groups`

## 🔐 默认登录信息

> ⚠️ 需要后端API支持，当前为前端演示

```
用户名: admin
密码: admin123
```

## 🛠️ 常用命令

```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 📝 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | 后端API地址 | `http://localhost:8080` |

## ⚠️ 常见问题

### Q: 启动后显示网络错误？
**A**: 检查后端API服务是否启动，或修改 `.env.development` 中的API地址。

### Q: 路径别名 `@` 报错？
**A**: 已在 `vite.config.js` 中配置，重启开发服务器即可。

### Q: 页面空白？
**A**: 
1. 检查浏览器控制台错误
2. 确认依赖安装完整：`npm install`
3. 清除缓存：`npm run dev --force`

### Q: 登录后跳转404？
**A**: 确认路由配置正确，检查 `src/router/index.js`

## 📦 Mock数据（可选）

如果暂无后端API，可以使用Mock数据：

### 方式1: 使用Mock Service Worker (MSW)

```bash
npm install -D msw
```

### 方式2: 直接在Store中返回假数据

修改 `src/stores/article.js`:

```javascript
async fetchArticles() {
  // 临时Mock数据
  this.articles = [
    {
      id: 1,
      title: '示例文章',
      slug: 'example-post',
      summary: '这是一篇示例文章',
      coverUrl: '',
      contentType: 'markdown',
      groupName: '技术分享',
      tags: ['Vue', 'JavaScript'],
      publishTime: new Date().toISOString(),
      views: 100,
      commentCount: 5
    }
  ]
  this.pagination.total = 1
}
```

## 🎨 自定义配置

### 修改站点名称

编辑 `src/components/NavBar.vue`:

```javascript
const siteName = ref('你的博客名称')
```

### 修改主题色

编辑 `src/styles/tokens.css`:

```css
--primary-500: #3F7AFE;  /* 改成你喜欢的颜色 */
```

## 📚 下一步

1. **对接后端API** - 参考 `docs/blog-plan.md`
2. **完善Markdown渲染** - 集成 markdown-it
3. **实现PDF预览** - 集成 pdfjs-dist
4. **添加评论功能** - 完善评论组件

## 🆘 获取帮助

- 查看详细文档：`README-BLOG.md`
- 查看设计文档：`docs/frontend-design.md`
- 查看优化记录：`OPTIMIZATION.md`

---

**祝你开发愉快！** 🎉

