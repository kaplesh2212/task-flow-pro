let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!sharedCtx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      sharedCtx = new Ctor();
    }
    if (sharedCtx.state === "suspended") {
      void sharedCtx.resume();
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem("Infinitodo:sfx") === "off";
}

export function setMuted(muted: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("Infinitodo:sfx", muted ? "off" : "on");
}

export function getMuted(): boolean {
  return isMuted();
}

type Note = { freq: number; duration: number; delay?: number; type?: OscillatorType; gain?: number };

function playNotes(notes: Note[]) {
  if (isMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  for (const note of notes) {
    const start = now + (note.delay ?? 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = note.type ?? "sine";
    osc.frequency.value = note.freq;

    const peak = note.gain ?? 0.12;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + note.duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + note.duration + 0.02);
  }
}

export const sfx = {
  click: () =>
    playNotes([{ freq: 660, duration: 0.06, type: "triangle", gain: 0.05 }]),
  taskComplete: () =>
    playNotes([
      { freq: 523.25, duration: 0.12, type: "sine" }, // C5
      { freq: 659.25, duration: 0.12, type: "sine", delay: 0.08 }, // E5
      { freq: 783.99, duration: 0.18, type: "sine", delay: 0.16 }, // G5
    ]),
  habitCheckIn: () =>
    playNotes([
      { freq: 440, duration: 0.1, type: "triangle" }, // A4
      { freq: 554.37, duration: 0.1, type: "triangle", delay: 0.07 }, // C#5
      { freq: 659.25, duration: 0.14, type: "triangle", delay: 0.14 }, // E5
      { freq: 880, duration: 0.2, type: "sine", delay: 0.22 }, // A5
    ]),
  reminderAlert: () =>
    playNotes([
      { freq: 880, duration: 0.18, type: "sine", gain: 0.15 },
      { freq: 1108.73, duration: 0.18, type: "sine", delay: 0.18, gain: 0.15 },
      { freq: 880, duration: 0.18, type: "sine", delay: 0.36, gain: 0.15 },
    ]),
  delete: () =>
    playNotes([
      { freq: 320, duration: 0.1, type: "sawtooth", gain: 0.06 },
      { freq: 220, duration: 0.12, type: "sawtooth", delay: 0.06, gain: 0.06 },
    ]),
  pop: () =>
    playNotes([{ freq: 800, duration: 0.05, type: "square", gain: 0.06 }]),
  panicAlert: () => {
    // Loud, repeating siren-like alert
    const notes: Note[] = [];
    for (let i = 0; i < 15; i++) {
      notes.push({ freq: 800, duration: 0.1, type: "square", delay: i * 0.2, gain: 0.2 });
      notes.push({ freq: 1200, duration: 0.1, type: "square", delay: i * 0.2 + 0.1, gain: 0.2 });
    }
    playNotes(notes);
  },
};
