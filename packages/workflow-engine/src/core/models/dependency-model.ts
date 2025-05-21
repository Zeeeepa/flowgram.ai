import { injectable } from 'inversify';
import { Dependency, NodeId, DependencyType, Condition } from '../types';

/**
 * Model for dependencies between workflow nodes
 */
@injectable()
export class DependencyModel implements Dependency {
  sourceId: NodeId;
  targetId: NodeId;
  type: DependencyType;
  condition?: Condition;
  metadata?: Record<string, any>;

  constructor(dependency: Partial<Dependency>) {
    if (!dependency.sourceId || !dependency.targetId) {
      throw new Error('Dependency must have source and target node IDs');
    }
    
    this.sourceId = dependency.sourceId;
    this.targetId = dependency.targetId;
    this.type = dependency.type || DependencyType.SEQUENTIAL;
    this.condition = dependency.condition;
    this.metadata = dependency.metadata;
  }

  /**
   * Set the dependency type
   */
  setType(type: DependencyType): void {
    this.type = type;
  }

  /**
   * Set a condition for the dependency
   */
  setCondition(condition: Condition): void {
    this.condition = condition;
    
    // If setting a condition, ensure the dependency type is conditional
    if (this.type !== DependencyType.CONDITIONAL) {
      this.type = DependencyType.CONDITIONAL;
    }
  }

  /**
   * Remove the condition from the dependency
   */
  removeCondition(): void {
    this.condition = undefined;
    
    // If removing a condition and the type was conditional, reset to sequential
    if (this.type === DependencyType.CONDITIONAL) {
      this.type = DependencyType.SEQUENTIAL;
    }
  }

  /**
   * Check if the dependency is conditional
   */
  isConditional(): boolean {
    return this.type === DependencyType.CONDITIONAL && !!this.condition;
  }

  /**
   * Check if the dependency is for synchronization
   */
  isSynchronization(): boolean {
    return this.type === DependencyType.SYNC;
  }

  /**
   * Clone the dependency
   */
  clone(): DependencyModel {
    return new DependencyModel({
      sourceId: this.sourceId,
      targetId: this.targetId,
      type: this.type,
      condition: this.condition ? { ...this.condition } : undefined,
      metadata: this.metadata ? { ...this.metadata } : undefined
    });
  }
}

