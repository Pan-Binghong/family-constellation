from flask import Flask, request, jsonify
import requests
import os
import openai

app = Flask(__name__)

OPENAI_API_KEY = "sk-lC1Sy1NfZRVpKwQd5mezrDGCxa3Fss7JkL3x4MGMHrD0vVzn"
OPENAI_API_BASE = 'https://api.chatanywhere.tech/v1'
MODEL_NAME = 'gpt-3.5-turbo-ca'
openai.api_key = OPENAI_API_KEY
openai.base_url = OPENAI_API_BASE

@app.route('/', methods=['GET'])
def index():
    return "后端服务已启动，使用 /analyze 进行分析。"

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    description = data.get('description', '')
    prompt = f"你是海灵格家庭排序理论的专家。以下是用户的家庭排列描述：{description}。请根据以下原则分析用户的心理状态和对家庭成员的态度：\n- 每个家庭成员都有归属权。\n- 未解决的过去事件可能影响当前动态。\n- 空间位置反映情感关系（如距离表示疏离，中心表示重要性）。\n提供心理分析和建议。"
    response = openai.ChatCompletion.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500
    )
    result = response['choices'][0]['message']['content']
    return jsonify({'analysis': result})

if __name__ == '__main__':
    app.run(debug=True)
