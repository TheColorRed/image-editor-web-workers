import { ImageLayer, Project } from '@paintbucket/client';
import { Engine } from '@paintbucket/core';

const rachel = new ImageLayer('assets/images/rachel-aldana.png');
// const rachel = new ImageLayer('assets/images/dog.jpg');
// const massiveTits = new ImageLayer('assets/images/massive-tits.jpg');

// const manager = ColorClient.init();
const project = new Project({
  attach: '#canvas'
});

// Watch for layer load
project.events.on('layerLoaded', () => project.draw());
// project.events.on('workComplete', () => project.draw());

project.addLayer(rachel);
// project.addLayer(massiveTits);

document.querySelector('input[type=range]')
  ?.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).value;
    rachel.apply(Engine.Color, 'lighten', value);
  });