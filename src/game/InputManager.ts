import { InputState } from '../store/types';

export class InputManager {
  private inputState: InputState;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.inputState = this.getEmptyInputState();
    this.attachEventListeners();
  }

  private getEmptyInputState(): InputState {
    return {
      keys: {
        w: false,
        a: false,
        s: false,
        d: false,
        up: false,
        down: false,
        left: false,
        right: false,
        space: false,
        e: false,
        escape: false,
      },
      mouse: null,
    };
  }

  private attachEventListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    this.canvas.addEventListener('touchstart', this.handleTouchStart);
    this.canvas.addEventListener('touchmove', this.handleTouchMove);
    this.canvas.addEventListener('touchend', this.handleTouchEnd);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    const key = e.key.toLowerCase();

    if (key === 'w') this.inputState.keys.w = true;
    if (key === 'a') this.inputState.keys.a = true;
    if (key === 's') this.inputState.keys.s = true;
    if (key === 'd') this.inputState.keys.d = true;
    if (key === 'arrowup') this.inputState.keys.up = true;
    if (key === 'arrowdown') this.inputState.keys.down = true;
    if (key === 'arrowleft') this.inputState.keys.left = true;
    if (key === 'arrowright') this.inputState.keys.right = true;
    if (key === ' ') this.inputState.keys.space = true;
    if (key === 'e') this.inputState.keys.e = true;
    if (key === 'escape') this.inputState.keys.escape = true;
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    const key = e.key.toLowerCase();

    if (key === 'w') this.inputState.keys.w = false;
    if (key === 'a') this.inputState.keys.a = false;
    if (key === 's') this.inputState.keys.s = false;
    if (key === 'd') this.inputState.keys.d = false;
    if (key === 'arrowup') this.inputState.keys.up = false;
    if (key === 'arrowdown') this.inputState.keys.down = false;
    if (key === 'arrowleft') this.inputState.keys.left = false;
    if (key === 'arrowright') this.inputState.keys.right = false;
    if (key === ' ') this.inputState.keys.space = false;
    if (key === 'e') this.inputState.keys.e = false;
    if (key === 'escape') this.inputState.keys.escape = false;
  };

  private handleMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (!this.inputState.mouse) {
      this.inputState.mouse = { x, y, leftButton: false, rightButton: false };
    } else {
      this.inputState.mouse.x = x;
      this.inputState.mouse.y = y;
    }
  };

  private handleMouseDown = (e: MouseEvent): void => {
    if (!this.inputState.mouse) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      this.inputState.mouse = { x, y, leftButton: false, rightButton: false };
    }

    if (e.button === 0) this.inputState.mouse.leftButton = true;
    if (e.button === 2) this.inputState.mouse.rightButton = true;
  };

  private handleMouseUp = (e: MouseEvent): void => {
    if (!this.inputState.mouse) return;

    if (e.button === 0) this.inputState.mouse.leftButton = false;
    if (e.button === 2) this.inputState.mouse.rightButton = false;
  };

  private handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    this.inputState.mouse = { x, y, leftButton: true, rightButton: false };
  };

  private handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    if (this.inputState.mouse) {
      this.inputState.mouse.x = x;
      this.inputState.mouse.y = y;
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    e.preventDefault();
    if (this.inputState.mouse) {
      this.inputState.mouse.leftButton = false;
    }
  };

  getInput(): InputState {
    return { ...this.inputState, keys: { ...this.inputState.keys } };
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);

    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
  }
}
