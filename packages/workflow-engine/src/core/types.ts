/**
 * Unique identifier for a workflow node
 */
export type NodeId = string;

/**
 * Unique identifier for a workflow track
 */
export type TrackId = string;

/**
 * Unique identifier for a workflow
 */
export type WorkflowId = string;

/**
 * Unique identifier for a resource
 */
export type ResourceId = string;

/**
 * Execution status of a node
 */
export enum NodeStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

/**
 * Type of node in the workflow
 */
export enum NodeType {
  TASK = 'task',
  DECISION = 'decision',
  SYNC_POINT = 'sync_point',
  START = 'start',
  END = 'end',
}

/**
 * Type of dependency between nodes
 */
export enum DependencyType {
  SEQUENTIAL = 'sequential', // Normal sequential dependency
  CONDITIONAL = 'conditional', // Dependency with a condition
  SYNC = 'sync', // Synchronization dependency
}

/**
 * Type of resource requirement
 */
export enum ResourceType {
  CPU = 'cpu',
  MEMORY = 'memory',
  GPU = 'gpu',
  CUSTOM = 'custom',
}

/**
 * Condition operator for decision nodes
 */
export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUALS = 'greater_than_or_equals',
  LESS_THAN_OR_EQUALS = 'less_than_or_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  REGEX = 'regex',
}

/**
 * Position in the workflow visualization
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Size in the workflow visualization
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Resource requirement for a node
 */
export interface ResourceRequirement {
  resourceType: ResourceType;
  amount: number;
  resourceId?: ResourceId;
  metadata?: Record<string, any>;
}

/**
 * Condition for a decision node
 */
export interface Condition {
  leftOperand: string;
  operator: ConditionOperator;
  rightOperand: string | number | boolean;
  metadata?: Record<string, any>;
}

/**
 * Dependency between nodes
 */
export interface Dependency {
  sourceId: NodeId;
  targetId: NodeId;
  type: DependencyType;
  condition?: Condition;
  metadata?: Record<string, any>;
}

/**
 * Synchronization point configuration
 */
export interface SyncPointConfig {
  requiredSources: NodeId[];
  waitForAll: boolean;
  timeout?: number;
  metadata?: Record<string, any>;
}

/**
 * Base interface for all workflow nodes
 */
export interface WorkflowNode {
  id: NodeId;
  type: NodeType;
  name: string;
  description?: string;
  trackId?: TrackId;
  position?: Position;
  size?: Size;
  resourceRequirements?: ResourceRequirement[];
  metadata?: Record<string, any>;
}

/**
 * Task node in a workflow
 */
export interface TaskNode extends WorkflowNode {
  type: NodeType.TASK;
  taskType: string;
  parameters?: Record<string, any>;
  timeout?: number;
  retries?: number;
}

/**
 * Decision node in a workflow
 */
export interface DecisionNode extends WorkflowNode {
  type: NodeType.DECISION;
  conditions: Condition[];
  defaultTargetId?: NodeId;
}

/**
 * Synchronization point node in a workflow
 */
export interface SyncPointNode extends WorkflowNode {
  type: NodeType.SYNC_POINT;
  config: SyncPointConfig;
}

/**
 * Start node in a workflow
 */
export interface StartNode extends WorkflowNode {
  type: NodeType.START;
}

/**
 * End node in a workflow
 */
export interface EndNode extends WorkflowNode {
  type: NodeType.END;
}

/**
 * Track in a workflow for parallel execution
 */
export interface Track {
  id: TrackId;
  name: string;
  description?: string;
  nodeIds: NodeId[];
  metadata?: Record<string, any>;
}

/**
 * Complete workflow definition
 */
export interface Workflow {
  id: WorkflowId;
  name: string;
  description?: string;
  version?: string;
  nodes: WorkflowNode[];
  dependencies: Dependency[];
  tracks: Track[];
  metadata?: Record<string, any>;
}

/**
 * Validation error in a workflow
 */
export interface ValidationError {
  code: string;
  message: string;
  nodeId?: NodeId;
  dependencyIds?: string[];
  trackId?: TrackId;
  metadata?: Record<string, any>;
}

/**
 * Result of workflow validation
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Workflow serialization format
 */
export interface WorkflowSerialized {
  id: WorkflowId;
  name: string;
  description?: string;
  version?: string;
  nodes: Record<NodeId, WorkflowNode>;
  dependencies: Dependency[];
  tracks: Record<TrackId, Track>;
  metadata?: Record<string, any>;
}

