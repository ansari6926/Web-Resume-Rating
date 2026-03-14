import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, ClipboardCheck, Zap, LineChart, MessageSquare, CheckCircle2, Star, Users, TrendingUp } from "lucide-react";

const fadeUp = { hidden:{opacity:0,y:40}, show:{opacity:1,y:0} };
const stagger = { show:{transition:{staggerChildren:0.12}} };

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{background:'#09090f'}}>
      {/* Animated Background */}
      <div className="animated-bg"><div className="animated-bg-extra"/></div>
      <div className="grid-pattern"/>

      {/* Floating Particles */}
      {[...Array(12)].map((_,i)=>(
        <div key={i} className="particle" style={{
          left:`${8+i*8}%`, top:`${20+Math.sin(i)*40}%`,
          '--dur':`${3+i*0.4}s`, '--delay':`${i*0.3}s`,
          background: i%3===0?'rgba(167,139,250,0.6)':i%3===1?'rgba(6,182,212,0.6)':'rgba(236,72,153,0.6)'
        } as any}/>
      ))}

      <div className="relative z-10">
        {/* Navbar */}
        <motion.nav initial={{y:-60,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.6}}
          className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white"/>
            </div>
            <span className="font-display text-xl font-800 text-white">Resume<span className="gradient-text">Rate</span></span>
          </div>
          <Link href="/auth">
            <Button className="rounded-full px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all">
              Sign In <ArrowRight className="w-4 h-4 ml-2"/>
            </Button>
          </Link>
        </motion.nav>

        {/* Hero */}
        <section className="min-h-[90vh] flex items-center justify-center px-6 py-20">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{duration:0.6}}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-purple-300 mb-8 border border-purple-500/20">
              <div className="pulse-dot"/>
              <span>Now live — AI-powered resume review platform</span>
            </motion.div>

            <motion.h1 initial={{opacity:0,y:50}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.1}}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-800 text-white leading-none mb-6">
              Your Resume.<br/>
              <span className="gradient-text">Reviewed. Scored.</span><br/>
              Perfected.
            </motion.h1>

            <motion.p initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.3}}
              className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
              Connect students with expert recruiters for structured feedback, measurable strength scoring, and version tracking that shows real growth.
            </motion.p>

            <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.5}}
              className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="h-14 px-10 text-base rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-none shadow-lg shadow-violet-500/30 transition-all hover:shadow-violet-500/50 hover:-translate-y-1">
                  Get Started Free <ArrowRight className="w-5 h-5 ml-2"/>
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="h-14 px-10 text-base rounded-full border-white/20 text-white hover:bg-white/10 transition-all">
                  Recruiter Portal
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.7}}
              className="flex flex-wrap justify-center gap-12 mt-20">
              {[
                {icon:Users,   val:"2,400+", label:"Students"},
                {icon:Star,    val:"98%",    label:"Satisfaction"},
                {icon:TrendingUp, val:"3.2x", label:"Score Improvement"},
              ].map((s,i)=>(
                <div key={i} className="flex flex-col items-center gap-2">
                  <s.icon className="w-5 h-5 text-purple-400"/>
                  <span className="text-3xl font-display font-bold text-white">{s.val}</span>
                  <span className="text-sm text-white/40">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{once:true}} className="text-center mb-16">
              <motion.div variants={fadeUp}>
                <p className="text-purple-400 text-sm font-600 uppercase tracking-widest mb-4">How It Works</p>
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-display text-white mb-4">
                Four steps to a <span className="gradient-text">perfect resume</span>
              </motion.h2>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                {step:"01", icon:FileText,      title:"Upload Resume",  desc:"Drop your PDF resume to get started instantly.",           color:"from-violet-600 to-violet-400"},
                {step:"02", icon:ClipboardCheck, title:"Expert Review",  desc:"Industry recruiters provide structured feedback.",           color:"from-cyan-600 to-cyan-400"},
                {step:"03", icon:Zap,            title:"Auto Scoring",   desc:"Strength level calculated: Strong, Average, or Weak.",      color:"from-pink-600 to-pink-400"},
                {step:"04", icon:LineChart,      title:"Track Growth",   desc:"Version history shows your improvement over time.",         color:"from-emerald-600 to-emerald-400"},
              ].map((item,i)=>(
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{once:true}}
                  transition={{delay:i*0.1}} className="animated-border card-hover">
                  <div className="glass rounded-2xl p-6 h-full">
                    <div className="text-6xl font-display font-800 text-white/5 mb-4">{item.step}</div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <item.icon className="w-6 h-6 text-white"/>
                    </div>
                    <h3 className="text-lg font-display text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-cyan-400 text-sm font-600 uppercase tracking-widest mb-4">Features</p>
              <h2 className="text-4xl md:text-5xl font-display text-white">
                Everything you need to <span className="gradient-text">succeed</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {icon:ClipboardCheck, title:"Version Tracking",      desc:"Full history of uploads with scores for each version.",   color:"#a78bfa"},
                {icon:MessageSquare,  title:"Structured Feedback",   desc:"Three-part feedback: comments, recommendations, improvements.", color:"#06b6d4"},
                {icon:LineChart,      title:"Strength Visualization", desc:"Animated circular progress shows strength score clearly.", color:"#ec4899"},
                {icon:CheckCircle2,   title:"Recruiter Insights",    desc:"Direct professional advice to help you stand out.",       color:"#10b981"},
                {icon:Zap,           title:"Measurable Growth",     desc:"Quantify improvement with clear numeric scoring.",         color:"#f59e0b"},
                {icon:FileText,      title:"Instant Upload",         desc:"Simple PDF upload with drag-and-drop interface.",         color:"#f43f5e"},
              ].map((f,i)=>(
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{once:true}}
                  transition={{delay:i*0.08}} className="animated-border card-hover">
                  <div className="glass rounded-2xl p-6">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{background:`${f.color}20`}}>
                      <f.icon className="w-5 h-5" style={{color:f.color}}/>
                    </div>
                    <h3 className="font-display text-white mb-2">{f.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{once:true}}
              className="glass rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-cyan-500/10 rounded-3xl"/>
              <div className="relative z-10">
                <h2 className="text-4xl font-display text-white mb-4">Ready to level up your resume?</h2>
                <p className="text-white/50 mb-8">Join thousands of students getting expert feedback today.</p>
                <Link href="/auth">
                  <Button size="lg" className="h-14 px-12 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-none text-base shadow-lg shadow-violet-500/30 hover:-translate-y-1 transition-all">
                    Start for Free <ArrowRight className="w-5 h-5 ml-2"/>
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-white/5 text-center text-sm text-white/30">
          <p>© 2025 ResumeRate · Professional Resume Review System</p>
        </footer>
      </div>
    </div>
  );
}
