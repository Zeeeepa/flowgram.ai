import { injectable, inject } from 'inversify';
import { WorkflowModel } from '../models/workflow-model';
import { 
  Workflow, 
  WorkflowId, 
  WorkflowNode, 
  NodeId, 
  Dependency, 
  Track, 
  TrackId 
} from '../types';

/**
 * Service for managing workflows
 */
@injectable()
export class WorkflowService {
  private workflows: Map<WorkflowId, WorkflowModel> = new Map();

  /**
   * Create a new workflow
   */
  createWorkflow(workflow?: Partial<Workflow>): WorkflowModel {
    const newWorkflow = new WorkflowModel(workflow);
    this.workflows.set(newWorkflow.id, newWorkflow);
    return newWorkflow;
  }

  /**
   * Get a workflow by ID
   */
  getWorkflow(id: WorkflowId): WorkflowModel | undefined {
    return this.workflows.get(id);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): WorkflowModel[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Update a workflow
   */
  updateWorkflow(id: WorkflowId, updates: Partial<Workflow>): WorkflowModel | undefined {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;

    if (updates.name !== undefined) workflow.name = updates.name;
    if (updates.description !== undefined) workflow.description = updates.description;
    if (updates.version !== undefined) workflow.version = updates.version;
    if (updates.metadata !== undefined) workflow.metadata = updates.metadata;
    
    // For complex updates like nodes, dependencies, and tracks,
    // it's better to use the specific methods on the workflow model
    
    return workflow;
  }

  /**
   * Delete a workflow
   */
  deleteWorkflow(id: WorkflowId): boolean {
    return this.workflows.delete(id);
  }

  /**
   * Clone a workflow
   */
  cloneWorkflow(id: WorkflowId, newName?: string): WorkflowModel | undefined {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;

    const clone = workflow.clone();
    clone.id = `workflow-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    if (newName) clone.name = newName;
    
    this.workflows.set(clone.id, clone);
    return clone;
  }

  /**
   * Add a node to a workflow
   */
  addNode(workflowId: WorkflowId, node: WorkflowNode): WorkflowNode | undefined {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return undefined;
    
    return workflow.addNode(node);
  }

  /**
   * Remove a node from a workflow
   */
  removeNode(workflowId: WorkflowId, nodeId: NodeId): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;
    
    return workflow.removeNode(nodeId);
  }

  /**
   * Add a dependency to a workflow
   */
  addDependency(workflowId: WorkflowId, dependency: Dependency): Dependency | undefined {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return undefined;
    
    return workflow.addDependency(dependency);
  }

  /**
   * Remove a dependency from a workflow
   */
  removeDependency(workflowId: WorkflowId, sourceId: NodeId, targetId: NodeId): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;
    
    return workflow.removeDependency(sourceId, targetId);
  }

  /**
   * Add a track to a workflow
   */
  addTrack(workflowId: WorkflowId, track: Track): Track | undefined {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return undefined;
    
    return workflow.addTrack(track);
  }

  /**
   * Remove a track from a workflow
   */
  removeTrack(workflowId: WorkflowId, trackId: TrackId): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;
    
    return workflow.removeTrack(trackId);
  }
}

