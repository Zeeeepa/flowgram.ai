/**
 * Default node size in the workflow visualization
 */
export const DEFAULT_NODE_SIZE = {
  width: 200,
  height: 80,
};

/**
 * Default track spacing in the workflow visualization
 */
export const DEFAULT_TRACK_SPACING = 200;

/**
 * Default node spacing in the workflow visualization
 */
export const DEFAULT_NODE_SPACING = 100;

/**
 * Maximum number of retries for a task node
 */
export const MAX_RETRIES = 5;

/**
 * Default timeout for task nodes (in milliseconds)
 */
export const DEFAULT_TIMEOUT = 60000;

/**
 * Default timeout for sync points (in milliseconds)
 */
export const DEFAULT_SYNC_TIMEOUT = 300000;

/**
 * Error codes for workflow validation
 */
export enum ValidationErrorCode {
  CIRCULAR_DEPENDENCY = 'circular_dependency',
  MISSING_START_NODE = 'missing_start_node',
  MISSING_END_NODE = 'missing_end_node',
  ORPHANED_NODE = 'orphaned_node',
  INVALID_DEPENDENCY = 'invalid_dependency',
  INVALID_CONDITION = 'invalid_condition',
  INVALID_SYNC_POINT = 'invalid_sync_point',
  INVALID_RESOURCE_REQUIREMENT = 'invalid_resource_requirement',
  DUPLICATE_NODE_ID = 'duplicate_node_id',
  DUPLICATE_TRACK_ID = 'duplicate_track_id',
  MISSING_REQUIRED_FIELD = 'missing_required_field',
}

