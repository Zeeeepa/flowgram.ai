# Workflow Definition & Modeling System

A system for defining and modeling complex workflows with parallel execution paths.

## Overview

This package provides a comprehensive framework for defining, validating, serializing, and visualizing complex workflows with parallel execution paths. It is designed to support the following key features:

- Domain-specific language (DSL) for workflow definition
- Visual workflow designer with drag-and-drop capabilities
- Serialization/deserialization mechanisms for workflow persistence
- Support for defining parallel tracks with explicit dependencies
- Specification of synchronization points between tracks
- Resource requirement definitions for each task
- Validation rules to detect circular dependencies
- Conditional execution paths and decision points

## Architecture

The system is organized into several modules:

- **Core**: Contains the fundamental models, types, and services for workflow definition
- **DSL**: Provides a domain-specific language for defining workflows in a human-readable format
- **Validation**: Implements validation rules to ensure workflow correctness
- **Visualization**: Offers components for visualizing and editing workflows
- **Serialization**: Handles persistence of workflows in various formats

## Usage

### Basic Workflow Definition

```typescript
import { 
  WorkflowModel, 
  TaskNodeModel, 
  StartNodeModel, 
  EndNodeModel,
  DependencyModel,
  DependencyType
} from '@flowgram.ai/workflow-engine';

// Create a new workflow
const workflow = new WorkflowModel({
  name: 'Simple Workflow',
  description: 'A simple sequential workflow'
});

// Add nodes
const startNode = new StartNodeModel({ name: 'Start' });
workflow.addNode(startNode);

const processNode = new TaskNodeModel({
  name: 'Process Data',
  taskType: 'data_processor',
  parameters: {
    operation: 'transform'
  }
});
workflow.addNode(processNode);

const endNode = new EndNodeModel({ name: 'End' });
workflow.addNode(endNode);

// Add dependencies
workflow.addDependency(new DependencyModel({
  sourceId: startNode.id,
  targetId: processNode.id,
  type: DependencyType.SEQUENTIAL
}));

workflow.addDependency(new DependencyModel({
  sourceId: processNode.id,
  targetId: endNode.id,
  type: DependencyType.SEQUENTIAL
}));
```

### Using the DSL

```typescript
import { DslParser, DslGenerator } from '@flowgram.ai/workflow-engine';

// Parse a workflow from DSL
const parser = new DslParser();
const workflow = parser.parse(`
  workflow "Data Processing" {
    description "Process data from multiple sources"
    
    start "Begin" {}
    
    task "Process Data" {
      type "data_processor"
      parameters {
        operation: "transform"
      }
    }
    
    end "Complete" {}
    
    dependencies {
      "Begin" -> "Process Data"
      "Process Data" -> "Complete"
    }
  }
`);

// Generate DSL from a workflow
const generator = new DslGenerator();
const dsl = generator.generate(workflow);
```

### Parallel Tracks and Synchronization

```typescript
import { 
  WorkflowModel, 
  TaskNodeModel, 
  StartNodeModel, 
  EndNodeModel,
  SyncPointNodeModel,
  TrackModel,
  DependencyModel,
  DependencyType
} from '@flowgram.ai/workflow-engine';

// Create a workflow with parallel tracks
const workflow = new WorkflowModel({
  name: 'Parallel Workflow',
  description: 'A workflow with parallel execution paths'
});

// Create tracks
const track1 = new TrackModel({ name: 'Track 1' });
const track2 = new TrackModel({ name: 'Track 2' });
workflow.addTrack(track1);
workflow.addTrack(track2);

// Add nodes
const startNode = new StartNodeModel({ name: 'Start' });
workflow.addNode(startNode);

const task1 = new TaskNodeModel({
  name: 'Task 1',
  taskType: 'process_a'
});
task1.assignToTrack(track1.id);
workflow.addNode(task1);
track1.addNode(task1.id);

const task2 = new TaskNodeModel({
  name: 'Task 2',
  taskType: 'process_b'
});
task2.assignToTrack(track2.id);
workflow.addNode(task2);
track2.addNode(task2.id);

// Add synchronization point
const syncPoint = new SyncPointNodeModel({
  name: 'Sync Point',
  config: {
    requiredSources: [task1.id, task2.id],
    waitForAll: true
  }
});
workflow.addNode(syncPoint);

const endNode = new EndNodeModel({ name: 'End' });
workflow.addNode(endNode);

// Add dependencies
workflow.addDependency(new DependencyModel({
  sourceId: startNode.id,
  targetId: task1.id,
  type: DependencyType.SEQUENTIAL
}));

workflow.addDependency(new DependencyModel({
  sourceId: startNode.id,
  targetId: task2.id,
  type: DependencyType.SEQUENTIAL
}));

workflow.addDependency(new DependencyModel({
  sourceId: task1.id,
  targetId: syncPoint.id,
  type: DependencyType.SYNC
}));

workflow.addDependency(new DependencyModel({
  sourceId: task2.id,
  targetId: syncPoint.id,
  type: DependencyType.SYNC
}));

workflow.addDependency(new DependencyModel({
  sourceId: syncPoint.id,
  targetId: endNode.id,
  type: DependencyType.SEQUENTIAL
}));
```

### Validation

```typescript
import { ValidationService, CircularDependencyValidator } from '@flowgram.ai/workflow-engine';

// Create a validation service
const validationService = new ValidationService();

// Register validators
validationService.registerValidator(new CircularDependencyValidator());

// Validate a workflow
const validationResult = validationService.validateWorkflow(workflow);

if (!validationResult.valid) {
  console.error('Validation errors:', validationResult.errors);
}
```

### Serialization

```typescript
import { SerializationService, JsonSerializer, DslSerializer } from '@flowgram.ai/workflow-engine';

// Create a serialization service
const serializationService = new SerializationService();

// Register serializers
serializationService.registerSerializer(new JsonSerializer());
serializationService.registerSerializer(new DslSerializer(new DslParser(), new DslGenerator()));

// Serialize a workflow to JSON
const json = serializationService.serialize(workflow, 'json');

// Deserialize from JSON
const deserializedWorkflow = serializationService.deserialize(json, 'json');
```

### Visualization

```tsx
import React, { useState } from 'react';
import { WorkflowDesigner } from '@flowgram.ai/workflow-engine';
import { WorkflowModel, NodeId, Position } from '@flowgram.ai/workflow-engine';

const WorkflowEditor: React.FC = () => {
  const [workflow, setWorkflow] = useState(new WorkflowModel({
    name: 'My Workflow'
  }));

  const handleNodeMove = (nodeId: NodeId, position: Position) => {
    const updatedWorkflow = { ...workflow };
    const nodeIndex = updatedWorkflow.nodes.findIndex(node => node.id === nodeId);
    
    if (nodeIndex !== -1) {
      updatedWorkflow.nodes[nodeIndex] = {
        ...updatedWorkflow.nodes[nodeIndex],
        position
      };
      setWorkflow(updatedWorkflow);
    }
  };

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <WorkflowDesigner
        workflow={workflow}
        onNodeMove={handleNodeMove}
      />
    </div>
  );
};
```

## License

MIT

