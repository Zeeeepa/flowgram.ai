import { injectable } from 'inversify';
import { Workflow, ValidationError } from '../../core/types';

/**
 * Base interface for all workflow validators
 */
@injectable()
export abstract class WorkflowValidator {
  /**
   * Validate a workflow and return any errors
   */
  abstract validate(workflow: Workflow): ValidationError[];
}

