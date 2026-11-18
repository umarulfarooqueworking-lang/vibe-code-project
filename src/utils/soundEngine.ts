// Procedural Web Audio API sound engine for Nike Sneaker Motion website
// Zero external audio files required — synthesized in real-time

class SoundEngine {
  private ctx: AudioContext | null = null
  private isMuted: boolean = false
  private lastTickTime: number = 0

  constructor() {
    // Check saved preference
    const saved = typeof window !== 'undefined' ? localStorage.getItem('nike_sfx_muted') : null
    this.isMuted = saved === 'true'
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public getMuted(): boolean {
    return this.isMuted
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted
    if (typeof window !== 'undefined') {
      localStorage.setItem('nike_sfx_muted', String(this.isMuted))
    }
    if (!this.isMuted) {
      this.initContext()
      this.playTick(1200)
    }
    return this.isMuted
  }

  // Micro-click on frame scrub (rate-limited)
  public playScrubTick() {
    if (this.isMuted) return
    const now = performance.now()
    if (now - this.lastTickTime < 45) return // throttle to max 22 clicks/sec
    this.lastTickTime = now
    this.playTick(1800, 0.015, 0.012)
  }

  public playTick(frequency = 1400, volume = 0.02, duration = 0.015) {
    if (this.isMuted) return
    this.initContext()
    if (!this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + duration)

    gain.gain.setValueAtTime(volume, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(this.ctx.currentTime + duration)
  }

  // Pneumatic release sound when shoe explodes apart
  public playExplode() {
    if (this.isMuted) return
    this.initContext()
    if (!this.ctx) return

    const bufferSize = this.ctx.sampleRate * 0.4
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(200, this.ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.35)
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.38)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    noise.start()
  }

  // Satisfying magnetic lock / thud when sneaker snaps back together
  public playAssemblyLock() {
    if (this.isMuted) return
    this.initContext()
    if (!this.ctx) return

    // Low sub thud
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(140, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(38, this.ctx.currentTime + 0.18)

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.22)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(this.ctx.currentTime + 0.22)

    // Crisp latch click
    this.playTick(2400, 0.04, 0.02)
  }
}

export const sfx = new SoundEngine()
