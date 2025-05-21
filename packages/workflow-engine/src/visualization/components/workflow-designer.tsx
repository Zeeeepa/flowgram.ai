import React, { useState, useRef, useEffect } from 'react';
import { 
  Workflow, 
  WorkflowNode, 
  NodeId, 
  Track, 
  TrackId, 
  Dependency, 
  Position,
  NodeType
} from '../../core/types';
import { NodeComponent } from './node-component';
import { TrackComponent } from './track-component';
import { DependencyComponent } from './dependency-component';

export interface WorkflowDesignerProps {
  workflow: Workflow;
  onNodeAdd?: (node: WorkflowNode) => void;
  onNodeUpdate?: (nodeId: NodeId, updates: Partial<WorkflowNode>) => void;
  onNodeDelete?: (nodeId: NodeId) => void;
  onNodeMove?: (nodeId: NodeId, position: Position) => void;
  onTrackAdd?: (track: Track) => void;
  onTrackUpdate?: (trackId: TrackId, updates: Partial<Track>) => void;
  onTrackDelete?: (trackId: TrackId) => void;
  onDependencyAdd?: (dependency: Dependency) => void;
  onDependencyDelete?: (sourceId: NodeId, targetId: NodeId) => void;
  readOnly?: boolean;
}

/**
 * Visual workflow designer component with drag-and-drop capabilities
 */
export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({
  workflow,
  onNodeAdd,
  onNodeUpdate,
  onNodeDelete,
  onNodeMove,
  onTrackAdd,
  onTrackUpdate,
  onTrackDelete,
  onDependencyAdd,
  onDependencyDelete,
  readOnly = false
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<NodeId | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<TrackId | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<NodeId | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [creatingDependency, setCreatingDependency] = useState<{ sourceId: NodeId } | null>(null);
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse move for dragging nodes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });

        if (draggingNodeId) {
          const node = workflow.nodes.find(n => n.id === draggingNodeId);
          if (node && onNodeMove) {
            onNodeMove(draggingNodeId, {
              x: x - dragOffset.x,
              y: y - dragOffset.y
            });
          }
        }
      }
    };

    const handleMouseUp = () => {
      setDraggingNodeId(null);
      if (creatingDependency) {
        setCreatingDependency(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNodeId, dragOffset, creatingDependency, onNodeMove, workflow.nodes]);

  // Handle node selection
  const handleNodeClick = (nodeId: NodeId, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setSelectedTrackId(null);
  };

  // Handle track selection
  const handleTrackClick = (trackId: TrackId, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTrackId(trackId);
    setSelectedNodeId(null);
  };

  // Handle node drag start
  const handleNodeDragStart = (nodeId: NodeId, e: React.MouseEvent) => {
    if (readOnly) return;
    
    e.stopPropagation();
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (node && node.position) {
      setDraggingNodeId(nodeId);
      setDragOffset({
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY
      });
    }
  };

  // Handle dependency creation start
  const handleDependencyStart = (nodeId: NodeId, e: React.MouseEvent) => {
    if (readOnly) return;
    
    e.stopPropagation();
    setCreatingDependency({ sourceId: nodeId });
  };

  // Handle dependency creation end
  const handleDependencyEnd = (nodeId: NodeId) => {
    if (readOnly || !creatingDependency) return;
    
    // Don't create self-dependencies
    if (creatingDependency.sourceId === nodeId) {
      setCreatingDependency(null);
      return;
    }
    
    // Create the new dependency
    if (onDependencyAdd) {
      onDependencyAdd({
        sourceId: creatingDependency.sourceId,
        targetId: nodeId,
        type: 'sequential'
      });
    }
    
    setCreatingDependency(null);
  };

  // Handle dependency deletion
  const handleDependencyDelete = (sourceId: NodeId, targetId: NodeId) => {
    if (readOnly) return;
    
    if (onDependencyDelete) {
      onDependencyDelete(sourceId, targetId);
    }
  };

  // Handle background click to deselect
  const handleBackgroundClick = () => {
    setSelectedNodeId(null);
    setSelectedTrackId(null);
  };

  // Handle node deletion
  const handleNodeDelete = (nodeId: NodeId) => {
    if (readOnly) return;
    
    if (onNodeDelete) {
      onNodeDelete(nodeId);
    }
    setSelectedNodeId(null);
  };

  // Handle track deletion
  const handleTrackDelete = (trackId: TrackId) => {
    if (readOnly) return;
    
    if (onTrackDelete) {
      onTrackDelete(trackId);
    }
    setSelectedTrackId(null);
  };

  // Add a new node
  const handleAddNode = (type: NodeType) => {
    if (readOnly) return;
    
    if (onNodeAdd) {
      const newNode: WorkflowNode = {
        id: `node-${Date.now()}`,
        type,
        name: `New ${type} Node`,
        position: { x: 100, y: 100 }
      };
      onNodeAdd(newNode);
    }
  };

  // Add a new track
  const handleAddTrack = () => {
    if (readOnly) return;
    
    if (onTrackAdd) {
      const newTrack: Track = {
        id: `track-${Date.now()}`,
        name: 'New Track',
        nodeIds: []
      };
      onTrackAdd(newTrack);
    }
  };

  return (
    <div 
      className="workflow-designer"
      ref={containerRef}
      onClick={handleBackgroundClick}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        minHeight: '600px',
        backgroundColor: '#f5f5f5',
        overflow: 'auto'
      }}
    >
      {/* Render tracks */}
      {workflow.tracks.map(track => (
        <TrackComponent
          key={track.id}
          track={track}
          selected={selectedTrackId === track.id}
          onClick={handleTrackClick}
          onDelete={handleTrackDelete}
          readOnly={readOnly}
        />
      ))}
      
      {/* Render dependencies */}
      {workflow.dependencies.map(dependency => (
        <DependencyComponent
          key={`${dependency.sourceId}-${dependency.targetId}`}
          dependency={dependency}
          sourceNode={workflow.nodes.find(n => n.id === dependency.sourceId)}
          targetNode={workflow.nodes.find(n => n.id === dependency.targetId)}
          onDelete={handleDependencyDelete}
          readOnly={readOnly}
        />
      ))}
      
      {/* Render dependency being created */}
      {creatingDependency && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <line
            x1={workflow.nodes.find(n => n.id === creatingDependency.sourceId)?.position?.x || 0}
            y1={workflow.nodes.find(n => n.id === creatingDependency.sourceId)?.position?.y || 0}
            x2={mousePosition.x}
            y2={mousePosition.y}
            stroke="#666"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
        </svg>
      )}
      
      {/* Render nodes */}
      {workflow.nodes.map(node => (
        <NodeComponent
          key={node.id}
          node={node}
          selected={selectedNodeId === node.id}
          onClick={handleNodeClick}
          onDragStart={handleNodeDragStart}
          onDependencyStart={handleDependencyStart}
          onDependencyEnd={handleDependencyEnd}
          onDelete={handleNodeDelete}
          readOnly={readOnly}
        />
      ))}
      
      {/* Toolbar for adding nodes and tracks */}
      {!readOnly && (
        <div 
          className="workflow-toolbar"
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            display: 'flex',
            gap: '10px',
            padding: '10px',
            backgroundColor: 'white',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          <button onClick={() => handleAddNode(NodeType.START)}>Add Start</button>
          <button onClick={() => handleAddNode(NodeType.TASK)}>Add Task</button>
          <button onClick={() => handleAddNode(NodeType.DECISION)}>Add Decision</button>
          <button onClick={() => handleAddNode(NodeType.SYNC_POINT)}>Add Sync Point</button>
          <button onClick={() => handleAddNode(NodeType.END)}>Add End</button>
          <button onClick={handleAddTrack}>Add Track</button>
        </div>
      )}
    </div>
  );
};

