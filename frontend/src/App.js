import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Brain, Download, Trash2, Sparkles } from 'lucide-react';
import Canvas from './Canvas';
import { analyzeFamilyMembers } from './services/analysisService';

// Modern UI Components
import Button from './components/ui/Button';
import Input, { Select } from './components/ui/Input';
import Card from './components/ui/Card';
import Loading from './components/ui/Loading';
import ErrorMessage from './components/ui/ErrorMessage';
import MarkdownRenderer from './components/ui/MarkdownRenderer';

// 动态计算画布尺寸的Hook
const useCanvasSize = () => {
  const getCanvasSize = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    return {
      width: viewportWidth * 1.0,
      height: Math.min(viewportHeight * 0.7, 900)
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
  { role: '自己', icon: '🧑', gender: 'male' },
  { role: '父亲', icon: '👨', gender: 'male' },
  { role: '母亲', icon: '👩', gender: 'female' },
  { role: '祖父', icon: '👴', gender: 'male' },
  { role: '祖母', icon: '👵', gender: 'female' },
  { role: '外祖父', icon: '👴', gender: 'male' },
  { role: '外祖母', icon: '👵', gender: 'female' },
  { role: '丈夫', icon: '👨', gender: 'male' },
  { role: '妻子', icon: '👩', gender: 'female' },
  { role: '儿子', icon: '👦', gender: 'male' },
  { role: '女儿', icon: '👧', gender: 'female' },
  { role: '姐姐', icon: '👩‍🦰', gender: 'female' },
  { role: '哥哥', icon: '🧑‍🦱', gender: 'male' },
  { role: '弟弟', icon: '🧑‍🎓', gender: 'male' },
  { role: '妹妹', icon: '👧', gender: 'female' },
  { role: '前任', icon: '💔', gender: 'male' },
  { role: '疾病', icon: '🏥', gender: 'male', shape: 'triangle' },
  { role: '金钱', icon: '💰', gender: 'male', shape: 'triangle' },
  { role: '矛盾', icon: '⚔️', gender: 'male', shape: 'triangle' },
];

// 定义直系亲属角色
const IMMEDIATE_FAMILY_ROLES = ['自己', '父亲', '母亲', '丈夫', '妻子', '儿子', '女儿'];

export default function App() {
  // 使用动态画布尺寸Hook
  const canvasSize = useCanvasSize();
  
  // 画布引用
  const canvasRef = useRef(null);
  
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('members');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [icon, setIcon] = useState('🧑');
  const [gender, setGender] = useState('male');
  const [isDeceased, setIsDeceased] = useState(false);
  
  // App states
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragCompleted, setDragCompleted] = useState(false);
  const [error, setError] = useState(null);
  
  // Form validation states
  const [nameError, setNameError] = useState('');
  const [roleError, setRoleError] = useState('');

  useEffect(() => {
    localStorage.setItem('members', JSON.stringify(members));
  }, [members]);

  const validateForm = () => {
    let hasErrors = false;
    setNameError('');
    setRoleError('');
    
    if (!name.trim()) {
      setNameError('请输入姓名');
      hasErrors = true;
    }
    
    if (!role.trim()) {
      setRoleError('请选择或输入关系');
      hasErrors = true;
    }
    
    return !hasErrors;
  };

  const addMember = () => {
    if (!validateForm()) {
      return;
    }

    const isImmediateFamilyRole = IMMEDIATE_FAMILY_ROLES.includes(role);
    const hasImmediateFamily = members.some(member => IMMEDIATE_FAMILY_ROLES.includes(member.role));

    // 强制先添加直系亲属
    if (!hasImmediateFamily && !isImmediateFamilyRole) {
      setError({
        type: 'warning',
        title: '需要直系亲属',
        message: '请先添加至少一位直系亲属（如：丈夫、妻子、儿子、女儿）。'
      });
      return;
    }

    const isChild = role.includes('儿子') || role.includes('女儿');
    const defaultSize = isChild ? 48 : 72;
    
    // 获取预设角色的特殊形状
    const presetRole = PRESET_ROLES.find(p => p.role === role);
    const specialShape = presetRole?.shape;
    
    setMembers([
      ...members,
      {
        id: Date.now(),
        name,
        role,
        icon,
        gender,
        shape: specialShape,
        isDeceased,
        x: 100,
        y: 100,
        direction: 'north',
        width: defaultSize,
        height: defaultSize
      }
    ]);
    
    // Reset form
    setName('');
    setRole('');
    setIcon('🧑');
    setGender('male');
    setIsDeceased(false);
    setNameError('');
    setRoleError('');
    setError(null);
  };

  const quickAdd = preset => {
    setRole(preset.role);
    setIcon(preset.icon);
    setGender(preset.gender);
    setName('');
  };

  const onUpdateMember = (id, changes) => {
    if (changes.delete) {
      setMembers(members => members.filter(m => m.id !== id));
    } else {
      setMembers(members => members.map(m => {
        if (m.id === id) {
          return { ...m, ...changes };
        }
        return m;
      }));
    }
  };

  const analyze = async () => {
    if (members.length === 0) {
      setError({
        type: 'warning',
        title: '无数据',
        message: '请先添加家庭成员。'
      });
      return;
    }
    
    setLoading(true);
    setAnalysis('');
    setError(null);
    
    try {
      const exportData = {
        members: members.map(member => ({
          id: member.id,
          name: member.name,
          role: member.role,
          icon: member.icon,
          gender: member.gender,
          isDeceased: member.isDeceased,
          x: member.x,
          y: member.y,
          direction: member.direction,
          width: member.width,
          height: member.height
        }))
      };
      
      const result = await analyzeFamilyMembers(exportData.members);
      if (result.success) {
        setAnalysis(result.analysis);
      } else {
        setError({
          type: 'error',
          title: '分析失败',
          message: result.error || '未知错误'
        });
      }
    } catch (error) {
      console.error('分析请求失败:', error);
      setError({
        type: 'error',
        title: '网络错误',
        message: '请检查网络连接或稍后重试。'
      });
    }
    setLoading(false);
  };

  const clearMembers = () => {
    setMembers([]);
    setAnalysis('');
    setDragCompleted(false);
    setError(null);
  };

  const handleDragComplete = async () => {
    setDragCompleted(true);
    setLoading(true);
    setAnalysis('');
    setError(null);
    
    try {
      const exportData = {
        members: members.map(member => ({
          id: member.id,
          name: member.name,
          role: member.role,
          icon: member.icon,
          gender: member.gender,
          isDeceased: member.isDeceased,
          x: member.x,
          y: member.y,
          direction: member.direction,
          width: member.width,
          height: member.height
        }))
      };
      
      const result = await analyzeFamilyMembers(exportData.members);
      if (result.success) {
        setAnalysis(result.analysis);
      } else {
        setError({
          type: 'error',
          title: '分析失败',
          message: result.error || '未知错误'
        });
      }
    } catch (error) {
      console.error('分析失败:', error);
      setError({
        type: 'error',
        title: '网络错误',
        message: '请检查网络连接或稍后重试。'
      });
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
          
          const safeX = Math.max(0, Math.min(x, CANVAS_WIDTH - memberWidth));
          const safeY = Math.max(0, Math.min(y, CANVAS_HEIGHT - memberHeight));
          
          return { ...m, x: safeX, y: safeY };
        }
        return m;
      });
      return updatedMembers;
    });
  };

  const exportMembersData = () => {
    if (members.length === 0) {
      setError({
        type: 'warning',
        title: '无数据',
        message: '没有成员数据可以导出。'
      });
      return;
    }
    
    const exportData = {
      members: members.map(member => ({
        id: member.id,
        name: member.name,
        role: member.role,
        icon: member.icon,
        gender: member.gender,
        isDeceased: member.isDeceased,
        x: member.x,
        y: member.y,
        direction: member.direction,
        width: member.width,
        height: member.height
      }))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'family_members_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-secondary-50">
      <AnimatePresence>
        {error && (
          <motion.div 
            className="fixed top-4 right-4 z-50 max-w-md"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
          >
            <ErrorMessage
              type={error.type}
              title={error.title}
              message={error.message}
              onDismiss={() => setError(null)}
              onRetry={error.type === 'error' ? analyze : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 主要内容区域 */}
      <div className="flex flex-col min-h-screen">
        {/* 居中标题 */}
        <motion.div 
          className="page-title py-6 bg-gradient-to-br from-neutral-50 via-primary-50 to-secondary-50"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="text-4xl md:text-5xl sm:text-3xl font-display font-bold bg-gradient-to-r from-primary-700 via-secondary-600 to-accent-600 bg-clip-text text-transparent drop-shadow-lg">
            家庭成员排列分析
          </h1>
        </motion.div>

        {/* 画布区域 - 直接位于标题下方 */}
        <motion.div 
          className="canvas-container flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Canvas 
            ref={canvasRef}
            members={members} 
            updateMemberPosition={updateMemberPosition} 
            onUpdateMember={onUpdateMember}
          />
        </motion.div>

        {/* 控制面板 */}
        <motion.div 
          className="bg-white/95 backdrop-blur-sm shadow-strong border-t border-neutral-100/50"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="max-w-7xl mx-auto p-6 space-y-8">

            {/* 快速选择区域 */}
            <Card className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-neutral-800">快速添加成员</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-6">
                {PRESET_ROLES.map(preset => (
                  <motion.button
                    key={preset.role}
                    onClick={() => quickAdd(preset)}
                    className="group relative p-3 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 hover:from-primary-50 hover:to-primary-100 border border-neutral-200 hover:border-primary-300 transition-all duration-200 shadow-soft hover:shadow-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{preset.icon}</span>
                      <span className="text-xs font-medium text-neutral-700 group-hover:text-primary-700">{preset.role}</span>
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>
              
              {/* 表单区域 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <Input
                  label="姓名"
                  placeholder="请输入姓名"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  error={nameError}
                  required
                  icon={<User className="w-4 h-4" />}
                />
                
                <Input
                  label="关系"
                  placeholder="请输入关系"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  error={roleError}
                  required
                  icon={<Users className="w-4 h-4" />}
                />
                
                <Select
                  label="图标"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  className="text-xl"
                >
                  {PRESET_ROLES.map(preset => (
                    <option key={preset.role} value={preset.icon} className="text-lg">
                      {preset.icon} {preset.role}
                    </option>
                  ))}
                </Select>
                
                <Select
                  label="性别"
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                >
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                </Select>
                
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-xl border border-neutral-200 bg-white">
                    <input
                      type="checkbox"
                      id="isDeceased"
                      checked={isDeceased}
                      onChange={e => setIsDeceased(e.target.checked)}
                      className="w-4 h-4 text-primary-600 bg-white border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <label htmlFor="isDeceased" className="text-sm font-medium text-neutral-700 cursor-pointer">
                      已故
                    </label>
                  </div>
                  
                  <Button
                    onClick={addMember}
                    variant="primary"
                    size="medium"
                    icon={<Sparkles className="w-5 h-5" />}
                    className="w-full"
                  >
                    添加成员
                  </Button>
                </div>
              </div>
            </Card>

            {/* 操作按钮 */}
            <Card className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-neutral-800">智能分析</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={handleDragComplete}
                  disabled={loading || members.length === 0 || dragCompleted}
                  loading={loading}
                  variant="gradient"
                  className="w-full"
                  icon={dragCompleted ? <Sparkles className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                >
                  {dragCompleted ? '✅ 已完成' : '🔍 分析排列'}
                </Button>
                
                <Button
                  onClick={analyze}
                  disabled={loading || members.length === 0}
                  loading={loading}
                  variant="accent"
                  className="w-full"
                  icon={<Brain className="w-5 h-5" />}
                >
                  🧠 智能分析
                </Button>
                
                <Button
                  onClick={exportMembersData}
                  disabled={members.length === 0}
                  variant="secondary"
                  className="w-full"
                  icon={<Download className="w-5 h-5" />}
                >
                  ⬇️ 导出数据
                </Button>
                
                <Button
                  onClick={clearMembers}
                  disabled={members.length === 0}
                  variant="secondary"
                  className="w-full"
                  icon={<Trash2 className="w-5 h-5" />}
                >
                  🧹 清空
                </Button>
              </div>
            </Card>
            
            {/* 分析结果展示 */}
            <AnimatePresence>
              {loading && (
                <Card className="text-center">
                  <Loading size="large" text="正在分析家庭排列..." />
                </Card>
              )}
              
              {analysis && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-6 h-6 text-primary-600" />
                      <h2 className="text-xl font-semibold text-neutral-800">分析结果</h2>
                    </div>
                    <div className="border-t border-neutral-100 pt-4">
                      <MarkdownRenderer content={analysis} />
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}