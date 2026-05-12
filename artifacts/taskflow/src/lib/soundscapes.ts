let audioCtx: AudioContext | null = null;
let noiseNode: AudioNode | null = null;
let filterNode: BiquadFilterNode | null = null;
let gainNode: GainNode | null = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export type SoundscapeType = "none" | "white" | "pink" | "brown" | "rain" | "waves";

export const soundscapes = {
  play: (type: SoundscapeType, volume: number = 0.1) => {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();

    // Stop current
    if (noiseNode) {
      noiseNode.disconnect();
      noiseNode = null;
    }

    if (type === "none") return;

    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    // Generate White Noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);

    filterNode = ctx.createBiquadFilter();
    filterNode.type = "lowpass";

    if (type === "white") {
      filterNode.frequency.value = 10000;
    } else if (type === "pink") {
      filterNode.frequency.value = 1000;
    } else if (type === "brown" || type === "rain") {
      filterNode.frequency.value = 400;
    } else if (type === "waves") {
      filterNode.type = "bandpass";
      filterNode.frequency.value = 500;
      // Animate filter for waves
      const animate = () => {
        if (!filterNode) return;
        const now = ctx.currentTime;
        filterNode.frequency.exponentialRampToValueAtTime(200, now + 4);
        filterNode.frequency.exponentialRampToValueAtTime(800, now + 8);
        setTimeout(animate, 8000);
      };
      animate();
    }

    whiteNoise.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);
    whiteNoise.start();
    noiseNode = whiteNoise;
  },
  stop: () => {
    if (noiseNode) {
      noiseNode.disconnect();
      noiseNode = null;
    }
  },
  setVolume: (volume: number) => {
    if (gainNode && audioCtx) {
      gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), audioCtx.currentTime + 0.1);
    }
  }
};
