import { Game } from './core/Game';
import './style.css';

const host = document.querySelector<HTMLElement>('#app');

if (!host) {
  throw new Error('Orbit Shift root element was not found.');
}

const game = new Game();
await game.init(host);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game.destroy();
  });
}
