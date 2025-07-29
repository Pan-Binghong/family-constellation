# 海灵格家庭星座分析系统

基于海灵格家庭排序理论的心理咨询网页模块，允许用户通过拖拽排列家庭成员，并通过AI分析了解心理状态和家庭关系。

## 🌟 项目特色

### ✨ 核心功能
- **可视化家庭排列** - 拖拽式家庭成员排列界面
- **智能性别区分** - 男性显示为方形，女性显示为圆形
- **已故成员标记** - 支持标记已故家庭成员
- **AI心理分析** - 基于海灵格理论的心理状态分析
- **截图增强分析** - 结合视觉信息的深度分析

### 🎯 预设角色
- **直系亲属**：自己、父亲、母亲、丈夫、妻子、儿子、女儿
- **长辈**：祖父、祖母、外祖父、外祖母
- **兄弟姐妹**：哥哥、姐姐、弟弟、妹妹
- **特殊角色**：前任、疾病、金钱、矛盾（三角形显示）

## 🏗️ 技术架构

### 前端技术栈
- **React 18** - 现代化前端框架
- **React DnD** - 拖拽功能实现
- **Three.js** - 3D渲染支持
- **Tailwind CSS** - 响应式样式
- **HTML2Canvas** - 截图功能
- **Axios** - HTTP请求处理

### 后端技术栈
- **Python Flask** - 轻量级Web框架
- **Pillow** - 图像处理
- **Flask-CORS** - 跨域支持
- **Requests** - HTTP客户端

## 🚀 快速开始

### 环境要求
- Node.js 16+
- Python 3.8+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd hailingge
```

2. **启动前端**
```bash
cd frontend
npm install
npm start
```
前端将在 http://localhost:3000 启动

3. **启动后端**
```bash
cd backend
pip install -r requirements.txt
python app.py
```
后端将在 http://127.0.0.1:5000 启动

## 📖 使用指南

### 基本操作流程

1. **添加家庭成员**
   - 点击预设角色按钮快速添加
   - 或手动输入姓名、关系、选择性别
   - 可选择"已故"标记

2. **排列家庭成员**
   - 拖拽家庭成员到画布上的任意位置
   - 调整成员大小和方向
   - 观察成员间的空间关系

3. **获取分析结果**
   - 点击"📸 截图分析"进行视觉分析
   - 点击"🔍 文字分析"进行文本分析
   - 查看AI生成的心理洞察和建议

### 高级功能

- **导出数据** - 保存当前排列配置
- **清空重置** - 重新开始排列
- **旋钮控制** - 鼠标悬停显示旋转和缩放控制

## 🔍 分析原理

### 海灵格家庭排序理论
基于德国心理治疗师伯特·海灵格的理论，通过空间排列揭示家庭系统中的隐藏动态：

- **爱的秩序** - 每个家庭成员都有归属权
- **系统性纠缠** - 未解决的过去事件影响当前关系
- **空间意义** - 位置反映情感关系和家庭地位

### AI分析维度

1. **空间位置分析**
   - 成员间距离和相对位置
   - 中心vs边缘位置的意义
   - 排列模式识别

2. **性别角色分析**
   - 男性成员（方形）排列特点
   - 女性成员（圆形）排列特点
   - 性别角色在家庭系统中的体现

3. **已故成员影响**
   - 已故成员在家庭中的"存在"意义
   - 对生者的情感影响分析

4. **情感关系解读**
   - 通过位置反映的亲疏关系
   - 成员间的连接和分离
   - 情感距离的视觉表现

## 📁 项目结构

```
hailingge/
├── frontend/                 # React前端
│   ├── src/
│   │   ├── App.js           # 主应用组件
│   │   ├── Canvas.js        # 画布组件
│   │   ├── FamilyMember.js  # 家庭成员组件
│   │   └── Canvas3D.js      # 3D画布组件
│   ├── public/
│   └── package.json
├── backend/                  # Python后端
│   ├── app.py               # Flask应用
│   ├── test_screenshot.py   # 截图测试
│   └── requirements.txt
├── README.md                # 项目说明
└── FamilyConstellationModuleDesign.markdown  # 详细设计文档
```

## 🔧 API接口

### POST /analyze
主要分析端点，支持两种模式：

#### 仅文字分析
```json
{
  "description": "父亲（张三）位于(100, 100)，母亲（李四）位于(200, 200)..."
}
```

#### 截图增强分析
```json
{
  "description": "父亲（张三）位于(100, 100)，母亲（李四）位于(200, 200)...",
  "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
}
```

## ⚠️ 重要声明

### 免责声明
- 本工具仅供心理探索和辅助分析使用
- 分析结果仅供参考，不构成专业心理诊断
- 如有心理困扰，请咨询专业心理治疗师

### 理论争议
海灵格理论在心理学界存在争议，涉及：
- 科学验证性问题
- 文化适应性差异
- 伦理考量

建议用户理性对待分析结果，结合专业咨询使用。

## 🛠️ 开发说明

### 前端开发
```bash
cd frontend
npm install
npm start
```

### 后端开发
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 测试
```bash
# 后端测试
cd backend
python test_screenshot.py
```

## 📈 未来规划

- [ ] 多语言支持
- [ ] 移动端适配
- [ ] 社区功能
- [ ] 个性化分析
- [ ] 数据可视化增强
- [ ] 专业治疗师对接

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

## 📄 许可证

本项目采用MIT许可证。

## 📚 参考资料

- [Family Constellations - Wikipedia](https://en.wikipedia.org/wiki/Family_Constellations)
- [Bert Hellinger and Family Constellations](https://www.thecsc.net/bert-hellinger-family-constellations-and-the-phenomenon-of-surrogate-perception/)
- [Family Constellation - Hellinger](https://www.hellinger.com/en/family-constellation/)

---

**注意**：本工具旨在提供心理探索的辅助功能，请结合专业心理咨询使用，确保心理健康安全。
