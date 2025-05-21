import { injectable } from 'inversify';
import { Track, TrackId, NodeId } from '../types';

/**
 * Model for workflow tracks (parallel execution paths)
 */
@injectable()
export class TrackModel implements Track {
  id: TrackId;
  name: string;
  description?: string;
  nodeIds: NodeId[] = [];
  metadata?: Record<string, any>;

  constructor(track: Partial<Track> = {}) {
    this.id = track.id || this.generateId();
    this.name = track.name || 'New Track';
    this.description = track.description;
    this.nodeIds = track.nodeIds || [];
    this.metadata = track.metadata;
  }

  /**
   * Generate a unique track ID
   */
  private generateId(): TrackId {
    return `track-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  /**
   * Add a node to the track
   */
  addNode(nodeId: NodeId): void {
    if (!this.nodeIds.includes(nodeId)) {
      this.nodeIds.push(nodeId);
    }
  }

  /**
   * Remove a node from the track
   */
  removeNode(nodeId: NodeId): boolean {
    const initialLength = this.nodeIds.length;
    this.nodeIds = this.nodeIds.filter(id => id !== nodeId);
    return this.nodeIds.length !== initialLength;
  }

  /**
   * Check if the track contains a specific node
   */
  containsNode(nodeId: NodeId): boolean {
    return this.nodeIds.includes(nodeId);
  }

  /**
   * Clear all nodes from the track
   */
  clearNodes(): void {
    this.nodeIds = [];
  }

  /**
   * Clone the track
   */
  clone(): TrackModel {
    return new TrackModel({
      id: this.id,
      name: this.name,
      description: this.description,
      nodeIds: [...this.nodeIds],
      metadata: this.metadata ? { ...this.metadata } : undefined
    });
  }
}

