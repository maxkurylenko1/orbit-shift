export type InputActionHandler = () => void;

export class InputManager {
  private readonly actionHandlers = new Set<InputActionHandler>();
  private started = false;

  private readonly handlePointerDown = (): void => {
    this.emitAction();
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.code !== 'Space' || event.repeat) {
      return;
    }

    event.preventDefault();
    this.emitAction();
  };

  public constructor(private readonly pointerTarget: HTMLElement) {}

  public start(): void {
    if (this.started) {
      return;
    }

    this.started = true;
    this.pointerTarget.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  public subscribe(handler: InputActionHandler): () => void {
    this.actionHandlers.add(handler);

    return () => {
      this.actionHandlers.delete(handler);
    };
  }

  public destroy(): void {
    if (this.started) {
      this.pointerTarget.removeEventListener('pointerdown', this.handlePointerDown);
      window.removeEventListener('keydown', this.handleKeyDown);
      this.started = false;
    }

    this.actionHandlers.clear();
  }

  private emitAction(): void {
    for (const handler of this.actionHandlers) {
      handler();
    }
  }
}
