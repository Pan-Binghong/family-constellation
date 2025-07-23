#!/usr/bin/env python3
"""
测试截图处理功能
"""

import requests
import json

def test_screenshot_processing():
    """测试截图处理功能"""
    url = "http://127.0.0.1:5000/test-screenshot"
    
    # 模拟一个简单的base64图片数据（1x1像素的PNG）
    test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    
    data = {
        "screenshot": f"data:image/png;base64,{test_image}"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
    except Exception as e:
        print(f"测试失败: {e}")

if __name__ == "__main__":
    test_screenshot_processing() 