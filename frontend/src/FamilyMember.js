import React, { useState, useEffect, useCallback } from 'react';
import { useDrag } from 'react-dnd';

const maleRoles = ['父亲', '祖父', '哥哥', '弟弟', '儿子', '继父', '养父', '丈夫'];
const femaleRoles = ['母亲', '祖母', '姐姐', '妹妹', '女儿', '继母', '养母', '妻子'];
const childRoles = ['儿子', '女儿', '孩子'];
const directionOrder = ['up', 'right', 'down', 'left'];
const directionAngle = { up: 0, right: 90, down: 180, left: 270 };

const FamilyMember = ({ member, onUpdate }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'MEMBER',
    item: { id: member.id },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 判断边框形状
  let borderRadius = 20;
  if (member.gender === 'male') borderRadius = 8;
  else if (member.gender === 'female') borderRadius = 9999;
  else if (maleRoles.includes(member.role)) borderRadius = 8;
  else if (femaleRoles.includes(member.role)) borderRadius = 9999;

  const width = member.width || (childRoles.includes(member.role) ? 48 : 72);
  const height = member.height || (childRoles.includes(member.role) ? 48 : 72);

  const [hovered, setHovered] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState(null);

  const handleRotate = e => {
    e.stopPropagation();
    // direction 默认值为 'up'
    const current = member.direction || 'up';
    const idx = directionOrder.indexOf(current);
    const next = directionOrder[(idx + 1) % 4];
    onUpdate && onUpdate(member.id, { direction: next });
  };

  const handleResizeMouseDown = e => {
    e.stopPropagation();
    setResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY, width, height });
    document.body.style.setProperty('cursor', 'nwse-resize', 'important');
  };

  useEffect(() => {
    if (!resizing) return;
    const handleMove = e => {
      const dx = e.clientX - resizeStart.x;
      const dy = e.clientY - resizeStart.y;
      // 取最大绝对值，保持等比例缩放
      const delta = Math.max(Math.abs(dx), Math.abs(dy)) * (dx < 0 || dy < 0 ? -1 : 1);
      const base = Math.max(resizeStart.width, resizeStart.height);
      const newSize = Math.max(40, base + delta);
      onUpdate && onUpdate(member.id, { width: newSize, height: newSize });
    };
    const handleUp = () => {
      setResizing(false);
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [resizing, resizeStart, onUpdate, member.id]);

  const renderDirectionTriangle = useCallback(() => (
    <svg
      width="22"
      height="22"
      style={{
        position: 'absolute',
        top: -22,
        left: '50%',
        zIndex: 20,
        transform: `translateX(-50%) rotate(${directionAngle[member.direction || 'up']}deg)`
      }}
    >
      <polygon points="11,0 22,22 0,22" fill="#6366f1" />
    </svg>
  ), [member.direction]);

  const renderResizeHandle = useCallback(() => (
    <div
      onMouseDown={handleResizeMouseDown}
      style={{
        position: 'absolute',
        right: -8,
        bottom: -8,
        width: 18,
        height: 18,
        background: '#fff',
        border: '2px solid #6366f1',
        borderRadius: 6,
        cursor: 'nwse-resize',
        zIndex: 30,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        display: hovered ? 'block' : 'none',
      }}
      title="缩放"
    >
      <svg width="14" height="14" style={{ margin: 2 }}>
        <polyline points="2,12 12,12 12,2" fill="none" stroke="#6366f1" strokeWidth="2" />
      </svg>
    </div>
  ), [hovered, handleResizeMouseDown]);

  return (
    <div
      style={{ position: 'absolute', left: member.x, top: member.y, zIndex: 2000 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 旋转按钮 */}
      <button
        onClick={handleRotate}
        style={{
          position: 'absolute',
          top: -30,
          right: 0,
          zIndex: 20,
          background: 'rgba(99,102,241,0.12)',
          border: 'none',
          borderRadius: '50%',
          width: 28,
          height: 28,
          cursor: 'pointer',
          display: hovered ? 'block' : 'none',
          padding: 3,
        }}
        title="旋转朝向"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M8 2v2.5a.5.5 0 0 0 .5.5H11" stroke="#6366f1" strokeWidth="1.5" fill="none" />
          <path d="M13.5 8A5.5 5.5 0 1 1 8 2" stroke="#6366f1" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
      {/* 成员框本体 */}
      <div
        ref={drag}
        style={{
          width,
          height,
          minWidth: 40,
          minHeight: 40,
          cursor: isDragging ? 'grabbing' : 'move',
          opacity: isDragging ? 0.5 : 1,
          background: 'rgba(255,255,255,0.98)',
          border: '3px solid #a5b4fc',
          borderRadius,
          boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.2)' : '0 6px 20px rgba(0,0,0,0.15)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          transform: isDragging ? 'scale(1.05)' : 'scale(1)',
          willChange: 'transform',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {renderDirectionTriangle()}
        {/* 死亡叉号 */}
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