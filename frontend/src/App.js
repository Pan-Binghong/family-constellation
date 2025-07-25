import React, { useState, useEffect, useRef, useCallback } from 'react';
import Canvas from './Canvas';
import TestComponent from './TestComponent';
import axios from 'axios';

// 动态计算画布尺寸的Hook
const useCanvasSize = () => {
  const getCanvasSize = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    return {
      width: viewportWidth,
      height: Math.min(viewportHeight * 0.4, 500)
    };
  }, []);

  const [canvasSize, setCanvasSize] = useState(getCanvasSize());

  useEffect(() => {
    let resizeTimeout;
    
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      resizeTimeout = setTimeout(() => {
        setCanvasSize(getCanvasSize());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [getCanvasSize]);

  return canvasSize;
};

const PRESET_ROLES = [
  { role: '祖父', icon: '👴', shape: 'square' },
  { role: '祖母', icon: '👵', shape: 'circle' },
  { role: '外祖父', icon: '👴', shape: 'square' },  
  { role: '外祖母', icon: '👵', shape: 'circle' },
  { role: '丈夫', icon: '👨', shape: 'square' },
  { role: '妻子', icon: '👩', shape: 'circle' },
  { role: '儿子', icon: '👦', shape: 'square' },
  { role: '女儿', icon: '👧', shape: 'circle' },
  { role: '姐姐', icon: '👩‍🦰', shape: 'circle' },
  { role: '哥哥', icon: '🧑‍🦱', shape: 'square' },
  { role: '弟弟', icon: '🧑‍🎓', shape: 'square' },
  { role: '妹妹', icon: '👧', shape: 'circle' },
  { role: '前任', icon: '💔', shape: 'square' },
  { role: 'unknown', icon: '❓', shape: 'triangle' },
];

// 定义直系亲属角色
const IMMEDIATE_FAMILY_ROLES = ['丈夫', '妻子', '儿子', '女儿'];

export default function App() {
  // 使用动态画布尺寸Hook
  const canvasSize = useCanvasSize();
  
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('members');
    return saved ? JSON.parse(saved) : [];
  });
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [icon, setIcon] = useState('🧑');
  const [shape, setShape] = useState('square');
  const [isDeceased, setIsDeceased] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragCompleted, setDragCompleted] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('members', JSON.stringify(members));
  }, [members]);

  const addMember = () => {
    if (!name || !role) {
      alert('请填写姓名和关系。');
      return;
    }

    const isImmediateFamilyRole = IMMEDIATE_FAMILY_ROLES.includes(role);
    const hasImmediateFamily = members.some(member => IMMEDIATE_FAMILY_ROLES.includes(member.role));

    // 强制先添加直系亲属
    if (!hasImmediateFamily && !isImmediateFamilyRole) {
      alert('请先添加至少一位直系亲属（如：丈夫、妻子、儿子、女儿）。');
      return;
    }

    const isChild = role.includes('儿子') || role.includes('女儿');
    const defaultSize = isChild ? 48 : 72;
    setMembers([
      ...members,
      {
        id: Date.now(),
        name,
        role,
        icon,
        shape,
        isDeceased,
        x: 100,
        y: 100,
        direction: 'north', // 初始朝向
        width: defaultSize,
        height: defaultSize
      }
    ]);
    setName('');
    setRole('');
    setIcon('🧑');
    setShape('square');
    setIsDeceased(false);
  };

  const quickAdd = preset => {
    setRole(preset.role);
    setIcon(preset.icon);
    setShape(preset.shape);
    setName('');
  };

  const onUpdateMember = (id, changes) => {
    console.log('📝 onUpdateMember 被调用:', { id, changes });
    if (changes.delete) {
      // 删除成员
      console.log('🗑️ 执行删除成员:', id);
      setMembers(members => members.filter(m => m.id !== id));
    } else {
      // 更新成员
      console.log('✏️ 执行更新成员:', { id, changes });
      setMembers(members => members.map(m => {
        if (m.id === id) {
          console.log('📝 找到并更新成员:', m.name);
          return { ...m, ...changes };
        }
        return m;
      }));
    }
  };

  const generateDescription = () => {
    return members.map(m => {
      const status = m.isDeceased ? '（已故）' : '';
      return `${m.name}（${m.role}）${status}位于(${m.x}, ${m.y})，朝向${m.direction}`;
    }).join('，');
  };

  const analyze = async () => {
    setLoading(true);
    setAnalysis('');
    try {
      const description = generateDescription();
      const res = await axios.post('http://127.0.0.1:5000/analyze', { description });
      setAnalysis(res.data.analysis);
    } catch {
      setAnalysis('⚠️ 分析失败，请稍后重试。');
    }
    setLoading(false);
  };

  const clearMembers = () => {
    setMembers([]);
    setAnalysis('');
    setDragCompleted(false);
  };

  const captureCanvas = async () => {
    if (!canvasRef.current) return null; 
    
    try {
      // 动态导入html2canvas
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#f8fafc',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('截图失败:', error);
      return null;
    }
  };

  const handleDragComplete = async () => {
    setDragCompleted(true);
    setLoading(true);
    setAnalysis('');
    
    try {
      const screenshot = await captureCanvas();
      if (!screenshot) {
        setAnalysis('⚠️ 截图失败，请稍后重试。');
        return;
      }
      
      const res = await axios.post('http://127.0.0.1:5000/analyze', { 
        screenshot 
      });
      setAnalysis(res.data.analysis);
    } catch (error) {
      console.error('分析失败:', error);
      setAnalysis('⚠️ 分析失败，请稍后重试。');
    }
    
    setLoading(false);
  };

  const updateMemberPosition = (id, x, y) => {
    const CANVAS_WIDTH = canvasSize.width;
    const CANVAS_HEIGHT = canvasSize.height;
    
    setMembers(members => {
      const updatedMembers = members.map(m => {
        if (m.id === id) {
          const memberWidth = m.width || 72;
          const memberHeight = m.height || 72;
          
          // 强制边界检查
          const safeX = Math.max(0, Math.min(x, CANVAS_WIDTH - memberWidth));
          const safeY = Math.max(0, Math.min(y, CANVAS_HEIGHT - memberHeight));
          
          console.log('💾 更新成员位置:', {
            成员名: m.name,
            更新前: { x: m.x, y: m.y },
            请求更新: { x, y },
            最终更新: { x: safeX, y: safeY },
            '🛡️ 边界保护': {
              x修正: x !== safeX ? `${x} -> ${safeX}` : '无需修正',
              y修正: y !== safeY ? `${y} -> ${safeY}` : '无需修正'
            }
          });
          
          return { ...m, x: safeX, y: safeY };
        }
        return m;
      });
      return updatedMembers;
    });
  };

  // 验证和修正成员坐标的函数
  const validateAndFixMemberPositions = useCallback(() => {
    const CANVAS_WIDTH = canvasSize.width;
    const CANVAS_HEIGHT = canvasSize.height;
    
    setMembers(currentMembers => {
      const fixedMembers = currentMembers.map(member => {
        const memberWidth = member.width || 72;
        const memberHeight = member.height || 72;
        
        // 检查坐标是否超出边界
        const needsFix = 
          member.x < 0 || 
          member.x > CANVAS_WIDTH - memberWidth || 
          member.y < 0 || 
          member.y > CANVAS_HEIGHT - memberHeight;
          
        if (needsFix) {
          const fixedX = Math.max(0, Math.min(member.x, CANVAS_WIDTH - memberWidth));
          const fixedY = Math.max(0, Math.min(member.y, CANVAS_HEIGHT - memberHeight));
          
          console.log('🔧 修正成员坐标:', {
            成员: member.name,
            原坐标: { x: member.x, y: member.y },
            修正后: { x: fixedX, y: fixedY }
          });
          
          return { ...member, x: fixedX, y: fixedY };
        }
        
        return member;
      });
      
      return fixedMembers;
    });
  }, [canvasSize]);

  // 重置所有成员到安全位置的函数
  const resetMemberPositions = useCallback(() => {
    setMembers(currentMembers => {
      const resetMembers = currentMembers.map((member, index) => {
        // 计算安全的初始位置，避免重叠
        const startX = 100;
        const startY = 100;
        const spacing = 100;
        const cols = Math.floor((canvasSize.width - 200) / spacing); // 画布宽度内能放几列
        
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        const newX = startX + col * spacing;
        const newY = startY + row * spacing;
        
        console.log('🔄 重置成员位置:', {
          成员: member.name,
          原位置: { x: member.x, y: member.y },
          新位置: { x: newX, y: newY }
        });
        
        return { ...member, x: newX, y: newY };
      });
      
      return resetMembers;
    });
  }, [canvasSize]);

  // 在组件加载时验证坐标
  useEffect(() => {
    if (members.length > 0) {
      validateAndFixMemberPositions();
    }
  }, []); // 只在组件挂载时运行一次

  // 导出成员数据
  const exportMembersData = () => {
    if (members.length === 0) {
      alert('没有成员数据可以导出。');
      return;
    }
    const dataStr = JSON.stringify(members, null, 2); // 美化 JSON 格式
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'family_members_data.json'; // 导出文件名
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // 释放 URL 对象
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* 主要内容区域 - 上下布局 */}
      <div className="flex flex-col h-screen">
        {/* 顶部：画布区域 - 占满页面宽度 */}
        <div className="w-full">
          <Canvas 
            ref={canvasRef}
            members={members} 
            updateMemberPosition={updateMemberPosition} 
            onUpdateMember={onUpdateMember}
          />
        </div>
        
        {/* 底部：控制面板 */}
        <div className="flex-1 bg-white shadow-2xl p-6 border-t border-blue-100 overflow-y-auto">
          {/* 标题 */}
          <h1 className="text-3xl font-bold text-blue-700 text-center mb-4 drop-shadow-sm">家庭成员排列分析</h1>
          
          {/* 画布尺寸指示器 */}
          <div className="text-center mb-4 p-2 bg-blue-100 rounded-lg">
            <span className="text-sm font-medium text-blue-700">
              画布尺寸: {canvasSize.width} × {canvasSize.height} px
            </span>
          </div>
          
          {/* 表单区域 */}
          <div className="bg-blue-50 border border-blue-200 rounded-3xl shadow-lg p-6 mb-6">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {PRESET_ROLES.map(preset => (
                <button
                  key={preset.role}
                  onClick={() => quickAdd(preset)}
                  className="bg-blue-100 hover:bg-blue-300 text-blue-800 px-3 py-1 rounded-xl text-sm font-bold flex items-center gap-1 border border-blue-300 shadow-sm transition-transform hover:scale-105"
                >
                  <span className="text-lg">{preset.icon}</span>{preset.role}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 items-center justify-center mb-4">
              <input
                className="border-2 border-blue-300 p-3 text-lg rounded-xl w-full sm:w-48 focus:outline-none focus:border-blue-500 transition shadow bg-white font-bold"
                placeholder="姓名"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <input
                className="border-2 border-blue-300 p-3 text-lg rounded-xl w-full sm:w-48 focus:outline-none focus:border-blue-500 transition shadow bg-white font-bold"
                placeholder="关系"
                value={role}
                onChange={e => setRole(e.target.value)}
              />
              <select
                className="border-2 border-blue-300 p-3 text-xl rounded-xl bg-white shadow focus:outline-none focus:border-blue-500 transition font-bold"
                value={icon}
                onChange={e => setIcon(e.target.value)}
              >
                {PRESET_ROLES.map(preset => (
                  <option key={preset.role} value={preset.icon} className="text-lg font-bold">{preset.icon}</option>
                ))}
              </select>
              <select
                className="border-2 border-blue-300 p-3 text-sm rounded-xl bg-white shadow focus:outline-none focus:border-blue-500 transition font-bold"
                value={shape}
                onChange={e => setShape(e.target.value)}
              >
                <option value="square">方形</option>
                <option value="circle">圆形</option>
                <option value="triangle">三角形</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDeceased"
                  checked={isDeceased}
                  onChange={e => setIsDeceased(e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isDeceased" className="text-sm font-bold text-gray-700">
                  已故
                </label>
              </div>
              <button
                onClick={addMember}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg font-extrabold shadow-md transition-transform hover:scale-105"
              >
                添加成员
              </button>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <button
              onClick={handleDragComplete}
              disabled={loading || members.length === 0 || dragCompleted}
              className={`px-6 py-2 font-bold rounded-xl shadow-md transition-all ${
                loading || members.length === 0 || dragCompleted
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white hover:scale-105'
              }`}
            >
              {loading ? '分析中...' : dragCompleted ? '✅ 已完成' : '📸 截图分析'}
            </button>
            <button
              onClick={analyze}
              disabled={loading || members.length === 0}
              className={`px-6 py-2 font-bold rounded-xl shadow-md transition-all ${
                loading || members.length === 0
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white hover:scale-105'
              }`}
            >
              {loading ? '分析中...' : '🔍 文字分析'}
            </button>
            <button
              onClick={exportMembersData}
              disabled={members.length === 0}
              className="bg-white border border-green-300 text-green-700 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-green-100 transition hover:scale-105 disabled:opacity-50"
            >
              ⬇️ 导出数据
            </button>
            <button
              onClick={validateAndFixMemberPositions}
              disabled={members.length === 0}
              className="bg-white border border-yellow-300 text-yellow-700 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-yellow-100 transition hover:scale-105 disabled:opacity-50"
            >
              🔧 修正坐标
            </button>
            <button
              onClick={resetMemberPositions}
              disabled={members.length === 0}
              className="bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-blue-100 transition hover:scale-105 disabled:opacity-50"
            >
              🔄 重置位置
            </button>
            <button
              onClick={() => {
                console.log('🔍 当前成员详细位置信息:');
                members.forEach(member => {
                  const element = document.querySelector(`[data-member-id="${member.id}"]`);
                  const canvas = document.getElementById('canvas-area');
                  if (element && canvas) {
                    const memberRect = element.getBoundingClientRect();
                    const canvasRect = canvas.getBoundingClientRect();
                    console.log(`📍 ${member.name}:`, {
                      存储坐标: { x: member.x, y: member.y },
                      实际相对画布位置: {
                        x: memberRect.left - canvasRect.left,
                        y: memberRect.top - canvasRect.top
                      },
                      边框修正后位置: {
                        x: memberRect.left - canvasRect.left - 4,
                        y: memberRect.top - canvasRect.top - 4
                      },
                      差异: {
                        x: member.x - (memberRect.left - canvasRect.left - 4),
                        y: member.y - (memberRect.top - canvasRect.top - 4)
                      }
                    });
                  }
                });
              }}
              disabled={members.length === 0}
              className="bg-white border border-purple-300 text-purple-700 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-purple-100 transition hover:scale-105 disabled:opacity-50"
            >
              🔍 调试坐标
            </button>
            <button
              onClick={clearMembers}
              disabled={members.length === 0}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-gray-100 transition hover:scale-105 disabled:opacity-50"
            >
              🧹 清空
            </button>
          </div>
          
          {/* 分析结果展示 */}
          {analysis && (
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-2xl shadow-inner">
              <div className="text-lg font-bold text-blue-700 mb-3">🧠 分析结果：</div>
              <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                {analysis}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 测试组件 */}
      {process.env.NODE_ENV === 'development' && <TestComponent />}
    </div>
  );
}