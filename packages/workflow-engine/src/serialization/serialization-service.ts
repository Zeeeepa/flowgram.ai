import { injectable, inject, multiInject, optional } from 'inversify';
import { Workflow } from '../core/types';
import { WorkflowSerializer } from './workflow-serializer';

/**
 * Service for serializing and deserializing workflows
 */
@injectable()
export class SerializationService {
  private serializers: Map<string, WorkflowSerializer> = new Map();

  constructor(
    @multiInject(WorkflowSerializer) @optional() serializers: WorkflowSerializer[] = []
  ) {
    serializers.forEach(serializer => {
      this.registerSerializer(serializer);
    });
  }

  /**
   * Register a serializer
   */
  registerSerializer(serializer: WorkflowSerializer): void {
    this.serializers.set(serializer.getFormat(), serializer);
  }

  /**
   * Get a serializer by format
   */
  getSerializer(format: string): WorkflowSerializer | undefined {
    return this.serializers.get(format);
  }

  /**
   * Get all available serialization formats
   */
  getAvailableFormats(): string[] {
    return Array.from(this.serializers.keys());
  }

  /**
   * Serialize a workflow to a specific format
   */
  serialize(workflow: Workflow, format: string): string {
    const serializer = this.serializers.get(format);
    if (!serializer) {
      throw new Error(`No serializer registered for format: ${format}`);
    }
    
    return serializer.serialize(workflow);
  }

  /**
   * Deserialize a workflow from a specific format
   */
  deserialize(data: string, format: string): Workflow {
    const serializer = this.serializers.get(format);
    if (!serializer) {
      throw new Error(`No serializer registered for format: ${format}`);
    }
    
    return serializer.deserialize(data);
  }
}

