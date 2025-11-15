class SoundManager {
  private audioContext: AudioContext | null = null;
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.5;
  private initialized: boolean = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported', error);
    }
  }

  private generateTone(frequency: number, duration: number, volume: number = 0.3): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume * this.sfxVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playSound(soundId: string): void {
    if (!this.initialized) return;

    switch (soundId) {
      case 'hit':
        this.generateTone(440, 0.1);
        break;
      case 'swing':
        this.generateTone(330, 0.15);
        break;
      case 'death':
        this.generateTone(220, 0.3);
        setTimeout(() => this.generateTone(110, 0.2), 100);
        break;
      case 'purchase':
        this.generateTone(523, 0.1);
        setTimeout(() => this.generateTone(659, 0.1), 100);
        break;
      case 'equip':
        this.generateTone(659, 0.15);
        break;
      case 'victory':
        this.generateTone(523, 0.2);
        setTimeout(() => this.generateTone(659, 0.2), 200);
        setTimeout(() => this.generateTone(784, 0.3), 400);
        break;
      case 'defeat':
        this.generateTone(440, 0.2);
        setTimeout(() => this.generateTone(330, 0.3), 200);
        break;
    }
  }

  setVolume(type: 'music' | 'sfx', volume: number): void {
    if (type === 'music') {
      this.musicVolume = volume;
    } else {
      this.sfxVolume = volume;
    }
  }

  playMusic(): void {
    // Background music not implemented in basic version
  }

  stopMusic(): void {
    // Background music not implemented in basic version
  }
}

export const soundManager = new SoundManager();
