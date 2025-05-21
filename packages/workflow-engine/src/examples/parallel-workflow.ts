import { 
  Workflow, 
  NodeType, 
  DependencyType, 
  ResourceType 
} from '../core/types';

/**
 * Example of a parallel data processing workflow with tracks
 */
export const parallelWorkflow: Workflow = {
  id: 'workflow-example-2',
  name: 'Parallel Data Processing',
  description: 'A workflow with parallel execution paths for processing data',
  version: '1.0.0',
  nodes: [
    {
      id: 'node-1',
      type: NodeType.START,
      name: 'Start',
      position: { x: 400, y: 50 },
      size: { width: 120, height: 60 }
    },
    // Track 1: CSV Processing
    {
      id: 'node-2',
      type: NodeType.TASK,
      name: 'Load CSV',
      taskType: 'data_loader',
      parameters: {
        source_type: 'csv',
        path: '/data/input.csv'
      },
      position: { x: 200, y: 150 },
      size: { width: 120, height: 60 },
      trackId: 'track-1',
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
      name: 'Process CSV',
      taskType: 'data_processor',
      parameters: {
        operations: ['clean', 'normalize']
      },
      position: { x: 200, y: 250 },
      size: { width: 120, height: 60 },
      trackId: 'track-1',
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
    // Track 2: JSON Processing
    {
      id: 'node-4',
      type: NodeType.TASK,
      name: 'Load JSON',
      taskType: 'data_loader',
      parameters: {
        source_type: 'json',
        path: '/data/input.json'
      },
      position: { x: 400, y: 150 },
      size: { width: 120, height: 60 },
      trackId: 'track-2',
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
      id: 'node-5',
      type: NodeType.TASK,
      name: 'Process JSON',
      taskType: 'data_processor',
      parameters: {
        operations: ['validate', 'transform']
      },
      position: { x: 400, y: 250 },
      size: { width: 120, height: 60 },
      trackId: 'track-2',
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
    // Track 3: Database Processing
    {
      id: 'node-6',
      type: NodeType.TASK,
      name: 'Load DB Data',
      taskType: 'data_loader',
      parameters: {
        source_type: 'database',
        connection: 'main_db',
        query: 'SELECT * FROM customers'
      },
      position: { x: 600, y: 150 },
      size: { width: 120, height: 60 },
      trackId: 'track-3',
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
      id: 'node-7',
      type: NodeType.TASK,
      name: 'Process DB Data',
      taskType: 'data_processor',
      parameters: {
        operations: ['filter', 'aggregate']
      },
      position: { x: 600, y: 250 },
      size: { width: 120, height: 60 },
      trackId: 'track-3',
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
    // Synchronization point
    {
      id: 'node-8',
      type: NodeType.SYNC_POINT,
      name: 'Merge Data',
      position: { x: 400, y: 350 },
      size: { width: 120, height: 60 },
      config: {
        requiredSources: ['node-3', 'node-5', 'node-7'],
        waitForAll: true,
        timeout: 300000
      }
    },
    // Continuation after sync
    {
      id: 'node-9',
      type: NodeType.TASK,
      name: 'Analyze Combined',
      taskType: 'data_analyzer',
      parameters: {
        analysis_type: 'comprehensive'
      },
      position: { x: 400, y: 450 },
      size: { width: 120, height: 60 },
      resourceRequirements: [
        {
          resourceType: ResourceType.CPU,
          amount: 4
        },
        {
          resourceType: ResourceType.MEMORY,
          amount: 8192
        },
        {
          resourceType: ResourceType.GPU,
          amount: 1
        }
      ]
    },
    {
      id: 'node-10',
      type: NodeType.TASK,
      name: 'Generate Report',
      taskType: 'report_generator',
      parameters: {
        format: 'pdf',
        template: 'executive_summary'
      },
      position: { x: 400, y: 550 },
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
      id: 'node-11',
      type: NodeType.END,
      name: 'End',
      position: { x: 400, y: 650 },
      size: { width: 120, height: 60 }
    }
  ],
  dependencies: [
    // Start to track starts
    {
      sourceId: 'node-1',
      targetId: 'node-2',
      type: DependencyType.SEQUENTIAL
    },
    {
      sourceId: 'node-1',
      targetId: 'node-4',
      type: DependencyType.SEQUENTIAL
    },
    {
      sourceId: 'node-1',
      targetId: 'node-6',
      type: DependencyType.SEQUENTIAL
    },
    // Track 1 internal
    {
      sourceId: 'node-2',
      targetId: 'node-3',
      type: DependencyType.SEQUENTIAL
    },
    // Track 2 internal
    {
      sourceId: 'node-4',
      targetId: 'node-5',
      type: DependencyType.SEQUENTIAL
    },
    // Track 3 internal
    {
      sourceId: 'node-6',
      targetId: 'node-7',
      type: DependencyType.SEQUENTIAL
    },
    // Track ends to sync point
    {
      sourceId: 'node-3',
      targetId: 'node-8',
      type: DependencyType.SYNC
    },
    {
      sourceId: 'node-5',
      targetId: 'node-8',
      type: DependencyType.SYNC
    },
    {
      sourceId: 'node-7',
      targetId: 'node-8',
      type: DependencyType.SYNC
    },
    // Continuation after sync
    {
      sourceId: 'node-8',
      targetId: 'node-9',
      type: DependencyType.SEQUENTIAL
    },
    {
      sourceId: 'node-9',
      targetId: 'node-10',
      type: DependencyType.SEQUENTIAL
    },
    {
      sourceId: 'node-10',
      targetId: 'node-11',
      type: DependencyType.SEQUENTIAL
    }
  ],
  tracks: [
    {
      id: 'track-1',
      name: 'CSV Processing',
      description: 'Process data from CSV files',
      nodeIds: ['node-2', 'node-3']
    },
    {
      id: 'track-2',
      name: 'JSON Processing',
      description: 'Process data from JSON files',
      nodeIds: ['node-4', 'node-5']
    },
    {
      id: 'track-3',
      name: 'Database Processing',
      description: 'Process data from database',
      nodeIds: ['node-6', 'node-7']
    }
  ]
};

