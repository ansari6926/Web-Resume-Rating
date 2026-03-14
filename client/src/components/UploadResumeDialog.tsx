import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileText, Plus } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({ title: z.string().min(1,"Resume Title is required") });

export function UploadResumeDialog({ studentId }: { studentId:number }) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File|null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title:"" },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!selectedFile) {
      toast({ variant:"destructive", title:"No file selected", description:"Please select a PDF resume to upload." });
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", data.title);
    try {
      const res = await fetch(api.resumes.create.path, { method:"POST", body:formData });
      if (!res.ok) throw new Error("Upload failed");
      toast({ title:"✅ Uploaded!", description:"Your resume is now pending review." });
      queryClient.invalidateQueries({ queryKey:[api.resumes.list.path] });
      setOpen(false); form.reset(); setSelectedFile(null);
    } catch {
      toast({ variant:"destructive", title:"Upload failed", description:"There was an error. Please try again." });
    } finally { setIsUploading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-none shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 transition-all gap-2">
          <Plus className="w-4 h-4"/> Upload Resume
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-white/10" style={{background:'#0f0f1a'}}>
        <DialogHeader>
          <DialogTitle className="text-xl font-display gradient-text">Upload New Resume</DialogTitle>
          <p className="text-white/40 text-sm">Upload your PDF resume to get expert feedback.</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
            <FormField control={form.control} name="title" render={({field})=>(
              <FormItem>
                <FormLabel className="text-white/70 text-sm">Resume Title / Role</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Frontend Developer Resume 2025" className="h-11 rounded-xl" {...field}/>
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}/>

            {/* Drop zone */}
            <motion.div
              onClick={()=>fileInputRef.current?.click()}
              onDragOver={e=>{e.preventDefault();setDragOver(true)}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files?.[0];if(f&&f.type==="application/pdf")setSelectedFile(f);}}
              animate={{borderColor:dragOver?"rgba(124,58,237,0.8)":"rgba(255,255,255,0.1)", background:dragOver?"rgba(124,58,237,0.08)":"rgba(255,255,255,0.03)"}}
              className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors"
            >
              <AnimatePresence mode="wait">
                {selectedFile ? (
                  <motion.div key="file" initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.8}} className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-400"/>
                    </div>
                    <p className="text-white font-600 text-sm">{selectedFile.name}</p>
                    <p className="text-white/30 text-xs">{(selectedFile.size/1024/1024).toFixed(2)} MB</p>
                    <button type="button" onClick={e=>{e.stopPropagation();setSelectedFile(null)}} className="text-xs text-rose-400 hover:text-rose-300 transition-colors">Remove</button>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <UploadCloud className="w-6 h-6 text-white/30"/>
                    </div>
                    <p className="text-white/60 text-sm font-500">Click or drag & drop your PDF</p>
                    <p className="text-white/25 text-xs">PDF only · Max 10MB</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={e=>setSelectedFile(e.target.files?.[0]||null)}/>
            </motion.div>

            <Button type="submit" disabled={isUploading} className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-none shadow-lg shadow-violet-500/20 text-base transition-all hover:-translate-y-0.5">
              {isUploading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"/> Uploading...</>
              ) : "Upload Resume"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
