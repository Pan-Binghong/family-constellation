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
    
    // 画布宽度减少，高度增加 - 与Canvas.js保持一致
    return {
      width: viewportWidth * 0.8, // 宽度减少到80%
      height: Math.min(viewportHeight * 0.85, 1000) // 高度增加到85%，最大1000px
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
        {/* 标题区域 - 增强视觉效果 */}
        <motion.div 
          className="relative py-8 px-4 text-center bg-gradient-to-r from-white/80 via-white/90 to-white/80 backdrop-blur-sm border-b border-neutral-200/50 shadow-sm"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-50/30 via-secondary-50/30 to-accent-50/30 opacity-60"></div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-primary-700 via-secondary-600 to-accent-600 bg-clip-text text-transparent drop-shadow-lg mb-2">
              家庭成员排列分析
            </h1>
          </div>
        </motion.div>

        {/* 中间区域 - 响应式布局 */}
        <div className="flex flex-1 flex-col lg:flex-row gap-2">
          {/* 左侧快速添加成员区域 - 响应式宽度 */}
          <motion.div 
            className="w-full lg:w-1/4 lg:min-w-[320px] max-w-none lg:max-w-[400px] bg-gradient-to-b from-white/98 to-white/95 backdrop-blur-sm shadow-soft border-b-2 lg:border-b-0 lg:border-r-2 border-gradient-to-r lg:border-gradient-to-b from-neutral-200/30 to-neutral-300/50 overflow-y-auto"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-6 space-y-6">
              {/* 快速选择区域 */}
              <Card className="space-y-5 border-2 border-primary-100/50 shadow-medium hover:shadow-strong transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-neutral-100">
                  <div className="p-2 rounded-full bg-gradient-to-r from-primary-100 to-primary-200">
                    <Users className="w-5 h-5 text-primary-700" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-800">快速添加成员</h2>
                </div>
                
                <div className="mb-6">
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_ROLES.map(preset => (
                      <motion.button
                        key={preset.role}
                        onClick={() => quickAdd(preset)}
                        className="group relative p-3 rounded-xl bg-gradient-to-br from-white to-neutral-50 hover:from-primary-50 hover:to-primary-100 border-2 border-transparent hover:border-primary-200 transition-all duration-300 shadow-sm hover:shadow-lg"
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="flex flex-col items-center space-y-1.5">
                          <div className="text-lg group-hover:scale-125 transition-transform duration-300 filter drop-shadow-sm">{preset.icon}</div>
                          <span className="text-[11px] font-semibold text-neutral-700 group-hover:text-primary-700 leading-none text-center">{preset.role}</span>
                        </div>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-400/20 to-secondary-400/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* 表单区域 - 优化布局 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="姓名"
                      placeholder="输入成员姓名"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      error={nameError}
                      required
                      icon={<User className="w-4 h-4" />}
                      className="transition-all duration-200 focus-within:scale-[1.02]"
                    />
                    
                    <Input
                      label="关系"
                      placeholder="输入与你的关系"
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      error={roleError}
                      required
                      icon={<Users className="w-4 h-4" />}
                      className="transition-all duration-200 focus-within:scale-[1.02]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="图标"
                      value={icon}
                      onChange={e => setIcon(e.target.value)}
                      className="text-base"
                    >
                      {PRESET_ROLES.map(preset => (
                        <option key={preset.role} value={preset.icon} className="text-sm py-1">
                          {preset.icon} {preset.role}
                        </option>
                      ))}
                    </Select>
                    
                    <Select
                      label="性别"
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                    >
                      <option value="male">👨 男性</option>
                      <option value="female">👩 女性</option>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-3 p-4 rounded-2xl border-2 border-dashed border-neutral-200 bg-gradient-to-r from-neutral-50/50 to-white hover:border-primary-200 transition-all duration-200">
                    <input
                      type="checkbox"
                      id="isDeceased"
                      checked={isDeceased}
                      onChange={e => setIsDeceased(e.target.checked)}
                      className="w-5 h-5 text-primary-600 bg-white border-2 border-neutral-300 rounded-md focus:ring-primary-500 focus:ring-2 transition-all duration-200"
                    />
                    <label htmlFor="isDeceased" className="text-sm font-semibold text-neutral-700 cursor-pointer select-none">
                      ⚔️ 已故人员
                    </label>
                  </div>
                  
                  <Button
                    onClick={addMember}
                    variant="primary"
                    size="large"
                    icon={<Sparkles className="w-6 h-6" />}
                    className="w-full mt-6 py-4 text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                  >
                    添加成员
                  </Button>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* 右侧区域 - 响应式宽度，包含画布和智能分析 */}
          <div className="w-full lg:w-3/4 flex flex-col bg-gradient-to-br from-neutral-50/30 to-white/80 min-h-0">
            {/* 画布区域 - 增强视觉效果和响应式 */}
            <motion.div 
              className="flex-1 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-white/60 via-neutral-50/40 to-primary-50/20 min-h-[400px] lg:min-h-[500px]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            >
              <div className="h-full rounded-xl lg:rounded-2xl shadow-xl lg:shadow-2xl border border-white/60 lg:border-2 lg:border-white/80 bg-gradient-to-br from-white via-neutral-50/50 to-primary-50/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-primary-100/20 pointer-events-none"></div>
                <div className="relative z-10 h-full">
                  <Canvas 
                    ref={canvasRef}
                    members={members} 
                    updateMemberPosition={updateMemberPosition} 
                    onUpdateMember={onUpdateMember}
                  />
                </div>
              </div>
            </motion.div>

            {/* 智能分析区域 - 位于画布下方，响应式设计 */}
            <motion.div 
              className="bg-white border-t border-neutral-200"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
            >
              <div className="p-4 sm:p-6 lg:p-8 space-y-4 lg:space-y-6">
                {/* 操作按钮区域 - 响应式设计 */}
                <Card className="space-y-4 lg:space-y-6 border border-primary-100/40 lg:border-2 lg:border-primary-100/60 shadow-lg lg:shadow-xl bg-gradient-to-br from-white via-primary-50/20 to-secondary-50/20">
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 lg:mb-6 pb-3 lg:pb-4 border-b border-primary-100 lg:border-b-2 lg:border-gradient-to-r from-primary-100 to-secondary-100">
                    <div className="p-2 lg:p-3 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 shadow-md lg:shadow-lg">
                      <Brain className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-primary-700 to-secondary-700 bg-clip-text text-transparent">智能分析</h2>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
                    <Button
                      onClick={handleDragComplete}
                      disabled={loading || members.length === 0 || dragCompleted}
                      loading={loading}
                      variant="gradient"
                      className="w-full h-12 lg:h-14 text-sm lg:text-base font-bold shadow-md lg:shadow-lg hover:shadow-lg lg:hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      icon={dragCompleted ? <Sparkles className="w-4 h-4 lg:w-6 lg:h-6" /> : <Brain className="w-4 h-4 lg:w-6 lg:h-6" />}
                    >
                      <span className="hidden sm:inline">{dragCompleted ? '已完成' : '分析排列'}</span>
                      <span className="sm:hidden">{dragCompleted ? '✅' : '🔍'}</span>
                    </Button>
                    
                    <Button
                      onClick={analyze}
                      disabled={loading || members.length === 0}
                      loading={loading}
                      variant="accent"
                      className="w-full h-12 lg:h-14 text-sm lg:text-base font-bold shadow-md lg:shadow-lg hover:shadow-lg lg:hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      icon={<Brain className="w-4 h-4 lg:w-6 lg:h-6" />}
                    >
                      <span className="hidden sm:inline">智能分析</span>
                      <span className="sm:hidden">🧠</span>
                    </Button>
                    
                    <Button
                      onClick={exportMembersData}
                      disabled={members.length === 0}
                      variant="secondary"
                      className="w-full h-12 lg:h-14 text-sm lg:text-base font-bold shadow-md lg:shadow-lg hover:shadow-lg lg:hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      icon={<Download className="w-4 h-4 lg:w-6 lg:h-6" />}
                    >
                      <span className="hidden sm:inline">导出数据</span>
                      <span className="sm:hidden">📦</span>
                    </Button>
                    
                    <Button
                      onClick={clearMembers}
                      disabled={members.length === 0}
                      variant="secondary"
                      className="w-full h-12 lg:h-14 text-sm lg:text-base font-bold shadow-md lg:shadow-lg hover:shadow-lg lg:hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      icon={<Trash2 className="w-4 h-4 lg:w-6 lg:h-6" />}
                    >
                      <span className="hidden sm:inline">清空数据</span>
                      <span className="sm:hidden">🗑️</span>
                    </Button>
                  </div>
                </Card>
                
                {/* 分析结果展示 - 美化设计 */}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="text-center py-12 bg-gradient-to-br from-primary-50/50 to-secondary-50/50 border-2 border-primary-200/50">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative">
                            <Loading size="large" text="" />
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full animate-pulse opacity-20"></div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-neutral-800">🧠 AI 分析中...</h3>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                  
                  {analysis && !loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                      <Card className="space-y-6 bg-gradient-to-br from-white via-accent-50/20 to-primary-50/30 border-2 border-accent-200/50 shadow-2xl">
                        <div className="flex items-center justify-center space-x-4 pb-4 border-b-2 border-gradient-to-r from-accent-100 to-primary-100">
                          <div className="p-3 rounded-full bg-gradient-to-r from-accent-500 to-primary-500 shadow-lg animate-pulse">
                            <Brain className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-center">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-accent-700 to-primary-700 bg-clip-text text-transparent">分析结果</h2>
                          </div>
                        </div>
                        <div className="bg-white/80 rounded-2xl p-6 shadow-inner border border-neutral-100">
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
      </div>
    </div>
  );
}