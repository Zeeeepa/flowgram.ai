import { 
  Workflow, 
  NodeType, 
  DependencyType, 
  ResourceType 
} from '../core/types';

/**
 * Example of a simple data processing workflow
 */
export const simpleWorkflow: Workflow = {
  id: 'workflow-example-1',
  name: 'Simple Data Processing',
  description: 'A simple workflow for processing data',
  version: '1.0.0',
  nodes: [
    {
      id: 'node-1',
      type: NodeType.START,
      name: 'Start',
      position: { x: 100, y: 100 },
      size: { width: 120, height: 60 }
    },
    {
      id: 'node-2',
      type: NodeType.TASK,
      name: 'Load Data',
      taskType: 'data_loader',
      parameters: {
        source: 'database',
        table: 'customers'
      },
      position: { x: 100, y: 200 },
      size: { width: 120, height: 60 },
      resourceRequirements: [
        {
          resourceType: ResourceType.CPU,
          amount: 1
        },
        {
          resourceType: ResourceType.MEMORY,
          amount: 2048
        }
      ]
    },
    {
      id: 'node-3',
      type: NodeType.TASK,
      name: 'Transform Data',
      taskType: 'data_transformer',
      parameters: {
        operations: ['filter', 'normalize']
      },
      position: { x: 100, y: 300 },
      size: { width: 120, height: 60 },
      resourceRequirements: [
        {
          resourceType: ResourceType.CPU,
          amount: 2
        },
        {
          resourceType: ResourceType.MEMORY,
          amount: 4096
        }
      ]
    },
    {
      id: 'node-4',
      type: NodeType.DECISION,
      name: 'Quality Check',
      conditions: [
        {
          leftOperand: 'quality_score',
          operator: 'greater_than',
          rightOperand: 0.8
        }
      ],
      defaultTargetId: 'node-6',
      position: { x: 100, y: 400 },
      size: { width: 120, height: 60 }
    },
    {
      id: 'node-5',
      type: NodeType.TASK,
      name: 'Analyze Data',
      taskType: 'data_analyzer',
      parameters: {
        analysis_type: 'statistical'
      },
      position: { x: 300, y: 500 },
      size: { width: 120, height: 60 },
      resourceRequirements: [
        {
          resourceType: ResourceType.CPU,
          amount: 4
        },
        {
          resourceType: ResourceType.MEMORY,
          amount: 8192
        }
      ]
    },
    {
      id: 'node-6',
      type: NodeType.TASK,
      name: 'Handle Error',
      taskType: 'error_handler',
      parameters: {
        error_type: 'quality',
        notify: true
      },
      position: { x: -100, y: 500 },
      size: { width: 120, height: 60 }
    },
    {
      id: 'node-7',
      type: NodeType.END,
      name: 'End',
      position: { x: 100, y: 600 },
      size: { width: 120, height: 60 }
    }
  ],
  dependencies: [
    {
      sourceId: 'node-1',
      targetId: 'node-2',
      type: DependencyType.SEQUENTIAL
    },
    {
      sourceId: 'node-2',
      targetId: 'node-3',
      type: DependencyType.SEQUENTIAL
    },
    {
      sourceId: 'node-3',
      targetId: 'node-4',
      type: DependencyType.SEQUENTIAL
    },
    {
      sourceId: 'node-4',
      targetId: 'node-5',
      type: DependencyType.CONDITIONAL,
      condition: {
        leftOperand: 'quality_score',
        operator: 'greater_than',
        rightOperand: 0.8
      }
    },
    {
      sourceId: 'node-4',
      targetId: 'node-6',
      type: DependencyType.CONDITIONAL
    },
    {
      sourceId: 'node-5',
      targetId: 'node-7',
      type: DependencyType.SEQUENTIAL
    },
    {
      sourceId: 'node-6',
      targetId: 'node-7',
      type: DependencyType.SEQUENTIAL
    }
  ],
  tracks: []
};

