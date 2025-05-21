import { injectable } from 'inversify';
import { Workflow, WorkflowSerialized } from '../core/types';
import { WorkflowSerializer } from './workflow-serializer';

/**
 * Serializer for JSON format
 */
@injectable()
export class JsonSerializer extends WorkflowSerializer {
  getFormat(): string {
    return 'json';
  }

  serialize(workflow: Workflow): string {
    // Convert to a more efficient serialized format
    const serialized: WorkflowSerialized = {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      version: workflow.version,
      nodes: workflow.nodes.reduce((acc, node) => {
        acc[node.id] = node;
        return acc;
      }, {} as Record<string, any>),
      dependencies: workflow.dependencies,
      tracks: workflow.tracks.reduce((acc, track) => {
        acc[track.id] = track;
        return acc;
      }, {} as Record<string, any>),
      metadata: workflow.metadata
    };

    return JSON.stringify(serialized, null, 2);
  }

  deserialize(data: string): Workflow {
    const serialized = JSON.parse(data) as WorkflowSerialized;
    
    // Convert back to the workflow format
    return {
      id: serialized.id,
      name: serialized.name,
      description: serialized.description,
      version: serialized.version,
      nodes: Object.values(serialized.nodes),
      dependencies: serialized.dependencies,
      tracks: Object.values(serialized.tracks),
      metadata: serialized.metadata
    };
  }
}

