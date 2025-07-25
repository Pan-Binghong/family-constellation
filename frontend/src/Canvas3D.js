import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Box } from '@react-three/drei';
import * as THREE from 'three';

// 3D家庭成员组件
const FamilyMember3D = ({ member, onUpdate, isSelected, onSelect }) => {
  const meshRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  
  const size = member.size || 1.5;
  const color = member.color || (member.gender === 'male' ? '#8EBDF9' : '#ec4899');
  
  // 处理拖拽开始
  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.point.x,
      z: e.point.z,
      memberX: member.x,
      memberZ: member.z
    });
    onSelect && onSelect(member.id);
  };
  
  // 处理拖拽移动 - 移除步长限制，允许自由移动
  const handlePointerMove = (e) => {
    if (!isDragging || !dragStart) return;
    
    const deltaX = e.point.x - dragStart.x;
    const deltaZ = e.point.z - dragStart.z;
    
    const newX = dragStart.memberX + deltaX;
    const newZ = dragStart.memberZ + deltaZ;
    
    // 只限制不超出棋盘边界，允许自由移动
    const clampedX = Math.max(-8, Math.min(8, newX));
    const clampedZ = Math.max(-8, Math.min(8, newZ));
    
    // 实时更新位置，提供丝滑体验
    onUpdate && onUpdate(member.id, { x: clampedX, z: clampedZ });
  };
  
  // 处理拖拽结束
  const handlePointerUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };
  
  // 处理大小调整
  const handleWheel = (e) => {
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const newSize = Math.max(1, Math.min(4, size + delta));
    onUpdate && onUpdate(member.id, { size: newSize });
  };
  
  // 处理旋转
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    const currentRotation = member.rotation || 0;
    const newRotation = (currentRotation + Math.PI / 2) % (Math.PI * 2);
    onUpdate && onUpdate(member.id, { rotation: newRotation });
  };

  // 新增旋转按钮悬停状态
  const [rotateHovered, setRotateHovered] = useState(false);

  // 旋转按钮点击
  const handleRotateClick = (e) => {
    e.stopPropagation();
    const currentRotation = member.rotation || 0;
    const newRotation = (currentRotation + Math.PI / 2) % (Math.PI * 2);
    onUpdate && onUpdate(member.id, { rotation: newRotation });
  };
  
  return (
    <group
      ref={meshRef}
      position={[member.x, size * 0.5, member.z]}
      rotation={[0, member.rotation || 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      {/* 球体头部 */}
      <mesh position={[0, size * 0.6, 0]}>
        <sphereGeometry args={[size * 0.4, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* 眼睛 - 左眼 */}
      <mesh position={[size * 0.15, size * 0.7, size * 0.25]}>
        <sphereGeometry args={[size * 0.05, 8, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* 眼睛 - 右眼 */}
      <mesh position={[size * -0.15, size * 0.7, size * 0.25]}>
        <sphereGeometry args={[size * 0.05, 8, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* 嘴巴 - 弯曲的线 */}
      <mesh position={[0, size * 0.5, size * 0.25]}>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.15, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* 圆锥体身体 */}
      <mesh position={[0, size * 0.2, 0]}>
        <coneGeometry args={[size * 0.5, size * 1, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* 选中状态指示器 */}
      {isSelected && (
        <mesh position={[0, -0.1, 0]}>
          <ringGeometry args={[size * 0.6, size * 0.7, 16]} />
          <meshBasicMaterial color="#6366f1" />
        </mesh>
      )}
      
      {/* 死亡标记 */}
      {member.isDeceased && (
        <mesh position={[0, size * 0.8, 0]}>
          <boxGeometry args={[size * 0.15, size * 0.15, size * 0.15]} />
          <meshBasicMaterial color="#6b7280" />
        </mesh>
      )}

      {/* 旋转按钮（头顶上方） */}
      <mesh
        position={[0, size * 1.1, 0]}
        onPointerOver={() => setRotateHovered(true)}
        onPointerOut={() => setRotateHovered(false)}
        onClick={handleRotateClick}
        scale={rotateHovered ? 1.3 : 1}
        style={{ cursor: 'pointer' }}
      >
        <sphereGeometry args={[size * 0.08, 12, 12]} />
        <meshStandardMaterial color={rotateHovered ? '#f59e42' : '#fbbf24'} />
      </mesh>
    </group>
  );
};

// 3D画布组件
const Canvas3D = ({ members, onUpdateMember, selectedMember, onSelectMember }) => {
  return (
    <div style={{ width: '100%', height: '600px', background: '#1f2937' }}>
      <Canvas
        camera={{ position: [0, 18, 12], fov: 45 }}
        shadows
      >
        {/* 环境光 */}
        <ambientLight intensity={0.6} />
        
        {/* 方向光 - 调整为稍微倾斜的光照 */}
        <directionalLight
          position={[5, 15, 5]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* 固定倾斜俯视角度控制器 */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
          maxPolarAngle={Math.PI / 2}
          minDistance={22}
          maxDistance={22}
          target={[0, 0, 0]}
        />
        
        {/* 固定大小的棋盘网格 */}
        <Grid
          args={[16, 16]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={4}
          sectionThickness={1}
          sectionColor="#374151"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />
        
        {/* 家庭成员 */}
        {members.map(member => (
          <FamilyMember3D
            key={member.id}
            member={member}
            onUpdate={onUpdateMember}
            isSelected={selectedMember === member.id}
            onSelect={onSelectMember}
          />
        ))}
        
        {/* 地面 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#f3f4f6" />
        </mesh>
      </Canvas>
    </div>
  );
};

export default Canvas3D;