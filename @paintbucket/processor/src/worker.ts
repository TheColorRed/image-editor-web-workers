import { Engine as EngineType } from '@paintbucket/core';
import { Engine } from './engine';
import { ColorEngine } from './engines/color.engine';

let id = '';

onmessage = (event: MessageEvent<WorkerIncomingMessage>) => {
  // console.log(event.data);

  // If the process doesn't have an id don't process data.
  if (id === '') {
    if (event.data.action === 'set-id' && typeof event.data.value === 'string') {
      id = event.data.value;
    }
    return;
  }
  // An id is set, we can now assign work this worker.
  else if (event.data.action === 'apply' && typeof event.data.value === 'object') {
    const operation = event.data.value;
    let engine: Engine | undefined = undefined;
    switch (operation.engine) {
      case EngineType.Color:
        engine = new ColorEngine(event.data.value);
        break;
    }
    engine && typeof engine.apply === 'function' && engine.apply();
    postMessage({
      action: event.data.action,
      workerId: id,
      layerId: event.data.value.layerId,
      assignmentId: event.data.value.assignmentId
    } as WorkerApplyResponse);
  }
};