from flask import Flask, request, jsonify
import requests
import os
import openai
import base64
import io
from PIL import Image
import json

app = Flask(__name__)

OPENAI_API_KEY = "sk-lC1Sy1NfZRVpKwQd5mezrDGCxa3Fss7JkL3x4MGMHrD0vVzn"
OPENAI_API_BASE = 'https://api.chatanywhere.tech/v1'
MODEL_NAME = 'gpt-4o'
openai.api_key = OPENAI_API_KEY
openai.base_url = OPENAI_API_BASE

@app.route('/', methods=['GET'])
def index():
    return "后端服务已启动，使用 /analyze 进行分析。"
@app.route('/test-screenshot', methods=['POST'])
def test_screenshot():
    """测试截图处理功能"""
    data = request.json
    screenshot = data.get('screenshot', '')
    
    if not screenshot:
        return jsonify({'error': '没有提供截图数据'}), 400
    
    result = process_screenshot(screenshot)
    return jsonify(result)

def process_screenshot(screenshot_data):
    """处理截图数据，提取有用信息"""
    try:
        # 移除data:image/png;base64,前缀
        if screenshot_data.startswith('data:image'):
            screenshot_data = screenshot_data.split(',')[1]
        
        # 解码base64数据
        image_data = base64.b64decode(screenshot_data)
        
        # 简单返回成功，不进行图片处理
        return {
            'width': 'unknown',
            'height': 'unknown',
            'format': 'PNG',
            'mode': 'RGB',
            'success': True
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

@app.route('/analyze', methods=['POST', 'OPTIONS'])
def analyze():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
        
    data = request.json
    description = data.get('description', '')
    screenshot = data.get('screenshot', '')
    
    # 处理截图信息
    screenshot_info = ""
    if screenshot:
        screenshot_analysis = process_screenshot(screenshot)
        if screenshot_analysis['success']:
            screenshot_info = f"""
截图信息：
- 画布尺寸：{screenshot_analysis['width']} x {screenshot_analysis['height']} 像素
- 图片格式：{screenshot_analysis['format']}
- 颜色模式：{screenshot_analysis['mode']}

截图分析要点：
1. 画布布局：白色背景，网格图案，黑色边框
2. 成员卡片：男性方框，女性圆框，已故成员有灰色叉号
3. 空间关系：通过成员位置反映家庭关系
4. 视觉元素：emoji图标、姓名、角色标签
"""
        else:
            screenshot_info = f"截图处理失败：{screenshot_analysis['error']}"
    
    if screenshot:
        # 有截图时，使用更详细的分析
        prompt = f"""你是海灵格家庭排序理论的专家。用户提供了家庭排列的截图和详细描述。

{screenshot_info}

文字描述：{description}

请根据以下原则进行深入分析：

1. 空间位置分析：
   - 成员之间的距离和相对位置
   - 中心位置vs边缘位置的意义
   - 成员间的排列模式（直线、三角形、分散等）

2. 性别区分分析：
   - 男性成员（方框）的排列特点
   - 女性成员（圆框）的排列特点
   - 性别角色在家庭系统中的体现

3. 已故成员影响：
   - 灰色叉号标记的成员对系统的影响
   - 已故成员在家庭中的"存在"意义
   - 对生者的情感影响

4. 情感关系解读：
   - 通过位置反映的亲疏关系
   - 成员间的连接和分离
   - 情感距离的视觉表现

5. 家庭系统平衡：
   - 是否存在缺失的成员
   - 是否有重复或排除的成员
   - 系统的完整性和平衡性

请提供结构化的分析报告：
📊 空间关系分析
💭 情感动态解读  
⚖️ 系统平衡评估
💡 具体建议和改善方向
🎯 家庭和谐的关键点"""
    else:
        # 仅文字描述时的分析
        prompt = f"你是海灵格家庭排序理论的专家。以下是用户的家庭排列描述：{description}。请根据以下原则分析用户的心理状态和对家庭成员的态度：\n- 每个家庭成员都有归属权。\n- 未解决的过去事件可能影响当前动态。\n- 空间位置反映情感关系（如距离表示疏离，中心表示重要性）。\n提供心理分析和建议。"
    
    try:
        response = openai.ChatCompletion.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000
        )
        result = response['choices'][0]['message']['content']
        response_json = jsonify({'analysis': result})
        response_json.headers.add('Access-Control-Allow-Origin', '*')
        return response_json
    except Exception as e:
        error_response = jsonify({'analysis': f'分析失败：{str(e)}'})
        error_response.headers.add('Access-Control-Allow-Origin', '*')
        return error_response, 500

if __name__ == '__main__':
    app.run(debug=True)
