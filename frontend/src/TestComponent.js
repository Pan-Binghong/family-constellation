import React, { useState, useEffect } from 'react';

const TestComponent = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState('');

  // 监听状态变化
  useEffect(() => {
    console.log('📊 状态更新:', { menuOpen, message });
  }, [menuOpen, message]);

  const handleTestMenu = () => {
    console.log('🔘 测试菜单按钮');
    setMenuOpen(!menuOpen);
    setMessage('菜单状态: ' + (!menuOpen ? '打开' : '关闭'));
  };

  const handleTestRotate = () => {
    console.log('🔄 测试旋转功能');
    try {
      setMessage('旋转功能被调用');
      console.log('✅ 旋转功能测试完成');
    } catch (error) {
      console.error('❌ 旋转功能错误:', error);
      setMessage('旋转功能出错: ' + error.message);
    }
  };

  const handleTestSize = () => {
    console.log('📏 测试大小调整');
    try {
      setMessage('大小调整功能被调用');
      console.log('✅ 大小调整功能测试完成');
    } catch (error) {
      console.error('❌ 大小调整功能错误:', error);
      setMessage('大小调整功能出错: ' + error.message);
    }
  };

  const handleTestDelete = () => {
    console.log('🗑️ 测试删除功能');
    try {
      if (window.confirm('确定要删除吗？')) {
        setMessage('删除功能被调用');
        console.log('✅ 删除功能测试完成');
      } else {
        setMessage('用户取消删除');
        console.log('⚠️ 用户取消删除');
      }
    } catch (error) {
      console.error('❌ 删除功能错误:', error);
      setMessage('删除功能出错: ' + error.message);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'white', 
      border: '2px solid #ccc', 
      padding: '20px',
      borderRadius: '8px',
      zIndex: 10000,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    }}>
      <h3>功能测试面板</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>状态:</strong> {message}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          onClick={handleTestMenu} 
          style={buttonStyle}
          onMouseDown={() => console.log('🔘 菜单按钮按下')}
        >
          🔘 测试菜单按钮
        </button>
        <button 
          onClick={handleTestRotate} 
          style={buttonStyle}
          onMouseDown={() => console.log('🔄 旋转按钮按下')}
        >
          🔄 测试旋转
        </button>
        <button 
          onClick={handleTestSize} 
          style={buttonStyle}
          onMouseDown={() => console.log('📏 大小按钮按下')}
        >
          📏 测试大小调整
        </button>
        <button 
          onClick={handleTestDelete} 
          style={buttonStyle}
          onMouseDown={() => console.log('🗑️ 删除按钮按下')}
        >
          🗑️ 测试删除
        </button>
        
        <button 
          onClick={() => {
            console.log('🧪 直接测试函数调用');
            setMessage('直接函数调用: ' + new Date().toLocaleTimeString());
          }} 
          style={{...buttonStyle, background: '#e3f2fd'}}
        >
          🧪 直接测试
        </button>
        
        <button 
          onClick={() => {
            console.log('🎯 模拟角色功能测试');
            // 模拟角色的onUpdate调用
            const testUpdate = (id, changes) => {
              console.log('🔄 模拟onUpdate被调用:', { id, changes });
              setMessage(`模拟更新: ${JSON.stringify(changes)}`);
            };
            
            // 测试不同的功能
            testUpdate('test-id', { direction: 'east' });
          }} 
          style={{...buttonStyle, background: '#fff3e0'}}
        >
          🎯 模拟角色更新
        </button>
      </div>
      
      {menuOpen && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          background: '#f0f0f0',
          borderRadius: '4px'
        }}>
          菜单已打开! ✅
        </div>
      )}
    </div>
  );
};

const buttonStyle = {
  padding: '8px 12px',
  margin: '2px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  cursor: 'pointer',
  background: 'white'
};

export default TestComponent; 