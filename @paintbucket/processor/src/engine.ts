export abstract class Engine {

  first = 0;
  last = 0;

  abstract apply(): any | Promise<any>;

  constructor(
    public readonly operation: WorkAssignment
  ) {
    this.first = operation.first * 4;
    this.last = operation.last * 4;
  }
}