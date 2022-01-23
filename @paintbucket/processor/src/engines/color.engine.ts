import { Color } from '@paintbucket/core';
import { Engine } from '../engine';
import { Lighten } from '../processes/color/lighten.process';
import { Process } from '../processes/process';

export class ColorEngine extends Engine {

  apply() {
    const process = this.getProcess();
    const arr = new Uint8ClampedArray(this.operation.buffer);
    for (let i = this.first; i < this.last; i += 4) {
      const [red, green, blue] = process?.apply(
        Color.RGB(
          arr[i + 0],
          arr[i + 1],
          arr[i + 2]
        ),
        this.operation.value
      ).toRGB() as number[];

      arr[i + 0] = red;
      arr[i + 1] = green;
      arr[i + 2] = blue;
    }
  }

  private getProcess(): Process | undefined {
    switch (this.operation.process) {
      case 'lighten': return new Lighten();
    }
  }
}