import type { Color } from '@paintbucket/core';

export abstract class Process {
  abstract apply(color: Color, value: string | number): Color;
}