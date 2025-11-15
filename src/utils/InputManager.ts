import { InputState } from '../store/types';

export class InputManager {
  private inputState: InputState;
  private canvas: HTMLCanvasElement;
  private boundHandlers: Map<string, EventListener> = new Map();

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
        escape: false
      },
      mouse: null
    };
  }

  private attachEventListeners(): void {
    this.boundHandlers.set('keydown', this.handleKeyDown.bind(this));
    this.boundHandlers.set('keyup', this.handleKeyUp.bind(this));
    this.boundHandlers.set('mousemove', this.handleMouseMove.bind(this));
    this.boundHandlers.set('mousedown', this.handleMouseDown.bind(this));
    this.boundHandlers.set('mouseup', this.handleMouseUp.bind(this));
    this.boundHandlers.set('contextmenu', this.handleContextMenu.bind(this));
    this.boundHandlers.set('touchstart', this.handleTouchStart.bind(this));
    this.boundHandlers.set('touchmove', this.handleTouchMove.bind(this));
    this.boundHandlers.set('touchend', this.handleTouchEnd.bind(this));

    window.addEventListener('keydown', this.boundHandlers.get('keydown')!);
    window.addEventListener('keyup', this.boundHandlers.get('keyup')!);
    this.canvas.addEventListener('mousemove', this.boundHandlers.get('mousemove')!);
    this.canvas.addEventListener('mousedown', this.boundHandlers.get('mousedown')!);
    this.canvas.addEventListener('mouseup', this.boundHandlers.get('mouseup')!);
    this.canvas.addEventListener('contextmenu', this.boundHandlers.get('contextmenu')!);
    this.canvas.addEventListener('touchstart', this.boundHandlers.get('touchstart')!);
    this.canvas.addEventListener('touchmove', this.boundHandlers.get('touchmove')!);
    this.canvas.addEventListener('touchend', this.boundHandlers.get('touchend')!);
  }

  private handleKeyDown = (e: Event): void => {
    const event = e as KeyboardEvent;
    const key = event.key.toLowerCase();

    switch (key) {
      case 'w':
        this.inputState.keys.w = true;
        break;
      case 'a':
        this.inputState.keys.a = true;
        break;
      case 's':
        this.inputState.keys.s = true;
        break;
      case 'd':
        this.inputState.keys.d = true;
        break;
      case 'arrowup':
        this.inputState.keys.up = true;
        break;
      case 'arrowdown':
        this.inputState.keys.down = true;
        break;
      case 'arrowleft':
        this.inputState.keys.left = true;
        break;
      case 'arrowright':
        this.inputState.keys.right = true;
        break;
      case ' ':
        this.inputState.keys.space = true;
        event.preventDefault();
        break;
      case 'e':
        this.inputState.keys.e = true;
        break;
      case 'escape':
        this.inputState.keys.escape = true;
        break;
    }
  };

  private handleKeyUp = (e: Event): void => {
    const event = e as KeyboardEvent;
    const key = event.key.toLowerCase();

    switch (key) {
      case 'w':
        this.inputState.keys.w = false;
        break;
      case 'a':
        this.inputState.keys.a = false;
        break;
      case 's':
        this.inputState.keys.s = false;
        break;
      case 'd':
        this.inputState.keys.d = false;
        break;
      case 'arrowup':
        this.inputState.keys.up = false;
        break;
      case 'arrowdown':
        this.inputState.keys.down = false;
        break;
      case 'arrowleft':
        this.inputState.keys.left = false;
        break;
      case 'arrowright':
        this.inputState.keys.right = false;
        break;
      case ' ':
        this.inputState.keys.space = false;
        break;
      case 'e':
        this.inputState.keys.e = false;
        break;
      case 'escape':
        this.inputState.keys.escape = false;
        break;
    }
  };

  private handleMouseMove = (e: Event): void => {
    const event = e as MouseEvent;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    if (!this.inputState.mouse) {
      this.inputState.mouse = { x, y, leftButton: false, rightButton: false };
    } else {
      this.inputState.mouse.x = x;
      this.inputState.mouse.y = y;
    }
  };

  private handleMouseDown = (e: Event): void => {
    const event = e as MouseEvent;
    if (!this.inputState.mouse) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      this.inputState.mouse = { x, y, leftButton: false, rightButton: false };
    }

    if (event.button === 0) {
      this.inputState.mouse.leftButton = true;
    } else if (event.button === 2) {
      this.inputState.mouse.rightButton = true;
    }
  };

  private handleMouseUp = (e: Event): void => {
    const event = e as MouseEvent;
    if (!this.inputState.mouse) return;

    if (event.button === 0) {
      this.inputState.mouse.leftButton = false;
    } else if (event.button === 2) {
      this.inputState.mouse.rightButton = false;
    }
  };

  private handleContextMenu = (e: Event): void => {
    e.preventDefault();
  };

  private handleTouchStart = (e: Event): void => {
    const event = e as TouchEvent;
    event.preventDefault();

    if (event.touches.length > 0) {
      const touch = event.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;

      this.inputState.mouse = { x, y, leftButton: true, rightButton: false };
    }
  };

  private handleTouchMove = (e: Event): void => {
    const event = e as TouchEvent;
    event.preventDefault();

    if (event.touches.length > 0) {
      const touch = event.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;

      if (this.inputState.mouse) {
        this.inputState.mouse.x = x;
        this.inputState.mouse.y = y;
      }
    }
  };

  private handleTouchEnd = (e: Event): void => {
    const event = e as TouchEvent;
    event.preventDefault();

    if (this.inputState.mouse) {
      this.inputState.mouse.leftButton = false;
    }
  };

  getInput(): InputState {
    return { ...this.inputState, keys: { ...this.inputState.keys } };
  }

  resetMouseButtons(): void {
    if (this.inputState.mouse) {
      this.inputState.mouse.leftButton = false;
      this.inputState.mouse.rightButton = false;
    }
  }

  destroy(): void {
    window.removeEventListener('keydown', this.boundHandlers.get('keydown')!);
    window.removeEventListener('keyup', this.boundHandlers.get('keyup')!);
    this.canvas.removeEventListener('mousemove', this.boundHandlers.get('mousemove')!);
    this.canvas.removeEventListener('mousedown', this.boundHandlers.get('mousedown')!);
    this.canvas.removeEventListener('mouseup', this.boundHandlers.get('mouseup')!);
    this.canvas.removeEventListener('contextmenu', this.boundHandlers.get('contextmenu')!);
    this.canvas.removeEventListener('touchstart', this.boundHandlers.get('touchstart')!);
    this.canvas.removeEventListener('touchmove', this.boundHandlers.get('touchmove')!);
    this.canvas.removeEventListener('touchend', this.boundHandlers.get('touchend')!);
    this.boundHandlers.clear();
  }
}
