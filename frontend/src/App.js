import React, { useState, useEffect, useRef } from 'react';
import Canvas from './Canvas';
import axios from 'axios';

const PRESET_ROLES = [
  { role: '自己', icon: '🧑' },
  { role: '父亲', icon: '👨' },
  { role: '母亲', icon: '👩' },
  { role: '丈夫', icon: '👨' },
  { role: '妻子', icon: '👩' },
  { role: '儿子', icon: '👦' },
  { role: '女儿', icon: '👧' },
  { role: '孩子', icon: '🧒' },
  { role: '祖父', icon: '👴' },
  { role: '祖母', icon: '👵' },
  { role: '配偶', icon: '💑' },
  { role: '哥哥', icon: '🧑‍🦱' },
  { role: '姐姐', icon: '👩‍🦰' },
  { role: '弟弟', icon: '🧑‍🎓' },
  { role: '妹妹', icon: '👧' },
  { role: '继父', icon: '🧔' },
  { role: '继母', icon: '👩‍🦳' },
  { role: '养父', icon: '🧓' },
  { role: '养母', icon: '👵' },
  { role: '朋友', icon: '🤝' },
  { role: '宠物', icon: '🐶' },
];

export default function App() {
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('members');
    return saved ? JSON.parse(saved) : [];
  });
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [icon, setIcon] = useState('🧑');
  const [isDeceased, setIsDeceased] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragCompleted, setDragCompleted] = useState(false);
  const canvasRef = useRef(null);
  const [gender, setGender] = useState('');

  useEffect(() => {
    localStorage.setItem('members', JSON.stringify(members));
  }, [members]);

  const addMember = () => {
    if (!name || !role || !gender) return;
    const isChild = role.includes('儿子') || role.includes('女儿') || role.includes('孩子');
    const defaultSize = isChild ? 48 : 72;
    setMembers([
      ...members,
      {
        id: Date.now(),
        name,
        role,
        icon,
        isDeceased,
        gender,
        x: 100,
        y: 100,
        direction: 'up',
        width: defaultSize,
        height: defaultSize
      }
    ]);
    setName('');
    setRole('');
    setIcon('🧑');
    setIsDeceased(false);
    setGender('');
  };

  const quickAdd = preset => {
    setRole(preset.role);
    setIcon(preset.icon);
    setName('');
  };

  const onUpdateMember = (id, changes) => {
    setMembers(members => members.map(m => m.id === id ? { ...m, ...changes } : m));
  };

  const generateDescription = () => {
    return members.map(m => {
      const status = m.isDeceased ? '（已故）' : '';
      return `${m.name}（${m.role}）${status}位于(${m.x}, ${m.y})`;
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
    if (!canvasRef.current) return;
    
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
    setMembers(members => members.map(m => (m.id === id ? { ...m, x, y } : m)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-6 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-blue-100">
        <h1 className="text-4xl font-bold text-blue-700 text-center mb-6 drop-shadow-sm">家庭成员排列分析</h1>
        {/* 表单区域美化 */}
        <div className="bg-blue-50 border border-blue-200 rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {PRESET_ROLES.map(preset => (
              <button
                key={preset.role}
                onClick={() => quickAdd(preset)}
                className="bg-blue-100 hover:bg-blue-300 text-blue-800 px-4 py-2 rounded-2xl text-2xl font-bold flex items-center gap-1 border border-blue-300 shadow-sm transition-transform hover:scale-105"
              >
                <span className="text-3xl">{preset.icon}</span>{preset.role}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-6 items-center justify-center mb-4">
            <input
              className="border-2 border-blue-300 p-6 text-2xl rounded-2xl w-full sm:w-96 focus:outline-none focus:border-blue-500 transition shadow bg-white font-bold"
              placeholder="姓名"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input
              className="border-2 border-blue-300 p-6 text-2xl rounded-2xl w-full sm:w-96 focus:outline-none focus:border-blue-500 transition shadow bg-white font-bold"
              placeholder="关系"
              value={role}
              onChange={e => setRole(e.target.value)}
            />
            <select
              className="border-2 border-blue-300 p-6 text-3xl rounded-2xl bg-white shadow focus:outline-none focus:border-blue-500 transition font-bold"
              value={icon}
              onChange={e => setIcon(e.target.value)}
            >
              {PRESET_ROLES.map(preset => (
                <option key={preset.role} value={preset.icon} className="text-2xl font-bold">{preset.icon}</option>
              ))}
            </select>
            {/* 性别选择 */}
            <select
              className="border-2 border-blue-300 p-6 text-xl rounded-2xl bg-white shadow focus:outline-none focus:border-blue-500 transition font-bold"
              value={gender}
              onChange={e => setGender(e.target.value)}
            >
              <option value="">选择性别</option>
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDeceased"
                checked={isDeceased}
                onChange={e => setIsDeceased(e.target.checked)}
                className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isDeceased" className="text-xl font-bold text-gray-700">
                已故
              </label>
            </div>
            <button
              onClick={addMember}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl text-2xl font-extrabold shadow-md transition-transform hover:scale-105"
            >
              添加成员
            </button>
          </div>
        </div>
        {/* 画布区域放在表单下方，宽大高矮 */}
        <div className="flex justify-center">
          <Canvas 
            ref={canvasRef}
            members={members} 
            updateMemberPosition={updateMemberPosition} 
            onUpdateMember={onUpdateMember}
          />
        </div>
        {/* 操作按钮 */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleDragComplete}
            disabled={loading || members.length === 0 || dragCompleted}
            className={`px-8 py-3 font-bold rounded-xl shadow-md transition-all ${
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
            className={`px-8 py-3 font-bold rounded-xl shadow-md transition-all ${
              loading || members.length === 0
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white hover:scale-105'
            }`}
          >
            {loading ? '分析中...' : '🔍 文字分析'}
          </button>
          <button
            onClick={clearMembers}
            disabled={members.length === 0}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-xl font-medium shadow-sm hover:bg-gray-100 transition hover:scale-105 disabled:opacity-50"
          >
            🧹 清空
          </button>
        </div>
        {/* 分析结果展示 */}
        {analysis && (
          <div className="mt-10 p-6 bg-blue-50 border border-blue-200 rounded-2xl shadow-inner">
            <div className="text-lg font-bold text-blue-700 mb-3">🧠 分析结果：</div>
            <div className="text-gray-800 leading-relaxed whitespace-pre-line">
              {analysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}