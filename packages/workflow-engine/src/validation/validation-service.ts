import { injectable, inject, multiInject, optional } from 'inversify';
import { 
  Workflow, 
  ValidationResult, 
  ValidationError,
  NodeId
} from '../core/types';
import { ValidationErrorCode } from '../core/constants';
import { WorkflowValidator } from './validators/workflow-validator';

/**
 * Service for validating workflows
 */
@injectable()
export class ValidationService {
  constructor(
    @multiInject(WorkflowValidator) @optional() private validators: WorkflowValidator[] = []
  ) {}

  /**
   * Register a validator
   */
  registerValidator(validator: WorkflowValidator): void {
    this.validators.push(validator);
  }

  /**
   * Validate a workflow
   */
  validateWorkflow(workflow: Workflow): ValidationResult {
    const errors: ValidationError[] = [];

    // Run all registered validators
    for (const validator of this.validators) {
      const validationErrors = validator.validate(workflow);
      errors.push(...validationErrors);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check for circular dependencies in the workflow
   */
  checkCircularDependencies(workflow: Workflow): ValidationError[] {
    const errors: ValidationError[] = [];
    const visited = new Set<NodeId>();
    const recursionStack = new Set<NodeId>();

    // Helper function for DFS traversal
    const dfs = (nodeId: NodeId, path: NodeId[] = []): boolean => {
      // If node is already in recursion stack, we found a cycle
      if (recursionStack.has(nodeId)) {
        // Find the start of the cycle in the path
        const cycleStartIndex = path.findIndex(id => id === nodeId);
        const cycle = path.slice(cycleStartIndex).concat(nodeId);
        
        errors.push({
          code: ValidationErrorCode.CIRCULAR_DEPENDENCY,
          message: `Circular dependency detected: ${cycle.join(' -> ')}`,
          dependencyIds: cycle.map((id, index) => {
            const nextIndex = (index + 1) % cycle.length;
            return `${id}->${cycle[nextIndex]}`;
          })
        });
        return true;
      }

      // If node is already visited and not in recursion stack, no cycle through this node
      if (visited.has(nodeId)) {
        return false;
      }

      // Mark node as visited and add to recursion stack
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      // Visit all adjacent nodes
      const outgoingDependencies = workflow.dependencies.filter(dep => dep.sourceId === nodeId);
      for (const dep of outgoingDependencies) {
        if (dfs(dep.targetId, [...path])) {
          return true;
        }
      }

      // Remove node from recursion stack
      recursionStack.delete(nodeId);
      return false;
    };

    // Start DFS from each node that hasn't been visited yet
    for (const node of workflow.nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    }

    return errors;
  }

  /**
   * Check for orphaned nodes (nodes with no incoming or outgoing dependencies)
   */
  checkOrphanedNodes(workflow: Workflow): ValidationError[] {
    const errors: ValidationError[] = [];
    const startNodeIds = workflow.nodes
      .filter(node => node.type === 'start')
      .map(node => node.id);
    const endNodeIds = workflow.nodes
      .filter(node => node.type === 'end')
      .map(node => node.id);

    // Skip start and end nodes in orphan check
    const nonTerminalNodes = workflow.nodes.filter(
      node => !startNodeIds.includes(node.id) && !endNodeIds.includes(node.id)
    );

    for (const node of nonTerminalNodes) {
      const hasIncoming = workflow.dependencies.some(dep => dep.targetId === node.id);
      const hasOutgoing = workflow.dependencies.some(dep => dep.sourceId === node.id);

      if (!hasIncoming && !hasOutgoing) {
        errors.push({
          code: ValidationErrorCode.ORPHANED_NODE,
          message: `Node "${node.name}" (${node.id}) is orphaned with no connections`,
          nodeId: node.id
        });
      }
    }

    return errors;
  }
}

