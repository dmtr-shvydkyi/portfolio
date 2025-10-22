import { useCallback } from 'react';

export function useKeyboardSound() {
  const playSound = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;
      
      // Randomly select one of 5 keyboard sound variations
      const variation = Math.floor(Math.random() * 5);
      
      // Variation settings
      const variations = {
        0: { 
          name: 'Deep Thocky',
          clickFreq: 1800, clickQ: 0.6, clickGainPeak: 0.4,
          thockFreq: 140, thockQ: 12, thockGainPeak: 0.9,
          osc1: 120, osc2: 240, bodyGainPeak: 0.25,
          clickDecay: 0.020, thockDecay: 0.070, bodyDecay: 0.090
        },
        1: { 
          name: 'Crisp Clicky',
          clickFreq: 3500, clickQ: 1.8, clickGainPeak: 1.0,
          thockFreq: 220, thockQ: 4, thockGainPeak: 0.35,
          osc1: 200, osc2: 350, bodyGainPeak: 0.08,
          clickDecay: 0.008, thockDecay: 0.025, bodyDecay: 0.035
        },
        2: { 
          name: 'Smooth Tactile',
          clickFreq: 2400, clickQ: 1.0, clickGainPeak: 0.65,
          thockFreq: 180, thockQ: 7, thockGainPeak: 0.65,
          osc1: 160, osc2: 290, bodyGainPeak: 0.16,
          clickDecay: 0.014, thockDecay: 0.045, bodyDecay: 0.060
        },
        3: { 
          name: 'Muted Linear',
          clickFreq: 2000, clickQ: 0.5, clickGainPeak: 0.3,
          thockFreq: 160, thockQ: 10, thockGainPeak: 0.5,
          osc1: 140, osc2: 260, bodyGainPeak: 0.12,
          clickDecay: 0.018, thockDecay: 0.055, bodyDecay: 0.070
        },
        4: { 
          name: 'Creamy',
          clickFreq: 1600, clickQ: 0.4, clickGainPeak: 0.25,
          thockFreq: 165, thockQ: 14, thockGainPeak: 0.85,
          osc1: 135, osc2: 255, bodyGainPeak: 0.30,
          clickDecay: 0.025, thockDecay: 0.080, bodyDecay: 0.100
        }
      };
      
      const v = variations[variation as keyof typeof variations];
      
      // Create noise buffer
      const bufferSize = audioContext.sampleRate * 0.1;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      
      // Generate pink noise
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        noiseData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        noiseData[i] *= 0.11;
        b6 = white * 0.115926;
      }
      
      // Noise source
      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      
      // Filters
      const clickFilter = audioContext.createBiquadFilter();
      clickFilter.type = 'highpass';
      clickFilter.frequency.value = v.clickFreq;
      clickFilter.Q.value = v.clickQ;
      
      const bodyFilter = audioContext.createBiquadFilter();
      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.value = 800;
      bodyFilter.Q.value = 2;
      
      const thockFilter = audioContext.createBiquadFilter();
      thockFilter.type = 'bandpass';
      thockFilter.frequency.value = v.thockFreq;
      thockFilter.Q.value = v.thockQ;
      
      // Oscillators
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.value = v.osc1;
      osc2.frequency.value = v.osc2;
      
      // Gain nodes
      const clickGain = audioContext.createGain();
      const bodyGain = audioContext.createGain();
      const thockGain = audioContext.createGain();
      const masterGain = audioContext.createGain();
      
      // Connect audio graph
      noiseSource.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(masterGain);
      
      noiseSource.connect(bodyFilter);
      bodyFilter.connect(thockGain);
      thockGain.connect(thockFilter);
      thockFilter.connect(masterGain);
      
      osc1.connect(bodyGain);
      osc2.connect(bodyGain);
      bodyGain.connect(masterGain);
      
      masterGain.connect(audioContext.destination);
      
      // Click envelope
      clickGain.gain.setValueAtTime(0, now);
      clickGain.gain.linearRampToValueAtTime(v.clickGainPeak, now + 0.001);
      clickGain.gain.exponentialRampToValueAtTime(0.01, now + v.clickDecay);
      
      // Thock envelope
      thockGain.gain.setValueAtTime(0, now);
      thockGain.gain.linearRampToValueAtTime(v.thockGainPeak, now + 0.003);
      thockGain.gain.exponentialRampToValueAtTime(0.01, now + v.thockDecay);
      
      // Body envelope
      bodyGain.gain.setValueAtTime(0, now);
      bodyGain.gain.linearRampToValueAtTime(v.bodyGainPeak, now + 0.005);
      bodyGain.gain.exponentialRampToValueAtTime(0.01, now + v.bodyDecay);
      
      // Master volume
      masterGain.gain.setValueAtTime(0.4, now);
      masterGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      
      // Start and stop
      noiseSource.start(now);
      osc1.start(now);
      osc2.start(now);
      noiseSource.stop(now + 0.1);
      osc1.stop(now + 0.1);
      osc2.stop(now + 0.1);
    } catch (error) {
      // Silently fail if audio context is not supported
      console.warn('Audio context not supported:', error);
    }
  }, []);

  return playSound;
}

