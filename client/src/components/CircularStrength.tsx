import { motion } from "framer-motion";

interface CircularStrengthProps { score:number; size?:number; strokeWidth?:number; }

export function CircularStrength({ score, size=120, strokeWidth=10 }: CircularStrengthProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s:number) => {
    if (s >= 80) return { stroke:"#10b981", glow:"rgba(16,185,129,0.4)", label:"Strong",  cls:"strength-strong"  };
    if (s >= 50) return { stroke:"#f59e0b", glow:"rgba(245,158,11,0.4)", label:"Average", cls:"strength-average" };
    return           { stroke:"#f43f5e", glow:"rgba(244,63,94,0.4)",  label:"Weak",    cls:"strength-weak"    };
  };

  const { stroke, glow, label, cls } = getColor(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center" style={{width:size,height:size}}>
        {/* Glow ring */}
        <div className="absolute rounded-full" style={{width:size-strokeWidth,height:size-strokeWidth,boxShadow:`0 0 30px ${glow}`,background:`${stroke}08`}}/>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} fill="transparent"/>
          <motion.circle cx={size/2} cy={size/2} r={radius} stroke={stroke} strokeWidth={strokeWidth}
            fill="transparent" strokeDasharray={circumference}
            initial={{strokeDashoffset:circumference}} animate={{strokeDashoffset:offset}}
            transition={{duration:1.8,ease:"easeOut"}} strokeLinecap="round"
            style={{filter:`drop-shadow(0 0 8px ${stroke})`}}/>
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <motion.span initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}} transition={{delay:0.5,duration:0.5}}
            className="text-2xl font-display font-bold" style={{color:stroke}}>{score}%</motion.span>
          <span className="text-[9px] uppercase tracking-widest text-white/30 font-600">Score</span>
        </div>
      </div>
      <motion.span initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.8}}
        className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${cls}`}>{label}</motion.span>
    </div>
  );
}
