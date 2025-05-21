import { injectable } from 'inversify';
import { Workflow } from '../core/types';

/**
 * Base interface for workflow serializers
 */
@injectable()
export abstract class WorkflowSerializer {
  /**
   * Get the format identifier for this serializer
   */
  abstract getFormat(): string;

  /**
   * Serialize a workflow to a string
   */
  abstract serialize(workflow: Workflow): string;

  /**
   * Deserialize a string to a workflow
   */
  abstract deserialize(data: string): Workflow;
}

