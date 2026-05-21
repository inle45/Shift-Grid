// Web Audio API synth — no external dependencies
let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  vol = 0.25,
  delay = 0,
) {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = type
    osc.frequency.value = freq
    const t = c.currentTime + delay
    gain.gain.setValueAtTime(vol, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
    osc.start(t)
    osc.stop(t + duration)
  } catch {
    // AudioContext blocked or not supported — silent fail
  }
}

export const sfx = {
  tap:        () => tone(880, 0.07, 'sine', 0.22),
  miss:       () => tone(140, 0.18, 'sawtooth', 0.18),
  correct:    () => tone(660, 0.09, 'triangle', 0.2),
  score:      () => tone(700, 0.08, 'sine', 0.2),
  multiplier: () => {
    tone(440, 0.09, 'sine', 0.28)
    tone(660, 0.12, 'sine', 0.28, 0.09)
    tone(880, 0.18, 'sine', 0.3,  0.18)
  },
  combo:      () => tone(1100, 0.07, 'sine', 0.18),
  countdown:  () => tone(440,  0.1,  'square', 0.15),
  go:         () => {
    tone(660, 0.08, 'square', 0.2)
    tone(880, 0.15, 'square', 0.25, 0.08)
  },
  gameEnd:    () => {
    tone(440, 0.15, 'sine', 0.25)
    tone(554, 0.15, 'sine', 0.25, 0.16)
    tone(659, 0.25, 'sine', 0.3,  0.32)
  },
  newRecord:  () => {
    [440, 554, 659, 880].forEach((f, i) => tone(f, 0.18, 'sine', 0.28, i * 0.13))
  },
}
