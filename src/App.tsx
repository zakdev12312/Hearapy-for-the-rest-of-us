import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Square, Activity, RotateCcw, Sun, Moon } from 'lucide-react';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [frequency, setFrequency] = useState(50);
  const [timerDuration, setTimerDuration] = useState(30);
  const [mode, setMode] = useState<'restorative' | 'brown'>('brown');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });
  const [isSpinning, setIsSpinning] = useState(false);

  const timerPresets = [
    { label: '30s', value: 30 },
    { label: '1m', value: 60 },
    { label: '5m', value: 300 },
    { label: '∞', value: 0 }, // Infinite - no timer
  ];
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const konamiSequence = useRef<string[]>([]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const createBrownNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    return buffer;
  };

  const startTone = () => {
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (oscillatorRef.current || noiseNodeRef.current) {
      stopTone();
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.1);
    gain.connect(ctx.destination);

    if (mode === 'brown') {
      const buffer = createBrownNoiseBuffer(ctx);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Add lowpass filter for deep rumble effect (airplane-like)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200; // Cut off higher frequencies, keep deep rumble
      filter.Q.value = 0.7;

      noise.connect(filter);
      filter.connect(gain);
      noise.start();
      noiseNodeRef.current = noise;
    } else {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      osc.connect(gain);
      osc.start();
      oscillatorRef.current = osc;
    }

    gainNodeRef.current = gain;
    setIsPlaying(true);

    if (mode === 'restorative') {
      setTimeLeft(timerDuration);
      // Only start timer if not in infinite mode
      if (timerDuration > 0) {
        timerRef.current = window.setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              stopTone();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  };

  const stopTone = () => {
    const ctx = audioContextRef.current;
    if (ctx && gainNodeRef.current) {
      const gain = gainNodeRef.current;
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      
      if (oscillatorRef.current) {
        oscillatorRef.current.stop(ctx.currentTime + 0.1);
      }
      if (noiseNodeRef.current) {
        noiseNodeRef.current.stop(ctx.currentTime + 0.1);
      }
    }
    
    oscillatorRef.current = null;
    noiseNodeRef.current = null;
    gainNodeRef.current = null;
    setIsPlaying(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const resetTimer = () => {
    setTimeLeft(timerDuration);
    if (isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopTone();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    if (oscillatorRef.current && isPlaying && mode === 'restorative') {
      oscillatorRef.current.frequency.setTargetAtTime(frequency, audioContextRef.current!.currentTime, 0.01);
    }
    if (noiseNodeRef.current && isPlaying && mode === 'brown') {
      // Brown noise doesn't need frequency updates
    }
  }, [frequency, isPlaying, mode]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch {
          // Ignore errors if context is already closed
        }
      }
      if (noiseNodeRef.current) {
        try {
          noiseNodeRef.current.stop();
        } catch {
          // Ignore errors if context is already closed
        }
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Konami code easter egg: ↑ ↑ ↓ ↓ ← → ← → B A
  useEffect(() => {
    const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      konamiSequence.current.push(e.key);
      // Keep only the last 10 keys
      if (konamiSequence.current.length > 10) {
        konamiSequence.current.shift();
      }
      
      // Check if sequence matches Konami code
      if (konamiSequence.current.join(',') === KONAMI_CODE.join(',')) {
        setIsSpinning(true);
        konamiSequence.current = []; // Reset sequence
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset spin after animation completes
  useEffect(() => {
    if (isSpinning) {
      const timer = setTimeout(() => {
        setIsSpinning(false);
      }, 1000); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isSpinning]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${isSpinning ? 'animate-spin-smooth' : ''} ${theme === 'dark' ? 'bg-zinc-950 text-zinc-50 selection:bg-zinc-800' : 'bg-zinc-100 text-zinc-900 selection:bg-zinc-300'}`}>
      <div 
        onClick={() => {
          if (isPlaying) stopTone();
          setMode('brown');
          setTimeLeft(timerDuration);
        }}
        className={`absolute top-8 left-8 flex items-center space-x-2 cursor-pointer transition-transform duration-300 hover:scale-105 hover:-rotate-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
      >
        <Activity className={`w-6 h-6 ${theme === 'dark' ? 'text-zinc-50' : 'text-zinc-900'}`} />
        <span className={`font-bold tracking-tight text-xl ${theme === 'dark' ? 'text-zinc-50' : 'text-zinc-900'}`}>Hearapy For The Rest Of Us</span>
      </div>

      <div className="absolute top-8 right-8 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-white hover:bg-zinc-200 text-zinc-700 border border-zinc-300'}`}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={() => {
            if (isPlaying) stopTone();
            setMode(mode === 'restorative' ? 'brown' : 'restorative');
          }}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700' : 'bg-white hover:bg-zinc-200 text-zinc-700 border-zinc-300'}`}
        >
          {mode === 'restorative' ? 'Switch to Brown Noise' : 'Switch to Restorative'}
        </button>
      </div>

      <Card className={`max-w-md w-full shadow-2xl transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'}`}>
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-medium tracking-tight mb-2">
            {mode === 'restorative' ? 'Restorative Tone' : 'Brown Noise'}
          </CardTitle>
          <CardDescription className={`text-base ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {mode === 'restorative'
              ? timerDuration === 0
                ? `Infinite playback of ${frequency}Hz pure sine wave.`
                : `${timerDuration >= 60 ? `${Math.floor(timerDuration / 60)} minute${timerDuration >= 120 ? 's' : ''}` : `${timerDuration} seconds`} of ${frequency}Hz pure sine wave.`
              : 'Deep brown noise for relaxation and sleep.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center space-y-10">
          
          <div className="relative flex items-center justify-center gap-4">
            {mode === 'restorative' ? (
              <>
                <div className={`w-40 h-40 rounded-full border-4 flex items-center justify-center transition-colors duration-500 ${isPlaying ? 'border-emerald-500 bg-emerald-500/10' : theme === 'dark' ? 'border-zinc-700 bg-zinc-800/50' : 'border-zinc-300 bg-zinc-100'}`}>
                  <span className={`text-5xl font-light font-mono tabular-nums tracking-tighter ${theme === 'dark' ? '' : 'text-zinc-700'}`}>
                    {timerDuration === 0 ? '∞' : formatTime(timeLeft)}
                  </span>
                </div>
                <button
                  onClick={resetTimer}
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:scale-110 ${theme === 'dark' ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300 hover:text-zinc-800'}`}
                  title="Reset timer"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </>
            ) : (
              <div className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center transition-colors duration-500 ${isPlaying ? 'border-emerald-500 bg-emerald-500/10' : theme === 'dark' ? 'border-zinc-700 bg-zinc-800/50' : 'border-zinc-300 bg-zinc-100'}`}>
                <span className={`text-3xl font-medium tracking-tighter text-center leading-tight ${theme === 'dark' ? '' : 'text-zinc-700'}`}>
                  Brown<br/>Noise
                </span>
              </div>
            )}
          </div>

          {mode === 'restorative' && (
            <div className="w-full space-y-4 pt-4">
               <div className={`flex justify-between items-center text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                 <span>Timer</span>
                 <div className="flex gap-2 items-center">
                   {timerPresets.map((preset) => (
                     <button
                       key={preset.label}
                       onClick={() => { setTimerDuration(preset.value); setTimeLeft(preset.value); }}
                       disabled={isPlaying}
                       className={`px-2 py-1 text-xs rounded transition-colors ${
                         timerDuration === preset.value
                           ? theme === 'dark' ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-zinc-100'
                           : theme === 'dark' ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                       } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                       {preset.label}
                     </button>
                   ))}
                 </div>
               </div>
               
               <div className={`flex justify-between items-center text-sm font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                 <span>Frequency</span>
                 <span>{frequency} Hz</span>
               </div>
               <Slider 
                  value={[frequency]} 
                  onValueChange={(v: number[]) => setFrequency(v[0])} 
                  min={20} max={100} step={1} 
                  className="w-full" 
               />
            </div>
          )}

          <Button 
            onClick={isPlaying ? stopTone : startTone}
            size="lg"
            className={`w-full py-8 text-xl font-medium rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl ${isPlaying ? theme === 'dark' ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-600 text-zinc-100 hover:bg-zinc-700' : theme === 'dark' ? 'bg-zinc-100 text-zinc-950 hover:bg-white hover:scale-[1.02]' : 'bg-zinc-900 text-zinc-100 hover:bg-black hover:scale-[1.02]'}`}
          >
            {isPlaying ? (
              <>
                <Square className="mr-2 h-6 w-6" /> Stop
              </>
            ) : (
              <>
                <Play className="mr-2 h-6 w-6 fill-current" /> {mode === 'restorative' ? 'Start Tone' : 'Start Brown Noise'}
              </>
            )}
          </Button>

        </CardContent>
      </Card>
      
      <p className={`mt-12 text-sm max-w-sm text-center ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
        Make sure your device volume is set to a comfortable level before pressing start.
      </p>
      
      <p className={`mt-4 text-xs text-center ${theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'}`}>
        © 2025 zakdev12312 · MIT License
      </p>
    </div>
  );
}
