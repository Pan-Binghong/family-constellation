import React, { forwardRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import FamilyMember from './FamilyMember';
import './index.css';

const MIN_DISTANCE = 0;

function getNonOverlappingPosition(x, y, members, currentId, memberSize, canvasWidth, canvasHeight) {
  let safeX = x;
  let safeY = y;
  let tries = 0;

  console.log('🔍 重叠检测开始:', { 
    输入位置: { x, y }, 
    成员尺寸: memberSize, 
    画布尺寸: { canvasWidth, canvasHeight },
    其他成员数量: members.filter(m => m.id !== currentId).length
  });

  while (tries < 30) {
    const overlappingMembers = members.filter(
      m =>
        m.id !== currentId &&
        Math.abs(m.x - safeX) < memberSize - MIN_DISTANCE &&
        Math.abs(m.y - safeY) < memberSize - MIN_DISTANCE
    );
    
    const isOverlapping = overlappingMembers.length > 0;

    if (!isOverlapping) {
      if (tries > 0) {
        console.log('✅ 找到无重叠位置:', { 
          最终位置: { x: safeX, y: safeY }, 
          尝试次数: tries 
        });
      }
      break;
    }

    console.log(`⚠️ 第${tries + 1}次重叠检测:`, { 
      当前位置: { x: safeX, y: safeY }, 
      重叠成员: overlappingMembers.map(m => ({ name: m.name, pos: { x: m.x, y: m.y } }))
    });

    safeX = Math.max(0, Math.min(safeX + 15, canvasWidth - memberSize));
    safeY = Math.max(0, Math.min(safeY + 15, canvasHeight - memberSize));
    tries++;
  }

  if (tries >= 30) {
    console.log('⚠️ 重叠检测达到最大尝试次数');
  }

  return { x: safeX, y: safeY };
}

// 动态计算画布尺寸
const getCanvasSize = () => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // 画布宽度占满页面宽度，高度占页面高度的40%
  return {
    width: viewportWidth,
    height: Math.min(viewportHeight * 0.4, 500) // 最大500px
  };
};

const Canvas = forwardRef(({ members, updateMemberPosition, onUpdateMember }, ref) => {
  // 动态获取画布尺寸
  const [canvasSize, setCanvasSize] = React.useState(getCanvasSize());
  
  // 添加防抖的resize处理
  React.useEffect(() => {
    let resizeTimeout;
    
    const handleResize = () => {
      // 清除之前的定时器
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      // 设置新的定时器，延迟100ms执行
      resizeTimeout = setTimeout(() => {
        const newSize = getCanvasSize();
        console.log('🔄 窗口大小变化，更新画布尺寸:', newSize);
        setCanvasSize(newSize);
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, []);
  
  const CANVAS_WIDTH = canvasSize.width;
  const CANVAS_HEIGHT = canvasSize.height;
  
  // 打印画布尺寸信息
  console.log('🎨 Canvas 渲染 - 动态尺寸:', { width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  
  // 监听画布DOM变化
  useEffect(() => {
    const canvas = document.getElementById('canvas-area');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(canvas);
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      // 边框信息
      const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
      const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
      const borderRight = parseFloat(computedStyle.borderRightWidth) || 0;
      const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;
      
      // 内容区域尺寸
      const contentWidth = rect.width - borderLeft - borderRight;
      const contentHeight = rect.height - borderTop - borderBottom;
      
      console.log('🎨 Canvas DOM 详细信息:', {
        设计尺寸: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
        实际DOM尺寸: { width: rect.width, height: rect.height },
        内容区域尺寸: { width: contentWidth, height: contentHeight },
        DOM位置: { left: rect.left, top: rect.top },
        边框信息: { 
          left: borderLeft, 
          top: borderTop, 
          right: borderRight, 
          bottom: borderBottom 
        },
        CSS样式尺寸: { 
          width: computedStyle.width, 
          height: computedStyle.height 
        },
        缩放比例: { 
          x: contentWidth / CANVAS_WIDTH, 
          y: contentHeight / CANVAS_HEIGHT 
        },
        '⚠️ 尺寸匹配检查': {
          '内容区宽度匹配': Math.abs(contentWidth - CANVAS_WIDTH) < 2,
          '内容区高度匹配': Math.abs(contentHeight - CANVAS_HEIGHT) < 2
        },
        设备像素比: devicePixelRatio,
        视口信息: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          scrollX: window.scrollX,
          scrollY: window.scrollY
        }
      });
    }
  }, [members.length]); // 当成员数量变化时重新检查

  const [, drop] = useDrop({
    accept: 'MEMBER',
    drop: (item, monitor) => {
      console.log('🚀 开始拖拽放置操作 - 成员ID:', item.id);
      
      const clientOffset = monitor.getClientOffset();
      const canvas = document.getElementById('canvas-area');
      if (!clientOffset || !canvas) {
        console.log('❌ 无法获取客户端偏移量或画布元素');
        return;
      }
      
      const canvasRect = canvas.getBoundingClientRect();
      
      // 获取计算样式以确定边框宽度
      const computedStyle = window.getComputedStyle(canvas);
      const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
      const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
      
      console.log('📐 画布位置信息:', {
        canvasRect: {
          left: canvasRect.left,
          top: canvasRect.top,
          width: canvasRect.width,
          height: canvasRect.height
        },
        borders: {
          left: borderLeft,
          top: borderTop
        },
        clientOffset: {
          x: clientOffset.x,
          y: clientOffset.y
        }
      });
      
      // 找到当前拖拽的成员
      const member = members.find(m => m.id === item.id);
      if (!member) {
        console.log('❌ 找不到对应的成员');
        return;
      }
      
      console.log('👤 拖拽前成员信息:', {
        id: member.id,
        name: member.name,
        currentPosition: { x: member.x, y: member.y },
        size: { width: member.width || 72, height: member.height || 72 },
        initialOffset: item.initialOffset
      });
      
      const memberWidth = member.width || 72;
      const memberHeight = member.height || 72;

      // 计算鼠标在画布内容区域的相对位置（排除边框）
      const relativeX = clientOffset.x - canvasRect.left - borderLeft;
      const relativeY = clientOffset.y - canvasRect.top - borderTop;
      
      console.log('📍 鼠标相对画布内容区位置:', { 
        relativeX, 
        relativeY,
        '🔍 详细计算': {
          '鼠标屏幕位置': { x: clientOffset.x, y: clientOffset.y },
          '画布边界位置': { left: canvasRect.left, top: canvasRect.top },
          '边框偏移': { left: borderLeft, top: borderTop },
          '最终相对位置': { x: relativeX, y: relativeY }
        }
      });

      // 使用拖拽开始时记录的偏移量来计算准确位置
      let x, y;
      
      // 首先尝试使用传递的偏移量
      if (item.initialOffset && item.initialOffset.x !== null && item.initialOffset.y !== null) {
        x = relativeX - item.initialOffset.x;
        y = relativeY - item.initialOffset.y;
        console.log('✅ 使用传递的初始偏移量:', {
          initialOffset: item.initialOffset,
          calculatedPosition: { x, y }
        });
      } else {
        // 备用方案：尝试从DOM元素获取偏移量
        const memberElement = document.querySelector(`[data-member-id="${item.id}"]`);
        const offsetX = memberElement?.getAttribute('data-drag-offset-x');
        const offsetY = memberElement?.getAttribute('data-drag-offset-y');
        
        if (offsetX && offsetY) {
          const backupOffset = { x: parseFloat(offsetX), y: parseFloat(offsetY) };
          x = relativeX - backupOffset.x;
          y = relativeY - backupOffset.y;
          console.log('🔄 使用DOM备份偏移量:', {
            backupOffset,
            calculatedPosition: { x, y }
          });
        } else {
          // 最终降级方案：使用中心点
          x = relativeX - memberWidth / 2;
          y = relativeY - memberHeight / 2;
          console.log('⚠️ 使用降级方案（中心拖拽）:', {
            calculatedPosition: { x, y }
          });
        }
      }
      
      console.log('🧮 位置计算详情:', {
        鼠标相对画布: { relativeX, relativeY },
        使用的偏移量: item.initialOffset || '备用方案',
        计算结果: { x, y },
        成员当前存储位置: { x: member.x, y: member.y }
      });

      // 🚨 强制边界检查和坐标修正
      const beforeClamp = { x, y };
      
      // 严格的边界限制
      x = Math.max(0, Math.min(x, CANVAS_WIDTH - memberWidth));
      y = Math.max(0, Math.min(y, CANVAS_HEIGHT - memberHeight));
      
      // 额外的安全检查
      if (x < 0 || x > CANVAS_WIDTH - memberWidth || y < 0 || y > CANVAS_HEIGHT - memberHeight) {
        console.error('❌ 坐标超出边界，强制修正:', { x, y });
        x = Math.max(0, Math.min(x, CANVAS_WIDTH - memberWidth));
        y = Math.max(0, Math.min(y, CANVAS_HEIGHT - memberHeight));
      }
      
      console.log('🔒 边界限制后:', {
        before: beforeClamp,
        after: { x, y },
        canvasLimits: { 
          maxX: CANVAS_WIDTH - memberWidth, 
          maxY: CANVAS_HEIGHT - memberHeight 
        },
        '✅ 边界检查': {
          x轴有效: x >= 0 && x <= CANVAS_WIDTH - memberWidth,
          y轴有效: y >= 0 && y <= CANVAS_HEIGHT - memberHeight
        }
      });

      // 防止重叠（使用较大的尺寸作为碰撞检测）
      const memberSize = Math.max(memberWidth, memberHeight);
      const beforeOverlapCheck = { x, y };
      const { x: safeX, y: safeY } = getNonOverlappingPosition(
        x, y, members, item.id, memberSize, CANVAS_WIDTH, CANVAS_HEIGHT
      );
      
      console.log('🔄 重叠检测后:', {
        before: beforeOverlapCheck,
        after: { x: safeX, y: safeY }
      });

      console.log('📌 最终移动结果:', {
        成员: member.name,
        移动前: { x: member.x, y: member.y },
        移动后: { x: safeX, y: safeY },
        移动距离: { 
          deltaX: safeX - member.x, 
          deltaY: safeY - member.y 
        }
      });

      updateMemberPosition(item.id, safeX, safeY);
    }
  });

  return (
    <div
      id="canvas-area"
      ref={node => {
        drop(node);
        if (ref) {
          if (typeof ref === 'function') ref(node);
          else ref.current = node;
        }
      }}
      className="relative bg-white border-b-4 border-black overflow-hidden shadow-inner select-none"
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundImage: `
          radial-gradient(circle,rgb(188, 175, 200) 1px, transparent 1px),
          linear-gradient(#f3f4f6,rgb(255, 255, 255))
        `,
        backgroundSize: '20px 20px, 100% 100%',
        backgroundPosition: '0 0, 0 0',
        boxSizing: 'content-box', // 使用content-box，边框在外部
      }}
    >
      {members.length === 0 ? (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 text-xl font-semibold select-none">
          请添加家庭成员并拖动到画布
        </div>
      ) : (
        members.map(member => (
          <FamilyMember key={member.id} member={member} onUpdate={onUpdateMember} />
        ))
      )}
      
              {/* 开发模式下的坐标调试面板 */}
        {process.env.NODE_ENV === 'development' && members.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '11px',
            maxHeight: '120px',
            overflowY: 'auto',
            zIndex: 4000,
            pointerEvents: 'none'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              画布尺寸: {CANVAS_WIDTH}x{CANVAS_HEIGHT}
            </div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>坐标状态:</div>
            {members.map(member => {
              const memberWidth = member.width || 72;
              const memberHeight = member.height || 72;
              const isValid = 
                member.x >= 0 && 
                member.x <= CANVAS_WIDTH - memberWidth && 
                member.y >= 0 && 
                member.y <= CANVAS_HEIGHT - memberHeight;
              
              return (
                <div key={member.id} style={{ 
                  color: isValid ? '#4ade80' : '#f87171',
                  marginBottom: '2px' 
                }}>
                  {member.name}: ({Math.round(member.x)}, {Math.round(member.y)}) 
                  {!isValid && ' ❌'}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
});

export default Canvas;