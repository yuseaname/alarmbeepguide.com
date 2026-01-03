export class BeepAudioGenerator {
  private audioContext: AudioContext | null = null
  private volume: number = 0.5

  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value))
  }

  getVolume(): number {
    return this.volume
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    return this.audioContext
  }

  private createBeep(frequency: number, duration: number, startTime: number): void {
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'square'

    const maxGain = 0.3 * this.volume

    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(maxGain, startTime + 0.01)
    gainNode.gain.setValueAtTime(maxGain, startTime + duration - 0.05)
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration)

    oscillator.start(startTime)
    oscillator.stop(startTime + duration)
  }

  async playPattern(patternType: string): Promise<void> {
    const ctx = this.getAudioContext()
    
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    const now = ctx.currentTime
    const beepFreq = 2800
    const chirpFreq = 3200

    switch (patternType) {
      case 'chirp-30s':
        this.createBeep(chirpFreq, 0.05, now)
        break

      case '3-beep-repeat':
        this.createBeep(beepFreq, 0.2, now)
        this.createBeep(beepFreq, 0.2, now + 0.3)
        this.createBeep(beepFreq, 0.2, now + 0.6)
        this.createBeep(beepFreq, 0.2, now + 1.8)
        this.createBeep(beepFreq, 0.2, now + 2.1)
        this.createBeep(beepFreq, 0.2, now + 2.4)
        break

      case 'continuous':
        for (let i = 0; i < 8; i++) {
          this.createBeep(beepFreq, 0.15, now + (i * 0.15))
        }
        break

      case '5-chirp':
        for (let i = 0; i < 5; i++) {
          this.createBeep(chirpFreq, 0.05, now + (i * 0.15))
        }
        break

      case 'flash-red':
        this.createBeep(1500, 0.1, now)
        this.createBeep(1500, 0.1, now + 0.5)
        break

      case 'rapid-blink':
        for (let i = 0; i < 6; i++) {
          this.createBeep(1800, 0.05, now + (i * 0.1))
        }
        break

      default:
        this.createBeep(beepFreq, 0.1, now)
    }
  }

  stop(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

export const audioGenerator = new BeepAudioGenerator()
