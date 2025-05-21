import { injectable } from 'inversify';
import { Workflow, ValidationError, NodeId } from '../../core/types';
import { ValidationErrorCode } from '../../core/constants';
import { WorkflowValidator } from './workflow-validator';

/**
 * Validator for detecting circular dependencies in workflows
 */
@injectable()
export class CircularDependencyValidator extends WorkflowValidator {
  validate(workflow: Workflow): ValidationError[] {
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
}

