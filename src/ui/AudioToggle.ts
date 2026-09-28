import type { GameAudio } from '../audio/GameAudio';

const STORAGE_KEY = 'orbit-shift:muted';

const readMutedPreference = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const writeMutedPreference = (muted: boolean): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
};

export class AudioToggle {
  private readonly button = document.createElement('button');

  private readonly handleClick = (): void => {
    this.audio.unlock();
    const muted = this.audio.toggleMuted();

    writeMutedPreference(muted);
    this.render();
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.code !== 'KeyM' || event.repeat) {
      return;
    }

    event.preventDefault();
    this.handleClick();
  };

  public constructor(
    host: HTMLElement,
    private readonly audio: GameAudio,
  ) {
    this.button.type = 'button';
    this.button.className = 'audio-toggle';
    this.button.addEventListener('click', this.handleClick);
    window.addEventListener('keydown', this.handleKeyDown);

    this.audio.setMuted(readMutedPreference());
    this.render();
    host.appendChild(this.button);
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    this.button.removeEventListener('click', this.handleClick);
    this.button.remove();
  }

  private render(): void {
    const muted = this.audio.isMuted;

    this.button.textContent = muted ? 'SOUND OFF' : 'SOUND ON';
    this.button.setAttribute('aria-pressed', String(muted));
    this.button.setAttribute(
      'aria-label',
      muted ? 'Enable game sound' : 'Mute game sound',
    );
    this.button.title = muted ? 'Sound off · press M' : 'Sound on · press M';
  }
}
