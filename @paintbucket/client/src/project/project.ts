import { EventListener } from '@paintbucket/core';
import { AssignmentState } from '../enums/assignment-state.enum';
import { deepMerge } from '../functions/merge';
import { WebWorker } from '../web-worker';
import { Layer } from './layer';

export interface ProjectSettings {
  workers?: number;
  /** The element to attach the output canvas to as a child. Defaults to the body element. */
  attach?: string | HTMLElement;
  /** The width of the output canvas. */
  width?: number;
  /** The height of the output canvas. */
  height?: number;
  /** The maximum canvas width. If not set, the canvas will resize to the width of its contents. */
  maxWidth?: number;
  /** The maximum canvas height. If not set, the canvas will resize to the height of its contents. */
  maxHeight?: number;
}

export class Project {

  readonly id = crypto.randomUUID();
  layers: Layer[] = [];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  events = new EventListener();
  // assignments: Assignment[] = [];
  workers: WebWorker[] = [];

  private readonly EVENT_LAYER_LOADED = 'layerLoaded';

  private readonly defaultSettings: Required<ProjectSettings> = Object.freeze({
    width: 0,
    height: 0,
    attach: 'body',
    maxWidth: -1,
    maxHeight: -1,
    workers: 4
  });

  settings: Required<ProjectSettings> = Object.assign({}, this.defaultSettings);

  constructor(settings?: ProjectSettings) {
    this.settings = (settings
      ? deepMerge<ProjectSettings>(this.defaultSettings, settings)
      : this.defaultSettings) as Required<ProjectSettings>;

    this.createWorkers(this.settings.workers);

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    let element: HTMLElement | null = null;
    if (this.settings.attach instanceof HTMLElement) {
      element = this.settings.attach;
    } else if (typeof this.settings.attach === 'string') {
      element = document.querySelector(this.settings.attach);
    }

    if (element) {
      if (this.settings?.width) {
        this.canvas.width = this.settings.width;
      }
      if (this.settings?.height) {
        this.canvas.height = this.settings.height;
      }
      element.appendChild(this.canvas);
    }

    this.watchForWork();
    // this.watchForCompletedWork();
  }

  getWidestLayer() {
    return this.layers.reduce((acc, val) => {
      return val.width > acc.width ? val : acc;
    }, this.layers[0]);
  }

  getRightMostLayer() {
    return this.layers.reduce((acc, val) => {
      return val.width + val.x > acc.width + acc.x ? val : acc;
    }, this.layers[0]);
  }

  getDownMostLayer() {
    return this.layers.reduce((acc, val) => {
      return val.height + val.y > acc.height + acc.y ? val : acc;
    }, this.layers[0]);
  }

  getTallestLayer() {
    return this.layers.reduce((acc, val) => {
      return val.height > acc.height ? val : acc;
    }, this.layers[0]);
  }

  addLayer(layer: Layer, index = -1) {
    if (layer.project) {
      throw new Error('This layer is already associated with a project');
    }
    layer.setProject(this);
    if (layer instanceof Layer) {
      index > -1
        ? this.layers.push(layer)
        : this.layers.splice(index, 0, layer);
      layer.events.once(
        this.EVENT_LAYER_LOADED,
        () => this.events.trigger(this.EVENT_LAYER_LOADED)
      );
    }
  }

  resizeCanvas(): void;
  resizeCanvas(width: number, height: number): void;
  resizeCanvas(...args: [number, number] | []): void {
    if (args.length === 0) {
      const width = this.layers.reduce((acc, val) => val.width > acc ? val.width : acc, 0);
      const height = this.layers.reduce((acc, val) => val.height > acc ? val.height : acc, 0);
      this.canvas.width = width;
      this.canvas.height = height;
    } else {
      this.canvas.width = args[0];
      this.canvas.height = args[1];
    }
  }

  draw() {
    const layers = [...this.layers].reverse();
    let width = 0, height = 0;

    if (this.settings.maxWidth === -1) {
      width = this.getRightMostLayer().drawWidth;
    }

    if (this.settings.maxHeight === -1) {
      height = this.getDownMostLayer().drawHeight;
    }

    this.resizeCanvas(
      width || this.settings.maxWidth || this.canvas.width,
      height || this.settings.maxHeight || this.canvas.height
    );

    for (let layer of layers) {
      const data = layer.getCanvasData();
      this.ctx.putImageData(data, layer.x, layer.y);
    }
  }

  addWorker() {
    this.workers.push(new WebWorker(this));
  }

  private createWorkers(count: number) {
    for (let i = 0; i < count; i++) {
      this.addWorker();
    }
  }

  private watchForWork() {
    setInterval(() => {
      const workLayers = this.getCreatedLayerAssignments();
      if (workLayers.length === 0) return;
      workLayers.forEach(layer => {
        layer.nextAssignmentState(AssignmentState.Created);
        this.applyAssignments(layer);
      });
    }, 250);
  }

  // private watchForCompletedWork() {
  //   setInterval(() => {
  //     const workLayers = this.getCompletedLayerAssignments();
  //     if (workLayers.length === 0) return;
  //     console.log('work complete');
  //   }, 250);
  // }

  private applyAssignments(layer: Layer) {
    const assignments = layer.assignments
      .filter(i => i.state === AssignmentState.Working);
    for (let assignment of assignments) {
      layer.applyWork(assignment);
    }
  }

  private getCreatedLayerAssignments() {
    return this.layers
      .filter(
        l => l.assignments.some(
          a => a.state === AssignmentState.Created
        )
      );
  }

  private getCompletedLayerAssignments() {
    return this.layers
      .filter(
        l => l.assignments.some(
          a => a.state === AssignmentState.Complete
        )
      );
  }
}