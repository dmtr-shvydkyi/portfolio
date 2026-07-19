import { useCallback } from 'react';

// Reuse a single AudioContext, same pattern as useKeyboardSound
let sharedAudioContext: (AudioContext | null) = null;

function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (sharedAudioContext && sharedAudioContext.state !== 'closed') {
    return sharedAudioContext;
  }
  try {
    const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    sharedAudioContext = new Ctx();
    return sharedAudioContext;
  } catch {
    return null;
  }
}

type ThrustSettings = {
  duration: number;
  noiseFrom: number;
  noiseTo: number;
  noiseQ: number;
  noiseGain: number;
  subFrom: number;
  subTo: number;
  subGain: number;
};

// Filtered noise sweeping down + a sub-oscillator drop: a short rocket-thruster puff
function playThrust(settings: ThrustSettings) {
  const audioContext = getSharedAudioContext();
  if (!audioContext) return;

  try {
    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }
    const now = audioContext.currentTime;
    const { duration } = settings;

    const bufferSize = Math.max(1, Math.floor(audioContext.sampleRate * duration));
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const thrustFilter = audioContext.createBiquadFilter();
    thrustFilter.type = 'bandpass';
    thrustFilter.Q.value = settings.noiseQ;
    thrustFilter.frequency.setValueAtTime(settings.noiseFrom, now);
    thrustFilter.frequency.exponentialRampToValueAtTime(settings.noiseTo, now + duration);

    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(settings.noiseGain, now + 0.012);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const subOsc = audioContext.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(settings.subFrom, now);
    subOsc.frequency.exponentialRampToValueAtTime(settings.subTo, now + duration);

    const subGain = audioContext.createGain();
    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.exponentialRampToValueAtTime(settings.subGain, now + 0.015);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noiseSource.connect(thrustFilter);
    thrustFilter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);

    subOsc.connect(subGain);
    subGain.connect(audioContext.destination);

    noiseSource.start(now);
    noiseSource.stop(now + duration);
    subOsc.start(now);
    subOsc.stop(now + duration);
  } catch {
    // Silently fail if audio is not available
  }
}

export function useGameSounds() {
  // Soft thruster puff for paddle movement
  const playThruster = useCallback(() => {
    playThrust({
      duration: 0.22,
      noiseFrom: 420,
      noiseTo: 90,
      noiseQ: 1.1,
      noiseGain: 0.2,
      subFrom: 75,
      subTo: 42,
      subGain: 0.12,
    });
  }, []);

  // Bigger engine burst when the ball bounces off the paddle
  const playBounce = useCallback(() => {
    playThrust({
      duration: 0.16,
      noiseFrom: 900,
      noiseTo: 140,
      noiseQ: 1.4,
      noiseGain: 0.28,
      subFrom: 170,
      subTo: 55,
      subGain: 0.16,
    });
  }, []);

  return { playThruster, playBounce };
}
