import React from 'react';
import { WorkflowNode, NodeId, NodeType } from '../../core/types';

export interface NodeComponentProps {
  node: WorkflowNode;
  selected: boolean;
  onClick: (nodeId: NodeId, e: React.MouseEvent) => void;
  onDragStart: (nodeId: NodeId, e: React.MouseEvent) => void;
  onDependencyStart: (nodeId: NodeId, e: React.MouseEvent) => void;
  onDependencyEnd: (nodeId: NodeId) => void;
  onDelete: (nodeId: NodeId) => void;
  readOnly: boolean;
}

/**
 * Component for rendering a workflow node
 */
export const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  selected,
  onClick,
  onDragStart,
  onDependencyStart,
  onDependencyEnd,
  onDelete,
  readOnly
}) => {
  // Get node color based on type
  const getNodeColor = (type: NodeType): string => {
    switch (type) {
      case NodeType.START:
        return '#4CAF50'; // Green
      case NodeType.END:
        return '#F44336'; // Red
      case NodeType.TASK:
        return '#2196F3'; // Blue
      case NodeType.DECISION:
        return '#FF9800'; // Orange
      case NodeType.SYNC_POINT:
        return '#9C27B0'; // Purple
      default:
        return '#757575'; // Gray
    }
  };

  // Get node icon based on type
  const getNodeIcon = (type: NodeType): string => {
    switch (type) {
      case NodeType.START:
        return '▶';
      case NodeType.END:
        return '■';
      case NodeType.TASK:
        return '⚙';
      case NodeType.DECISION:
        return '⋈';
      case NodeType.SYNC_POINT:
        return '⧓';
      default:
        return '?';
    }
  };

  // Handle node click
  const handleClick = (e: React.MouseEvent) => {
    onClick(node.id, e);
  };

  // Handle node drag start
  const handleDragStart = (e: React.MouseEvent) => {
    onDragStart(node.id, e);
  };

  // Handle dependency creation start
  const handleDependencyStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDependencyStart(node.id, e);
  };

  // Handle dependency creation end
  const handleDependencyEnd = () => {
    onDependencyEnd(node.id);
  };

  // Handle node deletion
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(node.id);
  };

  return (
    <div
      className={`workflow-node ${selected ? 'selected' : ''} ${node.type.toLowerCase()}`}
      style={{
        position: 'absolute',
        left: `${node.position?.x || 0}px`,
        top: `${node.position?.y || 0}px`,
        width: `${node.size?.width || 200}px`,
        height: `${node.size?.height || 80}px`,
        backgroundColor: getNodeColor(node.type),
        color: 'white',
        borderRadius: '5px',
        padding: '10px',
        boxShadow: selected ? '0 0 0 2px #000' : '0 2px 5px rgba(0,0,0,0.2)',
        cursor: readOnly ? 'default' : 'move',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: selected ? 2 : 1
      }}
      onClick={handleClick}
      onMouseDown={readOnly ? undefined : handleDragStart}
      onMouseUp={handleDependencyEnd}
    >
      <div className="node-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="node-icon">{getNodeIcon(node.type)}</span>
        <span className="node-type">{node.type}</span>
      </div>
      
      <div className="node-name" style={{ textAlign: 'center', fontWeight: 'bold' }}>
        {node.name}
      </div>
      
      {!readOnly && (
        <div className="node-actions" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            className="dependency-button"
            onClick={handleDependencyStart}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            →
          </button>
          
          <button
            className="delete-button"
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

