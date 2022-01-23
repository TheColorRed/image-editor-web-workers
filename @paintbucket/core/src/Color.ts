import { hslToRgb, hsvToRgb, rgbToHsl, rgbToHsv } from './functions/color-conversion';

export class Color {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;

  get hsv() {
    const hsv = rgbToHsv(this.r, this.g, this.b);
    return { h: hsv[0], s: hsv[1], v: hsv[2], a: this.a };
  }

  get hsl() {
    const hsl = rgbToHsl(this.r, this.g, this.b);
    return { h: hsl[0], s: hsl[1], v: hsl[2], a: this.a };
  }

  get rgb() {
    return { r: this.r, g: this.g, b: this.b, a: this.a };
  }

  static get White() { return Color.RGB(255, 255, 255, 255); }
  static get Black() { return Color.RGB(0, 0, 0, 255); }
  static get Red() { return Color.RGB(255, 0, 0, 255); }
  static get Green() { return Color.RGB(0, 255, 0, 255); }
  static get Blue() { return Color.RGB(0, 0, 255, 255); }
  static get Cyan() { return Color.RGB(0, 255, 255, 255); }
  static get Purple() { return Color.RGB(255, 0, 255, 255); }
  static get Yellow() { return Color.RGB(255, 255, 0, 255); }

  private constructor(r: number, g: number, b: number, a: number) {
    this.r = Math.max(Math.min(255, r), 0);
    this.g = Math.max(Math.min(255, g), 0);
    this.b = Math.max(Math.min(255, b), 0);
    this.a = Math.max(Math.min(255, a), 0);
  }

  lighten(amount: number) {
    let [h, s, l] = rgbToHsl(this.r, this.g, this.b);
    l += amount;
    const [r, g, b] = hslToRgb(h, s, l);
    return Color.RGB(Math.round(r), Math.round(g), Math.round(b));
  }

  darken(amount: number) {
    let [h, s, l] = rgbToHsl(this.r, this.g, this.b);
    l -= amount;
    const [r, g, b] = hslToRgb(h, s, l);
    return Color.RGB(Math.round(r), Math.round(g), Math.round(b));
  }

  toHex() {
    return "#" +
      this.componentToHex(this.r) +
      this.componentToHex(this.g) +
      this.componentToHex(this.b);
  }

  toRGB() {
    return [this.r, this.g, this.b, this.a];
  }

  /**
   * Creates a color from an RGB value.
   * @param r The red value between 0 and 255.
   * @param g The green value between 0 and 255.
   * @param b The blue value between 0 and 255.
   * @param a The alpha value between 0 and 255.
   * @returns A color object.
   */
  static RGB(r: number, g: number, b: number, a: number = 255) {
    return new Color(r, g, b, a);
  }

  /**
   * Creates a color from an HSL value.
   * @param h The hue between 0 and 1.
   * @param s The saturation between 0 and 1.
   * @param l The lightness between 0 and 1.
   * @param a The alpha between 0 and 1.
   * @returns A color object.
   */
  static HSL(h: number, s: number, l: number, a: number = 1) {
    const rgb = hslToRgb(h, s, l);
    return new Color(rgb[0], rgb[1], rgb[2], a);
  }

  /**
   * Creates a color from an HSV value.
   * @param h The hue between 0 and 1.
   * @param s The saturation between 0 and 1.
   * @param v The value between 0 and 1.
   * @param a The alpha between 0 and 1.
   * @returns  A color object.
   */
  static HSV(h: number, s: number, v: number, a: number = 1) {
    const rgb = hsvToRgb(h, s, v);
    return new Color(rgb[0], rgb[1], rgb[2], a);
  }

  private componentToHex(c: number) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
}