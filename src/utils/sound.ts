// Sound Manager using Web Audio API
// Since we don't have audio files, we'll use simple procedural sounds

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sfxVolume: number = 0.5;
  private musicSource: OscillatorNode | null = null;

  init(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  setVolume(type: 'music' | 'sfx', volume: number): void {
    if (type === 'sfx') {
      this.sfxVolume = volume;
    }
    // Music volume handling can be added later
  }

  // Play a simple tone for SFX
  playSound(type: 'hit' | 'swing' | 'death' | 'purchase' | 'victory' | 'defeat' | 'equip'): void {
    if (!this.audioContext || this.sfxVolume === 0) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Different sounds for different actions
      switch (type) {
        case 'hit':
          oscillator.frequency.value = 200;
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + 0.1);
          break;

        case 'swing':
          oscillator.frequency.value = 300;
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + 0.05);
          break;

        case 'death':
          oscillator.frequency.value = 100;
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.4, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + 0.3);
          break;

        case 'purchase':
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + 0.2);
          break;

        case 'victory':
          // Play a simple ascending tone
          oscillator.frequency.value = 400;
          oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.5);
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + 0.5);
          break;

        case 'defeat':
          // Play a descending tone
          oscillator.frequency.value = 400;
          oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + 0.5);
          break;

        case 'equip':
          oscillator.frequency.value = 600;
          oscillator.type = 'triangle';
          gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + 0.15);
          break;
      }
    } catch (e) {
      console.warn('Error playing sound:', e);
    }
  }

  playMusic(): void {
    // Simple background music loop (optional)
    // Not implementing to avoid annoyance
  }

  stopMusic(): void {
    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource = null;
    }
  }
}

export const soundManager = new SoundManager();
