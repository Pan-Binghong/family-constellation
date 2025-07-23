import React from 'react';
import { useDrop } from 'react-dnd';
import FamilyMember from './FamilyMember';
import './index.css';

const MEMBER_SIZE = 90;
const MIN_DISTANCE = 0; // 成员之间最小间距

/**
 * 获取避免重叠的位置
 */
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

const Canvas = ({ members, updateMemberPosition }) => {
  const [, drop] = useDrop({
    accept: 'MEMBER',
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const canvas = document.getElementById('canvas-area');
      const canvasRect = canvas?.getBoundingClientRect();
      if (!clientOffset || !canvasRect) return;
      // 以成员中心为基准
      let x = clientOffset.x - canvasRect.left - MEMBER_SIZE / 2;
      let y = clientOffset.y - canvasRect.top - MEMBER_SIZE / 2;
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
      ref={drop}
      className="mx-auto relative bg-white border-4 border-black rounded-xl overflow-hidden shadow-inner select-none"
      style={{
        width: 1800,
        height: 500,
        backgroundImage: `
          radial-gradient(circle,rgb(188, 175, 200) 1px, transparent 1px),
          linear-gradient(#f3f4f6,rgb(255, 255, 255))
        `,
        backgroundSize: '20px 20px, 100% 100%',
        backgroundPosition: '0 0, 0 0',
      }}
    >
      {members.length === 0 ? (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 text-xl font-semibold select-none">
          请添加家庭成员并拖动到画布
        </div>
      ) : (
        members.map(member => (
          <FamilyMember key={member.id} member={member} />
        ))
      )}
    </div>
  );
};

export default Canvas;