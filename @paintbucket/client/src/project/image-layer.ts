import { Layer } from './layer';

export class ImageLayer extends Layer {

  protected image!: HTMLImageElement;

  constructor(public readonly src: string) {
    super();
    this.loadLayer();
  }

  private loadLayer() {
    this.image = new Image();
    this.image.src = this.src;
    this.image.onload = () => {
      this.setInitialCanvasData(this.image!);
      this.events.trigger('layerLoaded');
    };
  }
}