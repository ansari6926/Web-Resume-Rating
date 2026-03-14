import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Mail, Lock, User, Briefcase, ArrowRight, Sparkles } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AuthPage() {
  const { user, login, register, isLoggingIn, isRegistering } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"login"|"register">("login");

  useEffect(() => {
    if (user) {
      if (user.role === "recruiter") setLocation("/recruiter-dashboard");
      else setLocation("/student-dashboard");
    }
  }, [user, setLocation]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", name: "", role: "student" },
  });

  return (
    <div className="min-h-screen relative overflow-hidden flex" style={{background:'#09090f'}}>
      <div className="animated-bg"><div className="animated-bg-extra"/></div>
      <div className="grid-pattern"/>

      {/* Left panel */}
      <motion.div initial={{x:-80,opacity:0}} animate={{x:0,opacity:1}} transition={{duration:0.8}}
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white"/>
          </div>
          <span className="font-display text-xl font-800 text-white">Resume<span className="gradient-text">Rate</span></span>
        </div>

        <div className="space-y-8 max-w-md">
          <div>
            <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-purple-300 mb-6 border border-purple-500/20">
                <Sparkles className="w-3 h-3"/> AI-Powered Resume Analysis
              </div>
              <h1 className="text-5xl font-display text-white leading-tight mb-4">
                Get your resume<br/><span className="gradient-text">noticed.</span>
              </h1>
              <p className="text-white/50 text-lg leading-relaxed">
                Expert recruiters review your resume, give structured feedback, and help you reach your career goals faster.
              </p>
            </motion.div>
          </div>

          <div className="space-y-4">
            {[
              {icon:"🎯", title:"Targeted Feedback",   desc:"Feedback structured into 3 actionable areas"},
              {icon:"📊", title:"Strength Scoring",     desc:"0–100 score with visual strength indicator"},
              {icon:"📈", title:"Version Tracking",     desc:"Watch your score improve over multiple uploads"},
            ].map((item,i)=>(
              <motion.div key={i} initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{delay:0.5+i*0.1}}
                className="flex items-start gap-4 glass rounded-2xl p-4">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-white font-600 text-sm">{item.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-sm">© 2025 ResumeRate</p>
      </motion.div>

      {/* Right panel - Auth */}
      <motion.div initial={{x:80,opacity:0}} animate={{x:0,opacity:1}} transition={{duration:0.8}}
        className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="glass-strong rounded-3xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
                <FileText className="w-8 h-8 text-white"/>
              </div>
              <h2 className="text-2xl font-display text-white">Welcome to ResumeRate</h2>
              <p className="text-white/40 text-sm mt-1">Sign in to continue your journey</p>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 p-1 rounded-2xl bg-white/5 mb-8">
              {(["login","register"] as const).map(t=>(
                <button key={t} onClick={()=>setTab(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-600 transition-all ${tab===t?"bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/20":"text-white/40 hover:text-white/70"}`}>
                  {t==="login"?"Sign In":"Create Account"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === "login" ? (
                <motion.div key="login" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} transition={{duration:0.25}}>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit((d)=>login(d))} className="space-y-4">
                      <FormField control={loginForm.control} name="username" render={({field})=>(
                        <FormItem>
                          <FormLabel className="text-white/70 text-sm">Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"/>
                              <Input placeholder="Enter your username" className="pl-10 h-12 rounded-xl" {...field}/>
                            </div>
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}/>
                      <FormField control={loginForm.control} name="password" render={({field})=>(
                        <FormItem>
                          <FormLabel className="text-white/70 text-sm">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"/>
                              <Input type="password" placeholder="Enter your password" className="pl-10 h-12 rounded-xl" {...field}/>
                            </div>
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}/>
                      <Button type="submit" disabled={isLoggingIn}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-none shadow-lg shadow-violet-500/30 mt-2 text-base transition-all hover:-translate-y-0.5">
                        {isLoggingIn ? "Signing in..." : <><span>Sign In</span><ArrowRight className="w-4 h-4 ml-2"/></>}
                      </Button>
                    </form>
                  </Form>
                  <p className="text-center text-sm text-white/40 mt-6">
                    Don't have an account?{" "}
                    <button onClick={()=>setTab("register")} className="text-purple-400 hover:text-purple-300 transition-colors">Create one</button>
                  </p>
                </motion.div>
              ) : (
                <motion.div key="register" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.25}}>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit((d)=>register(d))} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField control={registerForm.control} name="name" render={({field})=>(
                          <FormItem>
                            <FormLabel className="text-white/70 text-sm">Full Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"/>
                                <Input placeholder="John Doe" id="register-name" className="pl-10 h-12 rounded-xl" {...field}/>
                              </div>
                            </FormControl>
                            <FormMessage/>
                          </FormItem>
                        )}/>
                        <FormField control={registerForm.control} name="role" render={({field})=>(
                          <FormItem>
                            <FormLabel className="text-white/70 text-sm">I am a...</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl" id="register-role">
                                  <Briefcase className="w-4 h-4 mr-2 text-white/30"/>
                                  <SelectValue placeholder="Select role"/>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#1a1a2e] border-white/10">
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="recruiter">Recruiter</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage/>
                          </FormItem>
                        )}/>
                      </div>
                      <FormField control={registerForm.control} name="username" render={({field})=>(
                        <FormItem>
                          <FormLabel className="text-white/70 text-sm">Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"/>
                              <Input placeholder="Choose a username" id="register-username" className="pl-10 h-12 rounded-xl" {...field}/>
                            </div>
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}/>
                      <FormField control={registerForm.control} name="password" render={({field})=>(
                        <FormItem>
                          <FormLabel className="text-white/70 text-sm">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"/>
                              <Input type="password" placeholder="Min 6 characters" id="register-password" className="pl-10 h-12 rounded-xl" {...field}/>
                            </div>
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}/>
                      <Button type="submit" id="button-register" disabled={isRegistering}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-none shadow-lg shadow-violet-500/30 mt-2 text-base transition-all hover:-translate-y-0.5">
                        {isRegistering ? "Creating Account..." : <><span>Create Account</span><ArrowRight className="w-4 h-4 ml-2"/></>}
                      </Button>
                    </form>
                  </Form>
                  <p className="text-center text-sm text-white/40 mt-6">
                    Already have an account?{" "}
                    <button onClick={()=>setTab("login")} className="text-purple-400 hover:text-purple-300 transition-colors">Sign in</button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
