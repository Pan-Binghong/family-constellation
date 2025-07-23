import React, { forwardRef } from 'react';
import { useDrop } from 'react-dnd';
import FamilyMember from './FamilyMember';
import './index.css';

const MEMBER_SIZE = 90;
const MIN_DISTANCE = 0;

function getNonOverlappingPosition(x, y, members, currentId, canvasWidth, canvasHeight) {
  let safeX = x;
  let safeY = y;
  let tries = 0;

  while (tries < 30) {
    const isOverlapping = members.some(
      m =>
        m.id !== currentId &&
        Math.abs(m.x - safeX) < MEMBER_SIZE - MIN_DISTANCE &&
        Math.abs(m.y - safeY) < MEMBER_SIZE - MIN_DISTANCE
    );

    if (!isOverlapping) break;

    safeX = Math.max(0, Math.min(safeX + 15, canvasWidth - MEMBER_SIZE));
    safeY = Math.max(0, Math.min(safeY + 15, canvasHeight - MEMBER_SIZE));
    tries++;
  }

  return { x: safeX, y: safeY };
}

// ... existing code ...
const Canvas = forwardRef(({ members, updateMemberPosition, onUpdateMember }, ref) => {
  const [, drop] = useDrop({
    accept: 'MEMBER',
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const canvas = document.getElementById('canvas-area');
      if (!clientOffset || !canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      const relativeX = clientOffset.x - canvasRect.left;
      const relativeY = clientOffset.y - canvasRect.top;
      let x = relativeX - MEMBER_SIZE / 2;
      let y = relativeY - MEMBER_SIZE / 2;
      x = Math.max(0, Math.min(x, canvasRect.width - MEMBER_SIZE));
      y = Math.max(0, Math.min(y, canvasRect.height - MEMBER_SIZE));
      const { x: safeX, y: safeY } = getNonOverlappingPosition(
        x, y, members, item.id, canvasRect.width, canvasRect.height
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
        width: 1200,
        height: 500,
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
// ... existing code ...

export default Canvas;