import React from 'react';
import { Dependency, WorkflowNode, NodeId, DependencyType } from '../../core/types';

export interface DependencyComponentProps {
  dependency: Dependency;
  sourceNode?: WorkflowNode;
  targetNode?: WorkflowNode;
  onDelete: (sourceId: NodeId, targetId: NodeId) => void;
  readOnly: boolean;
}

/**
 * Component for rendering a dependency between nodes
 */
export const DependencyComponent: React.FC<DependencyComponentProps> = ({
  dependency,
  sourceNode,
  targetNode,
  onDelete,
  readOnly
}) => {
  // If either node is missing, don't render
  if (!sourceNode || !targetNode || !sourceNode.position || !targetNode.position) {
    return null;
  }

  // Calculate source and target positions
  const sourceX = sourceNode.position.x + (sourceNode.size?.width || 200) / 2;
  const sourceY = sourceNode.position.y + (sourceNode.size?.height || 80) / 2;
  const targetX = targetNode.position.x + (targetNode.size?.width || 200) / 2;
  const targetY = targetNode.position.y + (targetNode.size?.height || 80) / 2;

  // Calculate control points for curved lines
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const controlX = sourceX + dx / 2;
  const controlY = sourceY + dy / 2;

  // Get path for the arrow
  const getPath = () => {
    return `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;
  };

  // Get marker end based on dependency type
  const getMarkerEnd = () => {
    switch (dependency.type) {
      case DependencyType.CONDITIONAL:
        return 'url(#conditional-arrow)';
      case DependencyType.SYNC:
        return 'url(#sync-arrow)';
      default:
        return 'url(#arrow)';
    }
  };

  // Get stroke style based on dependency type
  const getStrokeStyle = () => {
    switch (dependency.type) {
      case DependencyType.CONDITIONAL:
        return '5,5';
      case DependencyType.SYNC:
        return '10,5';
      default:
        return '';
    }
  };

  // Handle dependency deletion
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(dependency.sourceId, dependency.targetId);
  };

  // Calculate position for the delete button
  const buttonX = sourceX + dx / 2;
  const buttonY = sourceY + dy / 2;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    >
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#666" />
        </marker>
        <marker
          id="conditional-arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#FF9800" />
        </marker>
        <marker
          id="sync-arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#9C27B0" />
        </marker>
      </defs>
      
      <path
        d={getPath()}
        stroke={dependency.type === DependencyType.CONDITIONAL ? '#FF9800' : 
               dependency.type === DependencyType.SYNC ? '#9C27B0' : '#666'}
        strokeWidth="2"
        fill="none"
        strokeDasharray={getStrokeStyle()}
        markerEnd={getMarkerEnd()}
      />
      
      {!readOnly && (
        <g
          transform={`translate(${buttonX}, ${buttonY})`}
          onClick={handleDelete}
          style={{ pointerEvents: 'all', cursor: 'pointer' }}
        >
          <circle cx="0" cy="0" r="8" fill="white" stroke="#666" />
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fill="#666"
          >
            ×
          </text>
        </g>
      )}
      
      {dependency.condition && (
        <text
          x={controlX}
          y={controlY - 10}
          textAnchor="middle"
          fontSize="10"
          fill="#666"
          style={{ pointerEvents: 'none' }}
        >
          {`${dependency.condition.leftOperand} ${dependency.condition.operator} ${dependency.condition.rightOperand}`}
        </text>
      )}
    </svg>
  );
};

