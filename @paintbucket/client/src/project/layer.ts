import { EventListener } from '@paintbucket/core';
import { Engine } from '@paintbucket/core/Engine.enum';
import { Project } from '.';
import { Constants } from '../constants';
import { AssignmentState } from '../enums/assignment-state.enum';
import { Assignment } from './assignment';

export abstract class Layer {

  readonly id = crypto.randomUUID();
  protected canvas!: HTMLCanvasElement;
  protected ctx!: CanvasRenderingContext2D;
  protected originalImageData?: ImageData;
  protected imageData?: ImageData;
  events = new EventListener();
  assignments: Assignment[] = [];

  buffer?: SharedArrayBuffer;
  arr = new Uint8ClampedArray();

  private _project?: Project;
  get project() { return this._project; }

  isWorking = false;


  x = 0;
  y = 0;

  get width() { return this.canvas.width; }
  set width(value: number) { this.canvas.width = value; }
  get drawWidth() { return this.width + this.x; }

  get height() { return this.canvas.height; }
  set height(value: number) { this.canvas.height = value; }
  get drawHeight() { return this.height + this.y; }

  get loaded() {
    return this.imageData && this.imageData.data.length > 0 || false;
  };

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    window.addEventListener(
      Constants.EVENT_ASSIGNMENT_WORK_COMPLETE,
      this.workComplete.bind(this)
    );
  }

  setProject(project: Project) {
    this._project = project;
  }

  apply(engine: Engine, process: string, value: string | number) {
    if (this.imageData && this.project) {
      this.isWorking = true;

      this.buffer = new SharedArrayBuffer(this.imageData.data.length);
      this.arr = new Uint8ClampedArray(this.buffer);
      this.arr.set(this.imageData.data);

      this.assignments.push(new Assignment(this, engine, process, value));
    }
  }

  applyWork(assignment: Assignment) {
    if (!this.project || !this.buffer || this.project.workers.length === 0) return;
    this.isWorking = true;

    const imageData = this.getCanvasData();
    const pixels = imageData.data.length / 4;
    const workers = this.project.workers.length || 0;
    const pixelsPerWorker = Math.ceil(pixels / workers);

    for (let i = 0; i < workers; i++) {
      const worker = this.project.workers[i];
      const first = pixelsPerWorker * i;
      const last = first + pixelsPerWorker - 1;
      worker.applyWork(assignment, this.buffer, first, last);
      assignment.addAssociatedWorker(worker);
    }
  }

  workComplete() {
    // Deconstruct completed assignments.
    const completed = this.assignments
      .filter(a => a.state === AssignmentState.Complete);
    completed.forEach(a => a.destruct());

    // Remove completed work assignments.
    this.assignments = this.assignments
      .filter(a => a.state !== AssignmentState.Complete);

    // Update the working status.
    if (this.assignments.length === 0 && this.buffer) {
      const arr = new Uint8ClampedArray(this.buffer.byteLength);
      arr.set(this.arr.slice(0, this.buffer.byteLength));
      this.setClampedArray(arr);
      this.isWorking = false;
      this.project?.draw();
    }
  }

  setInitialCanvasData(data: Uint8ClampedArray, width: number, height: number, x?: number, y?: number): void;
  setInitialCanvasData(data: HTMLImageElement, x?: number, y?: number): void;
  setInitialCanvasData(data: ImageData, x?: number, y?: number): void;
  setInitialCanvasData(...args:
    [HTMLImageElement, number?, number?] |
    [ImageData, number?, number?] |
    [Uint8ClampedArray, number, number, number?, number?]
  ) {
    this.setCanvasData(...args as [any]);
    this.originalImageData = Object.assign({}, this.imageData);
  }

  setCanvasData(data: Uint8ClampedArray, width: number, height: number, x?: number, y?: number): void;
  setCanvasData(data: HTMLImageElement, x?: number, y?: number): void;
  setCanvasData(data: ImageData, x?: number, y?: number): void;
  setCanvasData(...args:
    [HTMLImageElement, number?, number?] |
    [ImageData, number?, number?] |
    [Uint8ClampedArray, number, number, number?, number?]
  ): void {
    const data = args[0] as HTMLImageElement | ImageData | Uint8ClampedArray;

    if (data instanceof HTMLImageElement) {
      this.setImageData(data, args[1], args[2]);
    } else if (data instanceof Uint8ClampedArray) {
      this.setClampedArray(data, args[1], args[2], args[3], args[4]);
    } else if (data instanceof ImageData) {
      this.setImageData(data, args[1], args[2]);
    }

    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
  }

  setImageData(data: HTMLImageElement | ImageData, dx?: number, dy?: number) {
    this.width = data.width;
    this.height = data.height;
    if (data instanceof HTMLImageElement) {
      this.ctx.drawImage(data, dx || 0, dy || 0);
    } else {
      this.ctx.putImageData(data, dx || 0, dy || 0);
    }
  }

  setClampedArray(data: Uint8ClampedArray, dx?: number, dy?: number, sw?: number, sh?: number) {
    const imageData = new ImageData(data, sw || this.width || 0, sh || this.height || 0);
    this.width = imageData.width;
    this.height = imageData.height;
    this.ctx.putImageData(imageData, dx || 0, dy || 0);
  }

  getCanvasData(sx: number, sy: number, sw: number, sh: number): ImageData;
  getCanvasData(sw: number, sh: number): ImageData;
  getCanvasData(): ImageData;
  getCanvasData(...args: number[]) {
    let sx = 0, sy = 0, sw = 0, sh = 0;

    if (args.length === 0) {
      sw = this.width;
      sh = this.height;
    } else {
      if (args.length === 4) {
        sx = args[0] || 0;
        sy = args[1] || 0;
        sw = args[2] || 0;
        sh = args[3] || 0;
      } else if (args.length === 2) {
        sw = args[0] || 0;
        sh = args[1] || 0;
      }
    }

    return this.ctx.getImageData(sx, sy, sw, sh);
  }

  nextAssignmentState(current?: AssignmentState) {
    for (let assignment of this.assignments) {
      // Only update states that match the current state.
      if (current) {
        assignment.state === current && assignment.nextState();
      }
      // Update all states to the next state.
      else {
        assignment.nextState();
      }
    }
  }

}