# API 连接问题排查指南

## 🔍 问题诊断

如果您遇到 "分析服务暂时不可用: Load failed" 错误，这通常是由以下原因造成的：

### 1. CORS（跨域资源共享）问题
**症状**: 浏览器控制台显示 CORS 错误
**原因**: API 服务器没有配置允许跨域访问
**解决方案**:
- 联系 API 服务提供商配置 CORS
- 或使用代理服务器

### 2. 网络连接问题
**症状**: 网络错误或超时
**原因**: API 服务器不可达或网络问题
**解决方案**:
- 检查网络连接
- 确认 API 服务器地址和端口正确
- 检查防火墙设置

### 3. API 服务器问题
**症状**: 服务器返回错误状态码
**原因**: API 服务器内部错误
**解决方案**:
- 联系 API 服务提供商
- 检查 API 密钥是否正确

## 🛠️ 解决方案

### 方案一：使用 CORS 代理（临时解决）

1. **启用代理**:
   编辑 `frontend/src/services/analysisService.js`:
   ```javascript
   const USE_PROXY = true; // 改为 true
   ```

2. **或者使用其他代理服务**:
   ```javascript
   const CORS_PROXY = "https://api.allorigins.win/raw?url=";
   ```

### 方案二：使用浏览器扩展（开发环境）

1. **安装 CORS 扩展**:
   - Chrome: "CORS Unblock" 或 "Allow CORS"
   - Firefox: "CORS Everywhere"

2. **启用扩展**:
   - 在浏览器中启用扩展
   - 刷新页面重试

### 方案三：使用本地代理服务器

1. **创建代理服务器**:
   ```bash
   # 安装 http-server
   npm install -g http-server
   
   # 启动代理服务器
   http-server --cors -p 8080
   ```

2. **修改 API 配置**:
   ```javascript
   const API_CONFIG = {
     host: "localhost",
     port: 8080,
     path: "/proxy/api",
     apiKey: "app-mVIUcAKwMVzhhVHgtGE4Lm1f"
   };
   ```

### 方案四：使用 Vercel 函数（推荐生产环境）

1. **创建 Vercel 函数**:
   在 `frontend/api/proxy.js`:
   ```javascript
   export default async function handler(req, res) {
     const { method, body } = req;
     
     if (method !== 'POST') {
       return res.status(405).json({ error: 'Method not allowed' });
     }
     
     try {
       const response = await fetch('http://221.181.122.58:23007/v1/chat-messages', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${process.env.API_KEY}`,
           'Accept': '*/*'
         },
         body: JSON.stringify(body)
       });
       
       const data = await response.text();
       res.status(200).json({ data });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   }
   ```

2. **修改前端调用**:
   ```javascript
   const response = await fetch('/api/proxy', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json'
     },
     body: JSON.stringify(payload)
   });
   ```

## 🧪 测试步骤

### 1. 使用测试组件
访问 `/api-test` 页面（如果已添加）来测试 API 连接。

### 2. 检查浏览器控制台
打开开发者工具，查看详细的错误信息：
- 网络请求状态
- 错误消息
- 响应内容

### 3. 测试简单请求
```javascript
fetch('http://221.181.122.58:23007/v1/chat-messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer app-mVIUcAKwMVzhhVHgtGE4Lm1f'
  },
  body: JSON.stringify({
    inputs: {},
    query: "测试",
    response_mode: "blocking",
    conversation_id: "",
    user: "abc-123"
  })
})
.then(response => response.text())
.then(data => console.log(data))
.catch(error => console.error(error));
```

## 📞 获取帮助

如果问题仍然存在，请：

1. **收集错误信息**:
   - 浏览器控制台的完整错误信息
   - 网络请求的详细信息
   - 错误发生时的具体操作

2. **联系支持**:
   - API 服务提供商的技术支持
   - 或联系开发团队

## 🔄 临时解决方案

如果急需使用，可以：

1. **使用 Postman 或类似工具**测试 API
2. **使用 Node.js 脚本**调用 API
3. **使用 Python 脚本**调用 API

这些方法可以绕过浏览器的 CORS 限制。 