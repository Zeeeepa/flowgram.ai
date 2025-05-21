import { injectable } from 'inversify';
import { 
  Workflow, 
  WorkflowNode, 
  NodeType, 
  Track, 
  Dependency, 
  DependencyType, 
  Condition, 
  ConditionOperator, 
  ResourceRequirement, 
  ResourceType,
  TaskNode,
  DecisionNode,
  SyncPointNode
} from '../core/types';

/**
 * Generator for the workflow DSL
 */
@injectable()
export class DslGenerator {
  /**
   * Generate a DSL string from a workflow
   */
  generate(workflow: Workflow): string {
    let dsl = '';
    
    // Workflow header
    dsl += `workflow "${workflow.name}" {\n`;
    
    // Workflow properties
    if (workflow.description) {
      dsl += `  description "${workflow.description}"\n`;
    }
    
    if (workflow.version) {
      dsl += `  version "${workflow.version}"\n`;
    }
    
    dsl += '\n';
    
    // Tracks
    if (workflow.tracks.length > 0) {
      dsl += '  // Define tracks for parallel execution\n';
      for (const track of workflow.tracks) {
        dsl += this.generateTrack(track, 2);
        dsl += '\n';
      }
    }
    
    // Nodes
    if (workflow.nodes.length > 0) {
      dsl += '  // Define nodes\n';
      for (const node of workflow.nodes) {
        dsl += this.generateNode(node, 2);
        dsl += '\n';
      }
    }
    
    // Dependencies
    if (workflow.dependencies.length > 0) {
      dsl += '  // Define dependencies\n';
      dsl += this.generateDependencies(workflow.dependencies, workflow.nodes, 2);
    }
    
    dsl += '}\n';
    
    return dsl;
  }

  /**
   * Generate DSL for a track
   */
  private generateTrack(track: Track, indent: number): string {
    const spaces = ' '.repeat(indent);
    let dsl = `${spaces}track "${track.name}" {\n`;
    
    if (track.description) {
      dsl += `${spaces}  description "${track.description}"\n`;
    }
    
    dsl += `${spaces}}\n`;
    
    return dsl;
  }

  /**
   * Generate DSL for a node
   */
  private generateNode(node: WorkflowNode, indent: number): string {
    const spaces = ' '.repeat(indent);
    let dsl = '';
    
    switch (node.type) {
      case NodeType.START:
        dsl += `${spaces}start "${node.name}" {\n`;
        break;
      case NodeType.END:
        dsl += `${spaces}end "${node.name}" {\n`;
        break;
      case NodeType.TASK:
        dsl += `${spaces}task "${node.name}" {\n`;
        break;
      case NodeType.DECISION:
        dsl += `${spaces}decision "${node.name}" {\n`;
        break;
      case NodeType.SYNC_POINT:
        dsl += `${spaces}sync "${node.name}" {\n`;
        break;
    }
    
    if (node.description) {
      dsl += `${spaces}  description "${node.description}"\n`;
    }
    
    if (node.trackId) {
      dsl += `${spaces}  track "${node.trackId}"\n`;
    }
    
    // Type-specific properties
    switch (node.type) {
      case NodeType.TASK:
        dsl += this.generateTaskProperties(node as TaskNode, indent + 2);
        break;
      case NodeType.DECISION:
        dsl += this.generateDecisionProperties(node as DecisionNode, indent + 2);
        break;
      case NodeType.SYNC_POINT:
        dsl += this.generateSyncPointProperties(node as SyncPointNode, indent + 2);
        break;
    }
    
    // Resource requirements
    if (node.resourceRequirements && node.resourceRequirements.length > 0) {
      dsl += `${spaces}  resources {\n`;
      for (const resource of node.resourceRequirements) {
        dsl += this.generateResourceRequirement(resource, indent + 4);
      }
      dsl += `${spaces}  }\n`;
    }
    
    dsl += `${spaces}}\n`;
    
    return dsl;
  }

  /**
   * Generate DSL for task node properties
   */
  private generateTaskProperties(node: TaskNode, indent: number): string {
    const spaces = ' '.repeat(indent);
    let dsl = '';
    
    if (node.taskType) {
      dsl += `${spaces}type "${node.taskType}"\n`;
    }
    
    if (node.parameters) {
      dsl += `${spaces}parameters {\n`;
      for (const [key, value] of Object.entries(node.parameters)) {
        dsl += `${spaces}  ${key}: ${this.stringifyValue(value)}\n`;
      }
      dsl += `${spaces}}\n`;
    }
    
    if (node.timeout !== undefined) {
      dsl += `${spaces}timeout ${node.timeout}\n`;
    }
    
    if (node.retries !== undefined) {
      dsl += `${spaces}retries ${node.retries}\n`;
    }
    
    return dsl;
  }

  /**
   * Generate DSL for decision node properties
   */
  private generateDecisionProperties(node: DecisionNode, indent: number): string {
    const spaces = ' '.repeat(indent);
    let dsl = '';
    
    if (node.conditions && node.conditions.length > 0) {
      for (const condition of node.conditions) {
        dsl += `${spaces}condition "${this.generateConditionExpression(condition)}" then "${condition.metadata?.targetName || ''}"\n`;
      }
    }
    
    if (node.defaultTargetId) {
      dsl += `${spaces}default "${node.defaultTargetId}"\n`;
    }
    
    return dsl;
  }

  /**
   * Generate DSL for sync point node properties
   */
  private generateSyncPointProperties(node: SyncPointNode, indent: number): string {
    const spaces = ' '.repeat(indent);
    let dsl = '';
    
    if (node.config) {
      if (node.config.waitForAll !== undefined) {
        dsl += `${spaces}wait_for_all ${node.config.waitForAll}\n`;
      }
      
      if (node.config.timeout !== undefined) {
        dsl += `${spaces}timeout ${node.config.timeout}\n`;
      }
    }
    
    return dsl;
  }

  /**
   * Generate DSL for resource requirements
   */
  private generateResourceRequirement(resource: ResourceRequirement, indent: number): string {
    const spaces = ' '.repeat(indent);
    let resourceName: string;
    
    switch (resource.resourceType) {
      case ResourceType.CPU:
        resourceName = 'cpu';
        break;
      case ResourceType.MEMORY:
        resourceName = 'memory';
        break;
      case ResourceType.GPU:
        resourceName = 'gpu';
        break;
      case ResourceType.CUSTOM:
        resourceName = resource.resourceId || 'custom';
        break;
    }
    
    return `${spaces}${resourceName}: ${resource.amount}\n`;
  }

  /**
   * Generate DSL for dependencies
   */
  private generateDependencies(dependencies: Dependency[], nodes: WorkflowNode[], indent: number): string {
    const spaces = ' '.repeat(indent);
    let dsl = `${spaces}dependencies {\n`;
    
    // Create a map of node IDs to names for easier lookup
    const nodeMap = new Map<string, string>();
    for (const node of nodes) {
      nodeMap.set(node.id, node.name);
    }
    
    for (const dep of dependencies) {
      const sourceName = nodeMap.get(dep.sourceId) || dep.sourceId;
      const targetName = nodeMap.get(dep.targetId) || dep.targetId;
      
      dsl += `${spaces}  "${sourceName}" -> "${targetName}"`;
      
      if (dep.type === DependencyType.CONDITIONAL && dep.condition) {
        dsl += ` when "${this.generateConditionExpression(dep.condition)}"`;
      } else if (dep.type === DependencyType.CONDITIONAL && !dep.condition) {
        dsl += ` default`;
      }
      
      dsl += '\n';
    }
    
    dsl += `${spaces}}\n`;
    
    return dsl;
  }

  /**
   * Generate a condition expression
   */
  private generateConditionExpression(condition: Condition): string {
    let operator: string;
    
    switch (condition.operator) {
      case ConditionOperator.EQUALS:
        operator = '==';
        break;
      case ConditionOperator.NOT_EQUALS:
        operator = '!=';
        break;
      case ConditionOperator.GREATER_THAN:
        operator = '>';
        break;
      case ConditionOperator.LESS_THAN:
        operator = '<';
        break;
      case ConditionOperator.GREATER_THAN_OR_EQUALS:
        operator = '>=';
        break;
      case ConditionOperator.LESS_THAN_OR_EQUALS:
        operator = '<=';
        break;
      case ConditionOperator.CONTAINS:
        operator = 'contains';
        break;
      case ConditionOperator.NOT_CONTAINS:
        operator = 'not_contains';
        break;
      case ConditionOperator.STARTS_WITH:
        operator = 'starts_with';
        break;
      case ConditionOperator.ENDS_WITH:
        operator = 'ends_with';
        break;
      case ConditionOperator.REGEX:
        operator = 'regex';
        break;
    }
    
    return `${condition.leftOperand} ${operator} ${this.stringifyValue(condition.rightOperand)}`;
  }

  /**
   * Stringify a value for DSL output
   */
  private stringifyValue(value: any): string {
    if (typeof value === 'string') {
      return `"${value}"`;
    } else if (Array.isArray(value)) {
      return `[${value.map(v => this.stringifyValue(v)).join(', ')}]`;
    } else if (typeof value === 'object' && value !== null) {
      let result = '{\n';
      for (const [k, v] of Object.entries(value)) {
        result += `    ${k}: ${this.stringifyValue(v)}\n`;
      }
      result += '  }';
      return result;
    } else {
      return String(value);
    }
  }
}

