import { injectable, inject } from 'inversify';
import { Workflow } from '../core/types';
import { WorkflowSerializer } from './workflow-serializer';
import { DslParser } from '../dsl/dsl-parser';
import { DslGenerator } from '../dsl/dsl-generator';

/**
 * Serializer for DSL format
 */
@injectable()
export class DslSerializer extends WorkflowSerializer {
  constructor(
    @inject(DslParser) private parser: DslParser,
    @inject(DslGenerator) private generator: DslGenerator
  ) {
    super();
  }

  getFormat(): string {
    return 'dsl';
  }

  serialize(workflow: Workflow): string {
    return this.generator.generate(workflow);
  }

  deserialize(data: string): Workflow {
    return this.parser.parse(data);
  }
}

