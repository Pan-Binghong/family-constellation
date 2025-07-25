import React, { forwardRef } from 'react';
import { useDrop } from 'react-dnd';
import FamilyMember from './FamilyMember';
import './index.css';

const MIN_DISTANCE = 0;

function getNonOverlappingPosition(x, y, members, currentId, memberSize, canvasWidth, canvasHeight) {
  let safeX = x;
  let safeY = y;
  let tries = 0;

  while (tries < 30) {
    const isOverlapping = members.some(
      m =>
        m.id !== currentId &&
        Math.abs(m.x - safeX) < memberSize - MIN_DISTANCE &&
        Math.abs(m.y - safeY) < memberSize - MIN_DISTANCE
    );

    if (!isOverlapping) break;

    safeX = Math.max(0, Math.min(safeX + 15, canvasWidth - memberSize));
    safeY = Math.max(0, Math.min(safeY + 15, canvasHeight - memberSize));
    tries++;
  }

  return { x: safeX, y: safeY };
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 500;

const Canvas = forwardRef(({ members, updateMemberPosition, onUpdateMember }, ref) => {
  const [, drop] = useDrop({
    accept: 'MEMBER',
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const canvas = document.getElementById('canvas-area');
      if (!clientOffset || !canvas) return;
      
      const canvasRect = canvas.getBoundingClientRect();
      
      // 找到当前拖拽的成员
      const member = members.find(m => m.id === item.id);
      if (!member) return;
      
      const memberSize = Math.max(member.width || 72, member.height || 72);

      // 计算鼠标在画布内的相对位置
      const relativeX = clientOffset.x - canvasRect.left;
      const relativeY = clientOffset.y - canvasRect.top;

      // 以成员中心为基准，计算成员的左上角坐标
      let x = relativeX - memberSize / 2;
      let y = relativeY - memberSize / 2;

      // 确保成员完全在画布内
      x = Math.max(0, Math.min(x, CANVAS_WIDTH - memberSize));
      y = Math.max(0, Math.min(y, CANVAS_HEIGHT - memberSize));

      // 防止重叠
      const { x: safeX, y: safeY } = getNonOverlappingPosition(
        x, y, members, item.id, memberSize, CANVAS_WIDTH, CANVAS_HEIGHT
      );

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
      className="mx-auto relative bg-white border-4 border-black rounded-xl overflow-hidden shadow-inner select-none"
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundImage: `
          radial-gradient(circle,rgb(188, 175, 200) 1px, transparent 1px),
          linear-gradient(#f3f4f6,rgb(255, 255, 255))
        `,
        backgroundSize: '20px 20px, 100% 100%',
        backgroundPosition: '0 0, 0 0',
        boxSizing: 'border-box',
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
    </div>
  );
});

export default Canvas;