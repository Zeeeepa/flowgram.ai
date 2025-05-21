import { injectable } from 'inversify';
import { ResourceRequirement, ResourceType, ResourceId } from '../types';

/**
 * Model for resource requirements in workflow nodes
 */
@injectable()
export class ResourceRequirementModel implements ResourceRequirement {
  resourceType: ResourceType;
  amount: number;
  resourceId?: ResourceId;
  metadata?: Record<string, any>;

  constructor(requirement: Partial<ResourceRequirement>) {
    if (requirement.resourceType === undefined || requirement.amount === undefined) {
      throw new Error('Resource requirement must have a type and amount');
    }
    
    this.resourceType = requirement.resourceType;
    this.amount = requirement.amount;
    this.resourceId = requirement.resourceId;
    this.metadata = requirement.metadata;
  }

  /**
   * Set the resource amount
   */
  setAmount(amount: number): void {
    if (amount < 0) {
      throw new Error('Resource amount cannot be negative');
    }
    this.amount = amount;
  }

  /**
   * Set the resource type
   */
  setResourceType(type: ResourceType): void {
    this.resourceType = type;
  }

  /**
   * Set the specific resource ID
   */
  setResourceId(id: ResourceId): void {
    this.resourceId = id;
  }

  /**
   * Check if this is a custom resource type
   */
  isCustom(): boolean {
    return this.resourceType === ResourceType.CUSTOM;
  }

  /**
   * Clone the resource requirement
   */
  clone(): ResourceRequirementModel {
    return new ResourceRequirementModel({
      resourceType: this.resourceType,
      amount: this.amount,
      resourceId: this.resourceId,
      metadata: this.metadata ? { ...this.metadata } : undefined
    });
  }
}

