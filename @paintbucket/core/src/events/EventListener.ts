export type EventCallback<T = {}> = (data?: T) => void;

export interface EventCallbackWrapper<T = {}> {
  name: string;
  callback: EventCallback<T>;
  maxCallCount: number;
  callCount: number;
}

export class EventListener {
  events: EventCallbackWrapper[] = [];

  on(name: string, event: EventCallback) {
    typeof event === 'function' && this.events.push({
      callback: event, callCount: 0, maxCallCount: -1, name
    });
    return this;
  }

  once(name: string, event: EventCallback) {
    typeof event === 'function' && this.events.push({
      callback: event, callCount: 0, maxCallCount: 1, name
    });
    return this;
  }

  trigger(name: string) {
    for (let evt of this.events) {
      if (name === evt.name && (evt.callCount < evt.maxCallCount || evt.maxCallCount === -1)) {
        evt.callback();
        evt.callCount++;
      }
    }
    this.events = this.events
      .filter(i => i.maxCallCount === -1 || i.callCount < i.maxCallCount);
  }
}