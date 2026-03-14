import { useAuth } from "@/hooks/use-auth";
import { useResumes } from "@/hooks/use-resumes";
import { useLocation } from "wouter";
import { ResumeCard } from "@/components/ResumeCard";
import { ReviewModal } from "@/components/ReviewModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Search, Filter, ClipboardList, Users, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function RecruiterDashboard() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { resumes, isLoading: isResumesLoading } = useResumes();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"pending"|"reviewed">("all");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<number|null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) setLocation("/auth");
    if (!isAuthLoading && user && user.role !== "recruiter") setLocation("/student-dashboard");
  }, [user, isAuthLoading, setLocation]);

  if (isAuthLoading || !user) return (
    <div className="flex h-screen items-center justify-center" style={{background:'#09090f'}}>
      <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin"/>
    </div>
  );

  const allResumes = resumes || [];
  const reviewed   = allResumes.filter(r=>r.reviews?.length>0);
  const pending    = allResumes.filter(r=>!r.reviews?.length);

  const filteredResumes = allResumes.filter(resume => {
    const matchesSearch = resume.studentName.toLowerCase().includes(search.toLowerCase()) ||
                          resume.title.toLowerCase().includes(search.toLowerCase());
    if (filter === "pending") return matchesSearch && (!resume.reviews || resume.reviews.length===0);
    if (filter === "reviewed") return matchesSearch && resume.reviews?.length>0;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen relative" style={{background:'#09090f'}}>
      <div className="animated-bg"><div className="animated-bg-extra"/></div>
      <div className="grid-pattern"/>

      {/* Navbar */}
      <motion.nav initial={{y:-60,opacity:0}} animate={{y:0,opacity:1}}
        className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-white"/>
            </div>
            <span className="font-display text-lg font-800 text-white">Recruiter<span className="gradient-text">View</span></span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm text-white/60">
              <div className="pulse-dot w-2 h-2" style={{"--pulse-color":"#06b6d4"} as any}/>
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
          <p className="text-cyan-400 text-sm font-600 uppercase tracking-widest mb-2">Recruiter Dashboard</p>
          <h1 className="text-4xl font-display text-white mb-2">Resume <span className="gradient-text">Feed</span></h1>
          <p className="text-white/40">Review incoming resumes and provide structured feedback to candidates.</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {icon:Users,       label:"Total Resumes",  val:allResumes.length, color:"#a78bfa"},
            {icon:Clock,       label:"Pending Review", val:pending.length,    color:"#f59e0b"},
            {icon:CheckCircle, label:"Reviewed",       val:reviewed.length,   color:"#10b981"},
            {icon:TrendingUp,  label:"Avg Score",      val: reviewed.length ? `${Math.round(reviewed.reduce((s,r)=>s+(r.reviews[0]?.score||0),0)/reviewed.length)}%` : "—", color:"#06b6d4"},
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

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"/>
            <Input placeholder="Search candidates or titles..." className="pl-10 h-11 rounded-xl bg-white/5 border-white/10 text-white"
              value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10">
                <Filter className="w-4 h-4"/>
                {filter==="all"?"All Resumes":filter==="pending"?"Pending":"Reviewed"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1a1a2e] border-white/10">
              <DropdownMenuItem onClick={()=>setFilter("all")}    className="text-white/70 hover:text-white">All Resumes</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>setFilter("pending")} className="text-white/70 hover:text-white">Pending Review</DropdownMenuItem>
              <DropdownMenuItem onClick={()=>setFilter("reviewed")} className="text-white/70 hover:text-white">Already Reviewed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isResumesLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i=><div key={i} className="h-72 rounded-2xl glass animate-pulse"/>)}
          </div>
        ) : filteredResumes.length === 0 ? (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}
            className="text-center py-24 glass rounded-3xl border border-dashed border-white/10">
            <Search className="w-12 h-12 text-white/20 mx-auto mb-4"/>
            <h3 className="text-xl font-display text-white mb-2">No resumes found</h3>
            <p className="text-white/40">Try adjusting your search or filters.</p>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="show"
            variants={{show:{transition:{staggerChildren:0.08}}}}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResumes.map(resume=>(
              <motion.div key={resume.id} variants={{hidden:{opacity:0,y:30},show:{opacity:1,y:0}}}>
                <ResumeCard resume={resume} isRecruiter={true} onReview={id=>{setSelectedResumeId(id);setReviewModalOpen(true);}}/>
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedResumeId !== null && (
          <ReviewModal resumeId={selectedResumeId} recruiterId={user.id}
            isOpen={reviewModalOpen} onClose={()=>{setReviewModalOpen(false);setSelectedResumeId(null);}}/>
        )}
      </main>
    </div>
  );
}
