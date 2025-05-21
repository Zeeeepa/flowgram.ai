import { injectable } from 'inversify';
import {
  WorkflowNode,
  NodeId,
  NodeType,
  Position,
  Size,
  ResourceRequirement,
  TaskNode,
  DecisionNode,
  SyncPointNode,
  StartNode,
  EndNode,
  Condition,
  SyncPointConfig,
  TrackId
} from '../types';
import { DEFAULT_NODE_SIZE } from '../constants';

/**
 * Base class for all node models
 */
@injectable()
export abstract class NodeModel implements WorkflowNode {
  id: NodeId;
  type: NodeType;
  name: string;
  description?: string;
  trackId?: TrackId;
  position?: Position;
  size?: Size;
  resourceRequirements?: ResourceRequirement[];
  metadata?: Record<string, any>;

  constructor(node: Partial<WorkflowNode>) {
    this.id = node.id || this.generateId();
    this.type = node.type || NodeType.TASK;
    this.name = node.name || 'New Node';
    this.description = node.description;
    this.trackId = node.trackId;
    this.position = node.position || { x: 0, y: 0 };
    this.size = node.size || { ...DEFAULT_NODE_SIZE };
    this.resourceRequirements = node.resourceRequirements || [];
    this.metadata = node.metadata;
  }

  /**
   * Generate a unique node ID
   */
  protected generateId(): NodeId {
    return `node-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  /**
   * Add a resource requirement to the node
   */
  addResourceRequirement(requirement: ResourceRequirement): void {
    if (!this.resourceRequirements) {
      this.resourceRequirements = [];
    }
    this.resourceRequirements.push(requirement);
  }

  /**
   * Remove a resource requirement
   */
  removeResourceRequirement(index: number): boolean {
    if (!this.resourceRequirements || index >= this.resourceRequirements.length) {
      return false;
    }
    this.resourceRequirements.splice(index, 1);
    return true;
  }

  /**
   * Update the node position
   */
  updatePosition(position: Position): void {
    this.position = { ...position };
  }

  /**
   * Update the node size
   */
  updateSize(size: Size): void {
    this.size = { ...size };
  }

  /**
   * Assign the node to a track
   */
  assignToTrack(trackId: TrackId): void {
    this.trackId = trackId;
  }

  /**
   * Remove the node from its track
   */
  removeFromTrack(): void {
    this.trackId = undefined;
  }

  /**
   * Clone the node
   */
  abstract clone(): NodeModel;
}

/**
 * Model for task nodes
 */
@injectable()
export class TaskNodeModel extends NodeModel implements TaskNode {
  type: NodeType.TASK = NodeType.TASK;
  taskType: string;
  parameters?: Record<string, any>;
  timeout?: number;
  retries?: number;

  constructor(node: Partial<TaskNode>) {
    super(node);
    this.taskType = node.taskType || 'default';
    this.parameters = node.parameters;
    this.timeout = node.timeout;
    this.retries = node.retries;
  }

  /**
   * Clone the task node
   */
  clone(): TaskNodeModel {
    return new TaskNodeModel({
      ...this,
      parameters: this.parameters ? { ...this.parameters } : undefined,
      resourceRequirements: this.resourceRequirements ? [...this.resourceRequirements] : undefined,
      metadata: this.metadata ? { ...this.metadata } : undefined
    });
  }
}

/**
 * Model for decision nodes
 */
@injectable()
export class DecisionNodeModel extends NodeModel implements DecisionNode {
  type: NodeType.DECISION = NodeType.DECISION;
  conditions: Condition[] = [];
  defaultTargetId?: NodeId;

  constructor(node: Partial<DecisionNode>) {
    super(node);
    this.conditions = node.conditions || [];
    this.defaultTargetId = node.defaultTargetId;
  }

  /**
   * Add a condition to the decision node
   */
  addCondition(condition: Condition): void {
    this.conditions.push(condition);
  }

  /**
   * Remove a condition
   */
  removeCondition(index: number): boolean {
    if (index >= this.conditions.length) {
      return false;
    }
    this.conditions.splice(index, 1);
    return true;
  }

  /**
   * Set the default target node
   */
  setDefaultTarget(nodeId: NodeId): void {
    this.defaultTargetId = nodeId;
  }

  /**
   * Clone the decision node
   */
  clone(): DecisionNodeModel {
    return new DecisionNodeModel({
      ...this,
      conditions: [...this.conditions],
      resourceRequirements: this.resourceRequirements ? [...this.resourceRequirements] : undefined,
      metadata: this.metadata ? { ...this.metadata } : undefined
    });
  }
}

/**
 * Model for synchronization point nodes
 */
@injectable()
export class SyncPointNodeModel extends NodeModel implements SyncPointNode {
  type: NodeType.SYNC_POINT = NodeType.SYNC_POINT;
  config: SyncPointConfig;

  constructor(node: Partial<SyncPointNode>) {
    super(node);
    this.config = node.config || {
      requiredSources: [],
      waitForAll: true
    };
  }

  /**
   * Add a required source node
   */
  addRequiredSource(nodeId: NodeId): void {
    if (!this.config.requiredSources.includes(nodeId)) {
      this.config.requiredSources.push(nodeId);
    }
  }

  /**
   * Remove a required source node
   */
  removeRequiredSource(nodeId: NodeId): boolean {
    const initialLength = this.config.requiredSources.length;
    this.config.requiredSources = this.config.requiredSources.filter(id => id !== nodeId);
    return this.config.requiredSources.length !== initialLength;
  }

  /**
   * Set whether to wait for all required sources
   */
  setWaitForAll(waitForAll: boolean): void {
    this.config.waitForAll = waitForAll;
  }

  /**
   * Set the timeout for the synchronization point
   */
  setTimeout(timeout: number): void {
    this.config.timeout = timeout;
  }

  /**
   * Clone the sync point node
   */
  clone(): SyncPointNodeModel {
    return new SyncPointNodeModel({
      ...this,
      config: {
        ...this.config,
        requiredSources: [...this.config.requiredSources],
        metadata: this.config.metadata ? { ...this.config.metadata } : undefined
      },
      resourceRequirements: this.resourceRequirements ? [...this.resourceRequirements] : undefined,
      metadata: this.metadata ? { ...this.metadata } : undefined
    });
  }
}

/**
 * Model for start nodes
 */
@injectable()
export class StartNodeModel extends NodeModel implements StartNode {
  type: NodeType.START = NodeType.START;

  constructor(node: Partial<StartNode> = {}) {
    super({
      ...node,
      name: node.name || 'Start',
      type: NodeType.START
    });
  }

  /**
   * Clone the start node
   */
  clone(): StartNodeModel {
    return new StartNodeModel({
      ...this,
      resourceRequirements: this.resourceRequirements ? [...this.resourceRequirements] : undefined,
      metadata: this.metadata ? { ...this.metadata } : undefined
    });
  }
}

/**
 * Model for end nodes
 */
@injectable()
export class EndNodeModel extends NodeModel implements EndNode {
  type: NodeType.END = NodeType.END;

  constructor(node: Partial<EndNode> = {}) {
    super({
      ...node,
      name: node.name || 'End',
      type: NodeType.END
    });
  }

  /**
   * Clone the end node
   */
  clone(): EndNodeModel {
    return new EndNodeModel({
      ...this,
      resourceRequirements: this.resourceRequirements ? [...this.resourceRequirements] : undefined,
      metadata: this.metadata ? { ...this.metadata } : undefined
    });
  }
}

/**
 * Factory function to create the appropriate node model based on type
 */
export function createNodeModel(node: Partial<WorkflowNode>): NodeModel {
  switch (node.type) {
    case NodeType.TASK:
      return new TaskNodeModel(node as Partial<TaskNode>);
    case NodeType.DECISION:
      return new DecisionNodeModel(node as Partial<DecisionNode>);
    case NodeType.SYNC_POINT:
      return new SyncPointNodeModel(node as Partial<SyncPointNode>);
    case NodeType.START:
      return new StartNodeModel(node as Partial<StartNode>);
    case NodeType.END:
      return new EndNodeModel(node as Partial<EndNode>);
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

