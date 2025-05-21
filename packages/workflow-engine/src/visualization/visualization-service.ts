import { injectable } from 'inversify';
import { 
  Workflow, 
  WorkflowNode, 
  NodeId, 
  Track, 
  TrackId, 
  Position, 
  Size,
  NodeType
} from '../core/types';
import { DEFAULT_NODE_SIZE, DEFAULT_TRACK_SPACING, DEFAULT_NODE_SPACING } from '../core/constants';

/**
 * Service for workflow visualization layout
 */
@injectable()
export class VisualizationService {
  /**
   * Calculate layout positions for all nodes in a workflow
   */
  calculateLayout(workflow: Workflow): Workflow {
    // Clone the workflow to avoid modifying the original
    const result = { ...workflow, nodes: [...workflow.nodes] };
    
    // If there are tracks, use track-based layout
    if (workflow.tracks.length > 0) {
      this.calculateTrackBasedLayout(result);
    } else {
      // Otherwise use a simple top-down layout
      this.calculateSimpleLayout(result);
    }
    
    return result;
  }

  /**
   * Calculate layout based on tracks (parallel execution paths)
   */
  private calculateTrackBasedLayout(workflow: Workflow): void {
    const trackMap = new Map<TrackId, Track>();
    workflow.tracks.forEach(track => trackMap.set(track.id, track));
    
    // Group nodes by track
    const nodesByTrack = new Map<TrackId, WorkflowNode[]>();
    workflow.tracks.forEach(track => nodesByTrack.set(track.id, []));
    
    // Add nodes without a track to a special "default" track
    nodesByTrack.set('default', []);
    
    workflow.nodes.forEach(node => {
      if (node.trackId && nodesByTrack.has(node.trackId)) {
        nodesByTrack.get(node.trackId)!.push(node);
      } else {
        nodesByTrack.get('default')!.push(node);
      }
    });
    
    // Calculate node levels within each track
    const nodeLevels = this.calculateNodeLevels(workflow);
    
    // Position nodes based on track and level
    let trackIndex = 0;
    nodesByTrack.forEach((nodes, trackId) => {
      if (nodes.length === 0) return;
      
      const trackX = trackIndex * DEFAULT_TRACK_SPACING;
      trackIndex++;
      
      nodes.forEach(node => {
        const level = nodeLevels.get(node.id) || 0;
        const nodeIndex = nodes.filter(n => nodeLevels.get(n.id) === level).indexOf(node);
        
        const x = trackX + nodeIndex * 50; // Offset nodes at the same level
        const y = level * DEFAULT_NODE_SPACING;
        
        // Update node position
        const nodeIndex2 = workflow.nodes.findIndex(n => n.id === node.id);
        if (nodeIndex2 !== -1) {
          workflow.nodes[nodeIndex2] = {
            ...node,
            position: { x, y },
            size: node.size || { ...DEFAULT_NODE_SIZE }
          };
        }
      });
    });
  }

  /**
   * Calculate a simple top-down layout
   */
  private calculateSimpleLayout(workflow: Workflow): void {
    // Calculate node levels
    const nodeLevels = this.calculateNodeLevels(workflow);
    
    // Group nodes by level
    const nodesByLevel = new Map<number, WorkflowNode[]>();
    workflow.nodes.forEach(node => {
      const level = nodeLevels.get(node.id) || 0;
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(node);
    });
    
    // Position nodes based on level
    nodesByLevel.forEach((nodes, level) => {
      const levelWidth = nodes.length * DEFAULT_NODE_SIZE.width;
      const startX = -levelWidth / 2;
      
      nodes.forEach((node, index) => {
        const x = startX + index * DEFAULT_NODE_SIZE.width + index * 20; // 20px spacing
        const y = level * DEFAULT_NODE_SPACING;
        
        // Update node position
        const nodeIndex = workflow.nodes.findIndex(n => n.id === node.id);
        if (nodeIndex !== -1) {
          workflow.nodes[nodeIndex] = {
            ...node,
            position: { x, y },
            size: node.size || { ...DEFAULT_NODE_SIZE }
          };
        }
      });
    });
  }

  /**
   * Calculate the level of each node in the workflow
   */
  private calculateNodeLevels(workflow: Workflow): Map<NodeId, number> {
    const levels = new Map<NodeId, number>();
    const visited = new Set<NodeId>();
    
    // Find start nodes
    const startNodes = workflow.nodes.filter(node => node.type === NodeType.START);
    if (startNodes.length === 0) return levels;
    
    // Initialize with start nodes at level 0
    startNodes.forEach(node => {
      levels.set(node.id, 0);
      visited.add(node.id);
    });
    
    // BFS to assign levels
    const queue: NodeId[] = startNodes.map(node => node.id);
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const level = levels.get(nodeId)!;
      
      // Find all nodes that depend on this node
      const outgoingDeps = workflow.dependencies.filter(dep => dep.sourceId === nodeId);
      
      for (const dep of outgoingDeps) {
        const targetId = dep.targetId;
        
        // If we haven't visited this node yet, or if we found a longer path
        if (!visited.has(targetId) || levels.get(targetId)! < level + 1) {
          levels.set(targetId, level + 1);
          visited.add(targetId);
          queue.push(targetId);
        }
      }
    }
    
    return levels;
  }
}

