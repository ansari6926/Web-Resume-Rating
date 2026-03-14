import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User, MessageSquare, ClipboardCheck, Lightbulb, AlertTriangle, Download, History, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { Resume, Review } from "@shared/schema";
import { CircularStrength } from "./CircularStrength";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ResumeCardProps {
  resume: Resume & { reviews: Review[] };
  isRecruiter?: boolean;
  onReview?: (id: number) => void;
  allVersions?: (Resume & { reviews: Review[] })[];
}

export function ResumeCard({ resume, isRecruiter=false, onReview, allVersions=[] }: ResumeCardProps) {
  const latestReview = resume.reviews?.[0];
  const isReviewed = !!latestReview;

  let feedbackData: any = null;
  if (isReviewed && latestReview.comments) {
    try { feedbackData = JSON.parse(latestReview.comments); }
    catch { feedbackData = { general: latestReview.comments, recommendations:"", improvements:"" }; }
  }

  const getStatusClass = (status:string) => {
    if (status==="Approved") return "status-approved";
    if (status==="Needs Improvement") return "status-improvement";
    return "status-pending";
  };

  return (
    <motion.div whileHover={{y:-4}} transition={{type:"spring",stiffness:300}} className="animated-border h-full">
      <div className="glass rounded-2xl flex flex-col h-full overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-violet-600 via-cyan-500 to-pink-500"/>

        {/* Header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-purple-400"/>
              </div>
              <div>
                <h3 className="font-display text-white font-bold leading-tight mb-1">{resume.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <User className="w-3 h-3"/>{resume.studentName}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusClass(resume.status)}`}>
                {resume.status}
              </span>
              <div className="flex items-center gap-1">
                {allVersions.length > 1 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-white/30 hover:text-purple-400">
                          <History className="w-3.5 h-3.5"/>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1a1a2e] border-white/10 p-3 w-56">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/10 pb-2 mb-2">Version History</p>
                        {allVersions.map(v=>(
                          <div key={v.id} className="flex items-center justify-between text-xs py-1">
                            <span className="text-white font-bold">v{v.version}</span>
                            <span className="text-white/30">{v.createdAt ? format(new Date(v.createdAt),'MMM d, yyyy'):'n/a'}</span>
                          </div>
                        ))}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <span className="text-[10px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded-full">v{resume.version}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto max-h-80">
          {isReviewed ? (
            <div className="space-y-4">
              <div className="flex justify-center py-4">
                <CircularStrength score={latestReview.score} size={130} strokeWidth={11}/>
              </div>
              <div className="space-y-3">
                {feedbackData?.general && (
                  <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <div className="flex items-center gap-2 mb-1.5 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                      <ClipboardCheck className="w-3 h-3"/>Comments
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">{feedbackData.general}</p>
                  </div>
                )}
                {feedbackData?.improvements && (
                  <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                    <div className="flex items-center gap-2 mb-1.5 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-3 h-3"/>Improvements
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">{feedbackData.improvements}</p>
                  </div>
                )}
                {feedbackData?.recommendations && (
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-2 mb-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      <Lightbulb className="w-3 h-3"/>Recommendations
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">{feedbackData.recommendations}</p>
                  </div>
                )}
                {isRecruiter && (
                  <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
                    <div className="flex items-center gap-2 mb-2 text-violet-400 text-[10px] font-bold uppercase tracking-wider">
                      <ExternalLink className="w-3 h-3"/>ATS Tools
                    </div>
                    <div className="space-y-1">
                      <a href="https://enhancv.com/resume-checker/" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                        Enhancv Resume Checker <ExternalLink className="w-2.5 h-2.5"/>
                      </a>
                      <a href="https://www.jobscan.co/" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                        Jobscan ATS Analysis <ExternalLink className="w-2.5 h-2.5"/>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-white/20"/>
              </div>
              <p className="text-sm text-white/30 font-500">Awaiting expert review</p>
              <p className="text-xs text-white/20 mt-1">You'll be notified when ready</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <Calendar className="w-3.5 h-3.5"/>
            {resume.createdAt ? format(new Date(resume.createdAt),'MMM d, yyyy'):'Just now'}
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-white/30 hover:text-white hover:bg-white/10"
              onClick={()=>window.open(`/api/resumes/${resume.id}/download`,'_blank')}>
              <Download className="w-3.5 h-3.5"/>
            </Button>
            {isRecruiter && !isReviewed && (
              <Button size="sm" onClick={()=>onReview?.(resume.id)}
                className="h-7 px-3 text-xs rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-none shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 transition-all">
                Review Now
              </Button>
            )}
            {isRecruiter && isReviewed && (
              <span className="text-xs px-2.5 py-1 rounded-full strength-strong font-bold">✓ Done</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
