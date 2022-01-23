import { Engine } from '@paintbucket/core';
import { Layer } from '.';
import { Constants } from '../constants';
import { AssignmentState } from '../enums/assignment-state.enum';
import { WebWorker } from '../web-worker';

export class Assignment {

  readonly id = crypto.randomUUID();
  readonly workers: WebWorker[] = [];
  readonly completedWorkers: WebWorker[] = [];
  private _state = AssignmentState.Created;

  get state() { return this._state; }

  constructor(
    public layer: Layer,
    public engine: Engine,
    public process: string,
    public value: string | number
  ) {
    window.addEventListener(
      Constants.EVENT_WORKER_WORK_COMPLETE,
      this.workerCompleted.bind(this) as any
    );
  }

  destruct() {
    window.removeEventListener(
      Constants.EVENT_ASSIGNMENT_WORK_COMPLETE,
      this.workerCompleted.bind(this) as any
    );
  }

  addAssociatedWorker(worker: WebWorker) {
    this.workers.push(worker);
  }

  workerCompleted(event: CustomEvent<WorkerApplyResponse>) {
    if (this.id !== event.detail.assignmentId) return;
    const worker = this.workers
      .find(i => i.id === event.detail.workerId);

    if (!worker) return;

    this.completedWorkers.push(worker);
    if (this.completedWorkers.length === this.workers.length) {
      this._state = AssignmentState.Complete;
      window.dispatchEvent(
        new CustomEvent(Constants.EVENT_ASSIGNMENT_WORK_COMPLETE)
      );
    }
  }

  nextState() {
    if (this._state === AssignmentState.Created) {
      this._state = AssignmentState.Working;
    }
  }
}