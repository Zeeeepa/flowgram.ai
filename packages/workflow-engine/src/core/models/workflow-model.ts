import { injectable } from 'inversify';
import { 
  Workflow, 
  WorkflowId, 
  WorkflowNode, 
  NodeId, 
  Dependency, 
  Track, 
  TrackId,
  NodeType,
  StartNode,
  EndNode
} from '../types';

/**
 * Core model representing a workflow
 */
@injectable()
export class WorkflowModel implements Workflow {
  id: WorkflowId;
  name: string;
  description?: string;
  version?: string;
  nodes: WorkflowNode[] = [];
  dependencies: Dependency[] = [];
  tracks: Track[] = [];
  metadata?: Record<string, any>;

  constructor(workflow?: Partial<Workflow>) {
    if (workflow) {
      this.id = workflow.id || this.generateId();
      this.name = workflow.name || 'New Workflow';
      this.description = workflow.description;
      this.version = workflow.version || '1.0.0';
      this.nodes = workflow.nodes || [];
      this.dependencies = workflow.dependencies || [];
      this.tracks = workflow.tracks || [];
      this.metadata = workflow.metadata;
    } else {
      this.id = this.generateId();
      this.name = 'New Workflow';
      this.version = '1.0.0';
    }
  }

  /**
   * Generate a unique workflow ID
   */
  private generateId(): WorkflowId {
    return `workflow-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  /**
   * Add a node to the workflow
   */
  addNode(node: WorkflowNode): WorkflowNode {
    this.nodes.push(node);
    return node;
  }

  /**
   * Remove a node from the workflow
   */
  removeNode(nodeId: NodeId): boolean {
    const initialLength = this.nodes.length;
    this.nodes = this.nodes.filter(node => node.id !== nodeId);
    
    // Also remove any dependencies involving this node
    this.dependencies = this.dependencies.filter(
      dep => dep.sourceId !== nodeId && dep.targetId !== nodeId
    );
    
    // Remove node from any tracks
    this.tracks.forEach(track => {
      track.nodeIds = track.nodeIds.filter(id => id !== nodeId);
    });
    
    return this.nodes.length !== initialLength;
  }

  /**
   * Get a node by ID
   */
  getNode(nodeId: NodeId): WorkflowNode | undefined {
    return this.nodes.find(node => node.id === nodeId);
  }

  /**
   * Add a dependency between nodes
   */
  addDependency(dependency: Dependency): Dependency {
    this.dependencies.push(dependency);
    return dependency;
  }

  /**
   * Remove a dependency
   */
  removeDependency(sourceId: NodeId, targetId: NodeId): boolean {
    const initialLength = this.dependencies.length;
    this.dependencies = this.dependencies.filter(
      dep => !(dep.sourceId === sourceId && dep.targetId === targetId)
    );
    return this.dependencies.length !== initialLength;
  }

  /**
   * Add a track for parallel execution
   */
  addTrack(track: Track): Track {
    this.tracks.push(track);
    return track;
  }

  /**
   * Remove a track
   */
  removeTrack(trackId: TrackId): boolean {
    const initialLength = this.tracks.length;
    this.tracks = this.tracks.filter(track => track.id !== trackId);
    return this.tracks.length !== initialLength;
  }

  /**
   * Get a track by ID
   */
  getTrack(trackId: TrackId): Track | undefined {
    return this.tracks.find(track => track.id === trackId);
  }

  /**
   * Get all nodes in a specific track
   */
  getNodesInTrack(trackId: TrackId): WorkflowNode[] {
    const track = this.getTrack(trackId);
    if (!track) return [];
    
    return this.nodes.filter(node => track.nodeIds.includes(node.id));
  }

  /**
   * Get all dependencies for a specific node
   */
  getDependenciesForNode(nodeId: NodeId): Dependency[] {
    return this.dependencies.filter(
      dep => dep.sourceId === nodeId || dep.targetId === nodeId
    );
  }

  /**
   * Get incoming dependencies for a node
   */
  getIncomingDependencies(nodeId: NodeId): Dependency[] {
    return this.dependencies.filter(dep => dep.targetId === nodeId);
  }

  /**
   * Get outgoing dependencies for a node
   */
  getOutgoingDependencies(nodeId: NodeId): Dependency[] {
    return this.dependencies.filter(dep => dep.sourceId === nodeId);
  }

  /**
   * Get the start node of the workflow
   */
  getStartNode(): StartNode | undefined {
    return this.nodes.find(node => node.type === NodeType.START) as StartNode | undefined;
  }

  /**
   * Get all end nodes of the workflow
   */
  getEndNodes(): EndNode[] {
    return this.nodes.filter(node => node.type === NodeType.END) as EndNode[];
  }

  /**
   * Check if the workflow has a valid structure
   */
  hasValidStructure(): boolean {
    // Must have at least one start node
    if (!this.getStartNode()) return false;
    
    // Must have at least one end node
    if (this.getEndNodes().length === 0) return false;
    
    // All nodes should be reachable from the start node
    // This would require a more complex traversal algorithm
    
    return true;
  }

  /**
   * Clone the workflow
   */
  clone(): WorkflowModel {
    return new WorkflowModel({
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      nodes: [...this.nodes],
      dependencies: [...this.dependencies],
      tracks: [...this.tracks],
      metadata: this.metadata ? { ...this.metadata } : undefined
    });
  }
}

