import { Color } from '@paintbucket/core';
import { Process } from '../process';

export class Lighten extends Process {
  apply(color: Color, value: string): Color {
    return color.lighten(parseInt(value));
    // return Color.Black;
  }

}