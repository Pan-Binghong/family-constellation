import React, { useState, useEffect, useCallback } from 'react';
import { useDrag } from 'react-dnd';

const directionOrder = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
const directionAngle = { 
  north: 0, 
  northeast: 45, 
  east: 90, 
  southeast: 135, 
  south: 180, 
  southwest: 225, 
  west: 270, 
  northwest: 315 
};

const arrowPositions = {
  // 对于方形和圆形
  north: { top: -28, left: '50%', transform: 'translateX(-50%)' }, // 向上调整，更靠近圆形顶部
  northeast: { top: -20, right: -20 }, // 更靠近圆形右上角
  east: { top: '50%', right: -28, transform: 'translateY(-50%)' }, // 向右调整，更靠近圆形右侧
  southeast: { bottom: -20, right: -20 }, // 更靠近圆形右下角
  south: { bottom: -28, left: '50%', transform: 'translateX(-50%)' }, // 向下调整，更靠近圆形底部
  southwest: { bottom: -20, left: -20 }, // 更靠近圆形左下角
  west: { top: '50%', left: -28, transform: 'translateY(-50%)' }, // 向左调整，更靠近圆形左侧
  northwest: { top: -20, left: -20 } // 更靠近圆形左上角
};

const triangleArrowPositions = {
  // 针对三角形
  north: { top: -22, left: '50%', transform: 'translateX(-50%)' }, // 三角形顶点，通常是OK的
  northeast: { top: -16, right: -16 }, // 从边界框右上角向外偏移，尝试显示箭头
  east: { top: '50%', right: -22, transform: 'translateY(-50%)' }, // 沿右侧边，调整Y偏移可能需要微调
  southeast: { bottom: -16, right: -16 }, // 从边界框右下角向外偏移
  south: { bottom: -22, left: '50%', transform: 'translateX(-50%)' }, // 三角形底边中心，通常是OK的
  southwest: { bottom: -16, left: -16 }, // 从边界框左下角向外偏移
  west: { top: '50%', left: -22, transform: 'translateY(-50%)' }, // 沿左侧边，调整Y偏移可能需要微调
  northwest: { top: -16, left: -16 } // 从边界框左上角向外偏移
};

const FamilyMember = ({ member, onUpdate }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'MEMBER',
    item: { id: member.id },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const width = member.width || 72;
  const height = member.height || 72;

  const [hovered, setHovered] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState(null);

  const shape = member.gender === 'female' ? 'circle' : member.shape || 'square'; // 确保 shape 在 validDirection 之前定义

  const positionConfigForValidation = shape === 'triangle' ? triangleArrowPositions : arrowPositions;
  const validDirection = member.direction && positionConfigForValidation[member.direction] ? member.direction : 'north';

  const handleRotate = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const idx = directionOrder.indexOf(validDirection);
    const next = directionOrder[(idx + 1) % directionOrder.length];
    if (onUpdate) {
      onUpdate(member.id, { direction: next });
    }
  }, [validDirection, member.id, onUpdate]);

  const handleResizeMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY, width, height });
    document.body.style.setProperty('cursor', 'nwse-resize', 'important');
  }, [width, height]);

  useEffect(() => {
    if (!resizing || !resizeStart) return;

    const handleMove = (e) => {
      const dx = e.clientX - resizeStart.x;
      const dy = e.clientY - resizeStart.y;
      const delta = Math.max(Math.abs(dx), Math.abs(dy)) * (dx < 0 || dy < 0 ? -1 : 1);
      const base = Math.max(resizeStart.width, resizeStart.height);
      const newSize = Math.max(40, base + delta);

      onUpdate && onUpdate(member.id, { width: newSize, height: newSize });
    };

    const handleUp = () => {
      setResizing(false);
      setResizeStart(null);
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [resizing, resizeStart, onUpdate, member.id]);

  const renderDirectionTriangle = useCallback(() => {
    const positionConfig = shape === 'triangle' ? triangleArrowPositions : arrowPositions;
    const position = positionConfig[validDirection];
    const angle = directionAngle[validDirection] || 0;
    const baseTransform = position.transform || '';
    const rotateTransform = `rotate(${angle}deg)`;
    const combinedTransform = baseTransform ? `${baseTransform} ${rotateTransform}` : rotateTransform;

    return (
      <svg
        width="22"
        height="22"
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
          right: position.right,
          bottom: position.bottom,
          zIndex: 20,
          transform: combinedTransform
        }}
      >
        <polygon points="11,0 22,22 0,22" fill="#6366f1" />
      </svg>
    );
  }, [validDirection, shape]);

  const renderResizeHandle = useCallback(() => (
    <div
      onMouseDown={handleResizeMouseDown}
      style={{
        position: 'absolute',
        right: -25,
        bottom: -25,
        width: 24,
        height: 24,
        background: '#fff',
        border: '2px solid #6366f1',
        borderRadius: 8,
        cursor: 'nwse-resize',
        zIndex: 30,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      title="缩放"
    >
      <svg width="16" height="16">
        <polyline points="3,13 13,13 13,3" fill="none" stroke="#6366f1" strokeWidth="2" />
        <polyline points="9,7 13,3 9,7" fill="none" stroke="#6366f1" strokeWidth="2" />
        <polyline points="7,9 13,13 7,9" fill="none" stroke="#6366f1" strokeWidth="2" />
      </svg>
    </div>
  ), [handleResizeMouseDown]);

  const getContainerStyle = () => {
    let baseStyle = {
      width,
      height,
      minWidth: 40,
      minHeight: 40,
      cursor: isDragging ? 'grabbing' : 'grab',
      opacity: isDragging ? 0.8 : 1,
      background: 'rgba(255,255,255,0.98)',
      border: '3px solid #a5b4fc',
      boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.2)' : '0 6px 20px rgba(0,0,0,0.15)',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      willChange: 'transform',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none',
      position: 'relative',
    };

    switch (shape) {
      case 'circle':
        baseStyle.borderRadius = '50%';
        break;
      case 'triangle':
        baseStyle.borderRadius = '0';
        baseStyle.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        break;
      default:
        baseStyle.borderRadius = '8px';
        break;
    }

    return baseStyle;
  };

  return (
    <div
      style={{ position: 'absolute', left: member.x, top: member.y, zIndex: 2000 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={handleRotate}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: -40,
          left: -40,
          zIndex: 20,
          background: '#fff',
          border: '2px solid #6366f1',
          borderRadius: '50%',
          width: 32,
          height: 32,
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
        title={`箭头朝向: ${validDirection}`}
      >
        <svg width="18" height="18" viewBox="0 0 16 16">
          <path d="M8 2v2.5a.5.5 0 0 0 .5.5H11" stroke="#6366f1" strokeWidth="1.5" fill="none" />
          <path d="M13.5 8A5.5 5.5 0 1 1 8 2" stroke="#6366f1" strokeWidth="1.5" fill="none" />
        </svg>
      </button>

      <div ref={drag} style={getContainerStyle()}>
        {renderDirectionTriangle()}

        {member.isDeceased && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: Math.min(width * 2, 60),
              color: '#6b7280',
              fontWeight: 'bold',
              zIndex: 2001,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              opacity: 0.6,
              pointerEvents: 'none',
            }}
          >
            ✕
          </div>
        )}

        <div
          style={{
            fontSize: Math.max(12, Math.min(width * 0.38, 28)),
            marginBottom: 2,
            transition: 'transform 0.2s',
          }}
        >
          {member.icon || '🧑'}
        </div>
        <div
          style={{
            fontWeight: 'bold',
            color: '#1f2937',
            fontSize: Math.max(10, width / 6.5),
            marginBottom: 1,
          }}
        >
          {member.name}
        </div>
        <div
          style={{
            fontSize: Math.max(8, width / 8),
            color: '#3b82f6',
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          {member.role}
        </div>

        {renderResizeHandle()}
      </div>
    </div>
  );
};

export default FamilyMember;