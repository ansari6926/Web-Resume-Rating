import { useAuth } from "@/hooks/use-auth";
import { useResumes } from "@/hooks/use-resumes";
import { useLocation } from "wouter";
import { UploadResumeDialog } from "@/components/UploadResumeDialog";
import { ResumeCard } from "@/components/ResumeCard";
import { Button } from "@/components/ui/button";
import { LogOut, FileText, Upload, TrendingUp, Star, Clock } from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { resumes, isLoading: isResumesLoading } = useResumes();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthLoading && !user) setLocation("/auth");
    if (!isAuthLoading && user && user.role !== "student") setLocation("/recruiter-dashboard");
  }, [user, isAuthLoading, setLocation]);

  if (isAuthLoading || !user) return (
    <div className="flex h-screen items-center justify-center" style={{background:'#09090f'}}>
      <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin"/>
    </div>
  );

  const myResumes = resumes?.filter(r => r.studentId === user.id) || [];
  const reviewed  = myResumes.filter(r => r.reviews?.length > 0);
  const avgScore  = reviewed.length
    ? Math.round(reviewed.reduce((s,r) => s + (r.reviews[0]?.score||0), 0) / reviewed.length)
    : 0;

  return (
    <div className="min-h-screen relative" style={{background:'#09090f'}}>
      <div className="animated-bg"><div className="animated-bg-extra"/></div>
      <div className="grid-pattern"/>

      {/* Navbar */}
      <motion.nav initial={{y:-60,opacity:0}} animate={{y:0,opacity:1}}
        className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white"/>
            </div>
            <span className="font-display text-lg font-800 text-white">Resume<span className="gradient-text">Rate</span></span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm text-white/60">
              <div className="pulse-dot w-2 h-2"/>
              {user.name}
            </div>
            <Button onClick={()=>logout()} variant="ghost" size="sm"
              className="text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
              <LogOut className="w-4 h-4 mr-2"/> Sign Out
            </Button>
          </div>
        </div>
      </motion.nav>

      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        {/* Header */}
        <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} className="mb-10">
          <p className="text-purple-400 text-sm font-600 uppercase tracking-widest mb-2">Student Dashboard</p>
          <h1 className="text-4xl font-display text-white mb-2">Welcome back, <span className="gradient-text">{user.name}</span></h1>
          <p className="text-white/40">Track your resume performance and get expert feedback.</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {icon:FileText,   label:"Total Resumes",  val:myResumes.length,          color:"#a78bfa"},
            {icon:Star,       label:"Reviewed",       val:reviewed.length,            color:"#06b6d4"},
            {icon:TrendingUp, label:"Avg Score",      val:avgScore ? `${avgScore}%`:"—", color:"#10b981"},
            {icon:Clock,      label:"Pending Review", val:myResumes.length-reviewed.length, color:"#f59e0b"},
          ].map((s,i)=>(
            <motion.div key={i} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{delay:0.1+i*0.05}}
              className="glass rounded-2xl p-5 card-hover">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{background:`${s.color}20`}}>
                <s.icon className="w-4 h-4" style={{color:s.color}}/>
              </div>
              <div className="text-2xl font-display font-bold text-white">{s.val}</div>
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Resumes section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display text-white">My Resumes</h2>
          <UploadResumeDialog studentId={user.id}/>
        </div>

        {isResumesLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i=>(
              <div key={i} className="h-72 rounded-2xl glass animate-pulse"/>
            ))}
          </div>
        ) : myResumes.length === 0 ? (
          <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
            className="text-center py-24 glass rounded-3xl border border-dashed border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-purple-400"/>
            </div>
            <h3 className="text-xl font-display text-white mb-2">No resumes yet</h3>
            <p className="text-white/40 mb-6">Upload your first resume to get expert feedback.</p>
            <UploadResumeDialog studentId={user.id}/>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="show"
            variants={{show:{transition:{staggerChildren:0.08}}}}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myResumes.map(resume=>(
              <motion.div key={resume.id} variants={{hidden:{opacity:0,y:30},show:{opacity:1,y:0}}}>
                <ResumeCard resume={resume} allVersions={myResumes.filter(r=>r.title===resume.title).sort((a,b)=>b.version-a.version)}/>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
