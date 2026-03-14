import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReviews } from "@/hooks/use-resumes";
import { queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardCheck, Lightbulb, AlertTriangle, CheckCircle2, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { CircularStrength } from "./CircularStrength";

const formSchema = z.object({
  score:           z.coerce.number().min(1,"Score must be at least 1").max(100,"Score must be at most 100"),
  comments:        z.string().optional().default(""),
  recommendations: z.string().min(1,"Recommendations are required"),
  improvements:    z.string().min(1,"Areas for improvement are required"),
});

interface ReviewModalProps { resumeId:number; recruiterId:number; isOpen:boolean; onClose:()=>void; }

export function ReviewModal({ resumeId, recruiterId, isOpen, onClose }: ReviewModalProps) {
  const { submitReview } = useReviews();
  const [submittedReview, setSubmittedReview] = useState<any>(null);
  const [previewScore, setPreviewScore] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { score:0, comments:"", recommendations:"", improvements:"" },
  });

  useEffect(()=>{ if(isOpen){ form.reset({score:0,comments:"",recommendations:"",improvements:""}); setSubmittedReview(null); setPreviewScore(0); } },[isOpen]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!resumeId) return;
    submitReview.mutate({
      resumeId, score: data.score, recruiterId,
      comments: JSON.stringify({ general:data.comments, recommendations:data.recommendations, improvements:data.improvements }),
    }, {
      onSuccess: (review) => { setSubmittedReview(review); queryClient.invalidateQueries({queryKey:["/api/resumes"]}); }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-white/10" style={{background:'#0f0f1a'}}>
        <AnimatePresence mode="wait">
          {submittedReview ? (
            <motion.div key="success" initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.8}}
              className="flex flex-col items-center gap-6 py-8 text-center">
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.2,type:"spring",stiffness:200}}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400"/>
              </motion.div>
              <div>
                <h2 className="text-2xl font-display text-white mb-2">Review Submitted!</h2>
                <p className="text-white/50 text-sm">The student has been notified of your feedback.</p>
              </div>
              <CircularStrength score={submittedReview.score} size={160} strokeWidth={12}/>
              <Button onClick={onClose} className="w-full max-w-xs rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-none">
                Close Review
              </Button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-display gradient-text">Provide Structured Feedback</DialogTitle>
                <p className="text-white/40 text-sm mt-1">Your review will help the student improve their resume.</p>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  {/* Score input with live preview */}
                  <div className="flex items-start gap-6 p-5 rounded-2xl bg-white/5 border border-white/8">
                    <div className="flex-1">
                      <FormField control={form.control} name="score" render={({field})=>(
                        <FormItem>
                          <FormLabel className="text-white font-bold flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-400"/> Strength Score (0–100)
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" className="h-14 text-2xl font-display font-bold w-28 text-center rounded-xl"
                              {...field} onChange={e=>{ const v=Number(e.target.value); field.onChange(v); setPreviewScore(v); }}/>
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}/>
                    </div>
                    {previewScore > 0 && (
                      <motion.div initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}}>
                        <CircularStrength score={previewScore} size={100} strokeWidth={9}/>
                      </motion.div>
                    )}
                  </div>

                  {/* Feedback sections */}
                  {[
                    { name:"comments",        icon:ClipboardCheck, label:"General Comments",         color:"blue",    placeholder:"Provide an overall evaluation of the resume..." },
                    { name:"recommendations", icon:Lightbulb,      label:"Recommendations",          color:"emerald", placeholder:"What specific actions should the student take?" },
                    { name:"improvements",    icon:AlertTriangle,  label:"Areas for Improvement",    color:"rose",    placeholder:"Which sections are currently weak or missing?" },
                  ].map(sec=>(
                    <div key={sec.name} className={`p-4 rounded-2xl bg-${sec.color}-500/5 border border-${sec.color}-500/10`}>
                      <div className={`flex items-center gap-2 mb-3 text-${sec.color}-400 text-xs font-bold uppercase tracking-wider`}>
                        <sec.icon className="w-3.5 h-3.5"/>{sec.label}
                      </div>
                      <FormField control={form.control} name={sec.name as any} render={({field})=>(
                        <FormItem>
                          <FormControl>
                            <Textarea placeholder={sec.placeholder} className="min-h-[90px] bg-white/5 border-white/10 text-white rounded-xl resize-none" {...field}/>
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}/>
                    </div>
                  ))}

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl text-white/50 hover:text-white hover:bg-white/10">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitReview.isPending} className="flex-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-none shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 transition-all px-8">
                      {submitReview.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
