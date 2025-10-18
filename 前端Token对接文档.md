# Vertex Backend - 前端Token对接文档

## 1. 概述

本项目采用**后端自动刷新Token**的设计方案，前端无需主动调用刷新Token接口，大大简化了前端的Token管理逻辑。

### 核心特性

- ✅ **后端自动刷新**：Token即将过期时，后端自动生成新Token并通过响应头返回
- ✅ **前端无感知**：前端只需在每次请求后检查响应头，无需额外的刷新逻辑
- ✅ **用户体验好**：用户活跃使用时Token会自动续期，无需重新登录
- ✅ **降低复杂度**：前端只需简单的Token更新逻辑，无需处理过期检测

---

## 2. Token配置说明

### 后端配置参数

```properties
# Token有效期（默认2小时 = 7200000毫秒）
jwt.expiration=7200000

# Token刷新阈值（默认30分钟 = 1800000毫秒）
# 当Token剩余时间少于此值时，后端会自动刷新并返回新Token
jwt.refresh-threshold=1800000
```

### 工作原理

1. 用户登录成功，获得Token（有效期2小时）
2. 前端在后续请求中携带Token
3. 后端拦截器检查Token状态：
   - **剩余时间 > 30分钟**：正常通过，不做任何处理
   - **剩余时间 ≤ 30分钟**：生成新Token，通过响应头 `X-New-Token` 返回
   - **已过期**：返回401错误，要求重新登录
4. 前端收到响应后，检查是否有新Token，如有则更新本地存储

---

## 3. 前端对接步骤

### 3.1 登录获取Token

**接口地址**：`POST /api/auth/login`

**请求参数**：
```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "nickname": "管理员"
    }
  }
}
```

**前端处理**：
```javascript
// 保存Token到本地存储
localStorage.setItem('token', response.data.accessToken);
```

---

### 3.2 请求中携带Token

在每次API请求的请求头中携带Token：

```javascript
// axios 示例
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// 或在每次请求中携带
axios.get('/api/xxx', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

### 3.3 响应拦截器处理自动刷新

**关键点**：在响应拦截器中检查响应头中的 `X-New-Token`，如果存在则更新本地Token。

#### 方案一：Axios拦截器（推荐）

```javascript
// axios响应拦截器
axios.interceptors.response.use(
  response => {
    // 检查响应头中是否有新Token
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      // 更新本地存储的Token
      localStorage.setItem('token', newToken);
      // 更新axios默认请求头
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      console.log('Token已自动刷新');
    }
    return response;
  },
  error => {
    // 处理401错误，跳转到登录页
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### 方案二：Fetch拦装器

```javascript
// 封装fetch请求
async function fetchWithToken(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
  
  // 检查响应头中是否有新Token
  const newToken = response.headers.get('X-New-Token');
  if (newToken) {
    localStorage.setItem('token', newToken);
    console.log('Token已自动刷新');
  }
  
  // 处理401错误
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  return response;
}
```

---

### 3.4 完整示例（Vue3 + Axios）

```javascript
// src/utils/request.js
import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建axios实例
const request = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从本地存储获取Token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 检查响应头中是否有新Token
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      // 更新本地存储的Token
      localStorage.setItem('token', newToken);
      console.log('Token已自动刷新');
    }
    return response.data;
  },
  error => {
    // 处理401错误
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录');
      localStorage.removeItem('token');
      // 跳转到登录页
      window.location.href = '/login';
    } else {
      ElMessage.error(error.response?.data?.message || '请求失败');
    }
    return Promise.reject(error);
  }
);

export default request;
```

---

### 3.5 完整示例（React + Axios）

```javascript
// src/utils/request.js
import axios from 'axios';
import { message } from 'antd';

// 创建axios实例
const request = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 自动刷新Token
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('token', newToken);
      console.log('Token已自动刷新');
    }
    return response.data;
  },
  error => {
    if (error.response?.status === 401) {
      message.error('登录已过期，请重新登录');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      message.error(error.response?.data?.message || '请求失败');
    }
    return Promise.reject(error);
  }
);

export default request;
```

---

## 4. API接口说明

### 4.1 用户登录

**接口**：`POST /api/auth/login`

**请求参数**：
```json
{
  "username": "string",
  "password": "string"
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "nickname": "管理员"
    }
  }
}
```

---

### 4.2 获取游客Token

**接口**：`POST /api/auth/visitor`

**请求参数**：
```json
{
  "targetUser": "admin"  // 可选，不传则默认第一个用户
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "获取游客令牌成功",
  "data": {
    "visitorToken": "eyJhbGciOiJIUzI1NiJ9...",
    "targetUser": {
      "id": 1,
      "username": "admin",
      "nickname": "管理员"
    }
  }
}
```

---

### 4.3 手动刷新Token（备用接口，一般不需要）

**接口**：`POST /api/auth/refresh`

**说明**：此接口作为备用，正常情况下前端无需调用，后端会自动刷新。

**请求参数**：
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "刷新令牌成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

---

## 5. 常见问题

### Q1: 为什么响应头中没有新Token？

**A**: 只有当Token剩余时间少于30分钟时，后端才会返回新Token。如果Token还很"新鲜"，后端不会频繁生成新Token。

---

### Q2: Token过期后会发生什么？

**A**: 后端会返回401状态码，前端应该：
1. 清除本地存储的Token
2. 跳转到登录页
3. 提示用户重新登录

---

### Q3: 是否需要单独存储刷新Token？

**A**: 不需要。本方案只使用一个accessToken，后端会在合适的时机自动生成新Token并返回。

---

### Q4: 如果前端不处理新Token会怎样？

**A**: 不影响当前请求，但旧Token会在剩余时间耗尽后过期，用户需要重新登录。为了更好的用户体验，建议按文档实现Token自动更新。

---

### Q5: 多个标签页之间Token如何同步？

**A**: 使用localStorage存储Token，多个标签页会共享。但如果一个标签页更新了Token，其他标签页需要在下次请求时才能拿到新Token。可以通过监听storage事件实现实时同步：

```javascript
// 监听storage变化
window.addEventListener('storage', (e) => {
  if (e.key === 'token' && e.newValue) {
    // 更新axios默认请求头
    axios.defaults.headers.common['Authorization'] = `Bearer ${e.newValue}`;
    console.log('Token已同步更新');
  }
});
```

---

## 6. 时序图

```
用户        前端          后端拦截器       后端服务
 |           |               |               |
 | 登录 ---> |               |               |
 |           | POST /login ->|               |
 |           |               | -----------> | 验证用户
 |           |               | <----------- | 返回Token
 |           | <------------ |               |
 |           | 保存Token     |               |
 |           |               |               |
 | 请求 ---> |               |               |
 |           | GET /api/xxx  |               |
 |           | (携带Token)   |               |
 |           | -----------> | 验证Token      |
 |           |               | 检查是否需刷新 |
 |           |               | (剩余<30分钟)  |
 |           |               | 生成新Token    |
 |           | <----------- | 返回数据+新Token|
 |           | 更新本地Token |               |
 | <-------- | 返回数据      |               |
```

---

## 7. 总结

### 前端需要做的事情

1. ✅ 登录时保存Token
2. ✅ 每次请求携带Token
3. ✅ 响应拦截器中检查并更新新Token
4. ✅ 401错误时跳转登录页

### 前端不需要做的事情

1. ❌ 不需要监控Token过期时间
2. ❌ 不需要主动调用刷新接口
3. ❌ 不需要实现复杂的刷新逻辑
4. ❌ 不需要单独存储刷新Token

**这就是后端自动刷新Token的优势：简单、优雅、用户体验好！** 🎉

