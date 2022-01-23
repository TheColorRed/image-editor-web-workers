import { Constants } from './constants';
import { Project } from './project';
import { Assignment } from './project/assignment';

export class WebWorker {

  readonly id = crypto.randomUUID();
  private worker: Worker;

  private _working = false;
  get isWorking() { return this._working; }

  private buffer?: SharedArrayBuffer;

  constructor(private readonly project: Project) {
    this.worker = new Worker(
      new URL('../../processor/src/worker.ts', import.meta.url)
    );
    this.worker.postMessage({ action: 'set-id', value: this.id });
    this.worker.onmessage = this.onMessage.bind(this);
  }

  stop(shouldFinish = true) {
    this.worker.terminate();
  }

  /**
   * Applies work to the image with this worker.
   * @param {Assignment} assignment The assignment the worker should apply.
   * @param {number} first The first index of the data.
   * @param {number} last The last index of the data.
   */
  applyWork(assignment: Assignment, buffer: SharedArrayBuffer, first: number, last: number) {
    this.worker.postMessage({
      action: 'apply',
      id: this.id,
      value: {
        first, last, buffer,
        engine: assignment.engine,
        process: assignment.process,
        value: assignment.value,
        layerId: assignment.layer.id,
        assignmentId: assignment.id
      }
    } as WorkerIncomingMessage<WorkAssignment>);
  }

  /**
   * Watches for messages from the worker process.
   * @param message The received message from the worker.
   */
  private onMessage(message: MessageEvent<WorkerOutgoingMessage>) {
    if (message.data.workerId !== this.id) return;

    window.dispatchEvent(
      new CustomEvent(Constants.EVENT_WORKER_WORK_COMPLETE,
        { detail: message.data }
      )
    );

    // const layer = window.workManager.getLayerById(message.data.layer);
    // const project = layer?.project;
    // if (!project || !layer) return;
    // const buffer = this.buffer?.slice(this.first, this.last);
    // if (buffer) {
    //   const arr = new Uint8ClampedArray(buffer);
    //   // layer?.setCanvasData(message.data.value, width, height)
    //   layer?.setClampedArray(arr);
    // project?.events.trigger('workComplete');
    //   console.log('complete');
    // }
    // layer.isWorking = false;
    // this._hasWork = false;
  }
}