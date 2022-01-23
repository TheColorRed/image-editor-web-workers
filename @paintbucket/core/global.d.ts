declare interface WorkAssignment<T = any> {
  first: number;
  last: number;
  buffer: SharedArrayBuffer;
  engine: import('./src/Engine.enum').Engine;
  process: string;
  value: T;
  layerId: string;
  assignmentId: string;
}

declare interface WorkerIncomingMessage<T = string | WorkAssignment> {
  action: 'set-id' | 'apply';
  id: string;
  value: T;
}

declare interface WorkerOutgoingMessage {
  workerId: string;
  value: any;
  layer: string;
}

declare interface WorkerApplyResponse {
  action: string;
  workerId: string;
  layerId: string;
  assignmentId: string;
}

// declare global {
declare interface Crypto {
  randomUUID: () => string;
}

// }