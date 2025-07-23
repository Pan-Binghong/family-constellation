import React from 'react';
import { useDrag } from 'react-dnd';

const maleRoles = ['父亲', '祖父', '哥哥', '弟弟', '儿子', '继父', '养父'];
const femaleRoles = ['母亲', '祖母', '姐姐', '妹妹', '女儿', '继母', '养母'];

const FamilyMember = ({ member }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'MEMBER',
    item: { id: member.id },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 判断边框形状
  let borderRadius = 20;
  if (maleRoles.includes(member.role)) borderRadius = 8;
  if (femaleRoles.includes(member.role)) borderRadius = 9999;

  return (
    <div
      ref={drag}
      style={{
        position: 'absolute',
        left: member.x,
        top: member.y,
        minWidth: 90,
        minHeight: 90,
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
        zIndex: 2000,
        boxShadow: '0 6px 20px 0 rgba(0,0,0,0.15)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        background: 'rgba(255,255,255,0.98)',
        border: '3px solid #a5b4fc',
        borderRadius,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
      }}
      className="hover:shadow-xl group select-none"
    >
      <div className="text-5xl mb-1 drop-shadow-sm group-hover:scale-110 transition-transform duration-200">{member.icon || '🧑'}</div>
      <div className="font-bold text-base text-gray-800 mb-0.5">{member.name}</div>
      <div className="text-xs text-blue-500 font-semibold tracking-wide">{member.role}</div>
    </div>
  );
};

export default FamilyMember;
