// API 配置 - 支持多个模型
const API_CONFIGS = {
  qwen3: {
    type: "nginx_proxy",
    path: "/family/api/model/completions",
    model: "qwen3"
  },
  chatanywhere: {
    type: "direct_api",
    baseURL: "https://api.chatanywhere.tech/v1",
    apiKey: "sk-lC1Sy1NfZRVpKwQd5mezrDGCxa3Fss7JkL3x4MGMHrD0vVzn",
    model: "gpt-4o-ca"
  }
};

// 默认使用的模型
const DEFAULT_MODEL = "chatanywhere";

/**
 * 将家庭成员JSON列表转为适合大模型分析的文本描述
 */
function membersToDescription(members) {
  if (!members || members.length === 0) {
    return "无家庭成员数据。";
  }
  
  const lines = members.map(m => {
    const deceased = m.isDeceased ? "已故" : "未故";
    
    // 兼容两种格式：shape字段和gender字段
    let gender, shape;
    if (m.shape) {
      gender = m.shape === "square" ? "男" : "女";
      shape = m.shape === "square" ? "方形" : m.shape === "circle" ? "圆形" : m.shape;
    } else {
      gender = m.gender === "male" ? "男" : m.gender === "female" ? "女" : "未知";
      shape = m.gender === "male" ? "方形" : m.gender === "female" ? "圆形" : "未知";
    }
    
    const direction = m.direction || "无";
    const size = `${m.width || 0}x${m.height || 0}`;
    
    return `${m.role || "未知"}（${m.name || "未知"}, ${gender}, ${shape}, ${deceased}），位于(${m.x || 0}, ${m.y || 0})，朝向${direction}，尺寸${size}`;
  });
  
  return lines.join("；") + "。";
}

/**
 * 构建分析提示词
 */
function buildPrompt(description) {
  return `# 家庭系统排列分析师 Prompt

## 角色定义
你是一位专业的家庭系统排列分析师，精通伯特·海灵格的系统排列疗法。你的任务是解读用户创建的家庭成员空间排列，从中洞察其内心世界和家庭动态。

## 分析框架

### 核心要素识别
- **成员识别**：提取所有家庭成员标签及其空间位置信息
- **空间关系**：分析距离、朝向、分组和层级关系
- **情感动态**：推断心理状态和关系模式

### 距离关系解读

**近距离**
- 象征：强烈情感联结、亲密关系、相互支持
- 警示：过度接近可能暗示界限不清或共生依赖

**远距离** 
- 象征：情感疏离、隔阂、未解决冲突
- 特殊情况：小体型人物摆放很远或倒下，暗示深层怨恨

**适中距离**
- 象征：健康的联结与独立性平衡

### 朝向关系解读

**面向彼此**
- 通常：开放、接纳、沟通意愿
- 特殊：前任面对面放置可能暗示怨恨情绪

**背对彼此**
- 通常：回避、忽视、冲突或未解决问题
- 特殊：背对可能暗示外遇或死亡但有隔阂

### 关键排列模式

#### 健康家庭模型
丈夫妻子肩并肩，孩子站在前方中间；长辈分别站在相应子女身后，所有人朝向一致。

#### 领导关系
- 丈夫领导：妻子在丈夫左手边
- 妻子领导：丈夫在妻子左手边

#### 支持关系
支持者站在被支持者后方，朝向一致

#### 问题模式
- 中心位置放置父亲：可能存在不当的情感替代
- 自我放置角落：可能存在自毁倾向
- 疾病的不同位置：反映对疾病的不同态度

## 分析步骤

1. **成员与空间信息提取**
   - 识别所有家庭成员
   - 记录位置、距离、朝向信息

2. **关系模式分析**
   - 按距离、朝向、分组进行系统分析
   - 识别权力结构和情感流向

3. **心理状态推断**
   - 结合排列模式推断当前心理状态
   - 解读对特定成员的情感态度
   - 识别潜在的家族动力和创伤

4. **结果呈现**
   - 使用温暖、非评判的语言
   - 避免绝对化判断和医学诊断
   - 承认分析局限性并提供建设性建议

## 专业准则

- **适度推断**：基于模式推断，非确定诊断  
- **文化敏感**：尊重多元背景差异

## 输出要求

直接输出心理解读内容，无需任何前置说明、标题或格式符号，以自然文字形式呈现分析结果。

---

**输入格式**：${description}

**输出**：基于上述框架的深度心理解读`;
}

/**
 * 过滤思考内容，只保留最终答案
 */
function filterThinkingContent(text) {
  if (!text) return text;
  
  // 移除 <think> 标签及其内容
  let filteredText = text.replace(/<think>.*?<\/think>/gis, '');
  
  // 移除其他常见的思考模式标记
  const thinkingPatterns = [
    /好的，我现在需要处理.*?(?=\n\n|\n[A-Z]|\n[一二三四五六七八九十]|\n\d+\.)/gi,
    /首先，我需要.*?(?=\n\n|\n[A-Z]|\n[一二三四五六七八九十]|\n\d+\.)/gi,
    /接下来.*?(?=\n\n|\n[A-Z]|\n[一二三四五六七八九十]|\n\d+\.)/gi,
    /需要结合.*?(?=\n\n|\n[A-Z]|\n[一二三四五六七八九十]|\n\d+\.)/gi,
    /同时，要注意.*?(?=\n\n|\n[A-Z]|\n[一二三四五六七八九十]|\n\d+\.)/gi,
    /建议用户.*?(?=\n\n|\n[A-Z]|\n[一二三四五六七八九十]|\n\d+\.)/gi,
  ];
  
  // 移除所有思考内容
  thinkingPatterns.forEach(pattern => {
    filteredText = filteredText.replace(pattern, '');
  });
  
  // 移除多余的空行
  filteredText = filteredText.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // 移除开头的空行和多余符号
  filteredText = filteredText.replace(/^[\s\*\-\_]+/, '');
  filteredText = filteredText.trim();
  
  // 如果过滤后内容为空，返回原始内容
  if (!filteredText) {
    return text;
  }
  
  return filteredText;
}

/**
 * 调用 API 进行分析
 */
async function callAnalysisAPI(prompt, modelName = DEFAULT_MODEL) {
  try {
    const config = API_CONFIGS[modelName];
    if (!config) {
      throw new Error(`不支持的模型: ${modelName}`);
    }

    const payload = {
      model: config.model,
      messages: [
        {
          role: "system",
          content: "你是一个专业的家庭系统排列分析师，基于伯特·海灵格的家庭系统排列疗法原则进行分析。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 40960,
      temperature: 0.7,
      stream: false
    };

    let headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Connection': 'keep-alive'
    };

    let url;
    
    // 根据配置类型处理不同的API调用方式
    if (config.type === "nginx_proxy") {
      // nginx反向代理方式
      url = config.path;
      headers['User-Agent'] = 'Apifox/1.0.0 (https://apifox.com)';
    } else if (config.type === "direct_api") {
      // 直接API调用方式
      url = `${config.baseURL}/chat/completions`;
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    } else {
      throw new Error(`不支持的API类型: ${config.type}`);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API请求失败，状态码: ${response.status}`);
    }

    const result = await response.json();

    // 解析响应
    let rawText = "";
    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];
      if (choice.message && choice.message.content) {
        rawText = choice.message.content;
      } else if (choice.text) {
        rawText = choice.text;
      }
    } else if (result.text) {
      rawText = result.text;
    } else {
      throw new Error(`API响应格式异常: ${JSON.stringify(result)}`);
    }

    // 过滤思考内容
    return filterThinkingContent(rawText);

  } catch (error) {
    console.error('API调用失败:', error);
    throw new Error(`分析服务暂时不可用: ${error.message}`);
  }
}

/**
 * 分析家庭成员排列
 */
export async function analyzeFamilyMembers(members, modelName = DEFAULT_MODEL) {
  try {
    // 生成描述
    const description = membersToDescription(members);
    
    // 构建提示词
    const prompt = buildPrompt(description);
    
    // 调用 API
    const analysis = await callAnalysisAPI(prompt, modelName);
    
    return {
      success: true,
      description: description,
      analysis: analysis,
      model: modelName
    };
    
  } catch (error) {
    console.error('分析失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
} 