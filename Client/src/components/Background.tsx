import React, { useEffect, useState, useMemo } from 'react';

const backgroundStyles = `
@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}
@keyframes orbit {
  0% { transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg); }
}
@keyframes float-slow {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(15px, -20px) rotate(5deg); }
  66% { transform: translate(-10px, 15px) rotate(-5deg); }
}
.animate-twinkle { animation: twinkle 4s ease-in-out infinite; }
.animate-orbit { animation: orbit linear infinite; animation-duration: var(--orbit-duration, 120s); }
.animate-float-icons { animation: float-slow 10s ease-in-out infinite; }
`;

interface BackgroundProps {
  children?: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high' | string;
  showConstellations?: boolean;
  showZodiac?: boolean;
  showPlanets?: boolean;
}

// The "Chinese Character" style floating icons
const FLOATING_SYMBOLS = [
  { char: '♎', name: 'Libra', color: 'text-emerald-400/20' },
  { char: '♊', name: 'Gemini', color: 'text-indigo-400/20' },
  { char: '✨', name: 'Star', color: 'text-purple-400/20' },
  { char: '☄️', name: 'Comet', color: 'text-blue-400/20' },
];

const FloatingIcon = ({ symbol, index }: { symbol: typeof FLOATING_SYMBOLS[0], index: number }) => {
  const top = useMemo(() => (Math.abs(Math.sin(index * 456)) * 80) + 10, [index]);
  const left = useMemo(() => (Math.abs(Math.cos(index * 789)) * 80) + 10, [index]);
  const delay = useMemo(() => (index * 1.5) % 5, [index]);

  return (
    <div 
      className={`absolute ${symbol.color} animate-float-icons pointer-events-none select-none`}
      style={{
        top: `${top}%`,
        left: `${left}%`,
        fontSize: '2.5rem',
        animationDelay: `${delay}s`,
        zIndex: 1
      }}
    >
      {symbol.char}
    </div>
  );
};

const ConstellationOverlay = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" xmlns="http://www.w3.org/2000/svg">
    {/* Saptarishi */}
    <g className="text-indigo-300/40 stroke-current stroke-[0.8] fill-none transform translate(100, 50) scale(0.7) md:translate(150, 80) md:scale(0.9)">
      <path d="M0 60 L70 50 L130 70 L180 110 L280 110 L300 40 L200 30 L180 110" strokeDasharray="4 4" />
      {[0, 70, 130, 180, 280, 300, 200].map((x, i) => (
        <circle key={i} cx={x} cy={[60,50,70,110,110,40,30][i]} r="3" fill="white" className="animate-twinkle" />
      ))}
    </g>
    {/* Orion */}
    <g className="text-purple-300/40 stroke-current stroke-[0.8] fill-none transform translate(200, 450) scale(0.7) md:translate(800, 400) md:scale(1.1)">
      <path d="M50 20 L130 50 M50 180 L130 150" strokeDasharray="4 2" />
      <path d="M80 90 L100 100 L120 110" strokeWidth="1.5" /> 
      <path d="M50 20 L80 90 L50 180 M130 50 L120 110 L130 150" />
      {[ [50,20], [130,50], [80,90], [100,100], [120,110], [50,180], [130,150] ].map((pos, i) => (
        <circle key={i} cx={pos[0]} cy={pos[1]} r="2.5" fill="white" />
      ))}
    </g>
  </svg>
);

const Background: React.FC<BackgroundProps> = ({ 
  children, 
  intensity = 'medium',
  showConstellations = true,
  showZodiac = true,
  showPlanets = true
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-950">
      <style>{backgroundStyles}</style>
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-slate-900 to-indigo-950/20" />
      
      {showConstellations && <ConstellationOverlay />}
      
      {/* Floating Libra, Gemini, and Icons */}
      {showZodiac && FLOATING_SYMBOLS.map((symbol, i) => (
        <FloatingIcon key={i} symbol={symbol} index={i} />
      ))}

      {/* Random Stars */}
      {[...Array(intensity === 'high' ? 60 : 30)].map((_, i) => (
        <div key={i} className="absolute text-white/10 animate-twinkle pointer-events-none"
          style={{
            left: `${(Math.abs(Math.sin(i * 123)) * 100)}%`,
            top: `${(Math.abs(Math.cos(i * 456)) * 100)}%`,
            fontSize: '8px'
          }}
        >✦</div>
      ))}

      {/* Nebula/Planets */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none opacity-50">
        <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-[100px]" />
        {showPlanets && (
          <div className="relative w-full h-full animate-orbit" style={{ '--orbit-radius': '150px', '--orbit-duration': '100s' } as any}>
            <div className="w-4 h-4 rounded-full bg-blue-400/20 blur-[2px]" />
          </div>
        )}
      </div>
      
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

export default Background;