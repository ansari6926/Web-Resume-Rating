import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertResume, type InsertReview } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useResumes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all resumes (filtered by user on backend)
  const { data: resumes, isLoading, error } = useQuery({
    queryKey: [api.resumes.list.path],
    queryFn: async () => {
      const res = await fetch(api.resumes.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch resumes");
      return api.resumes.list.responses[200].parse(await res.json());
    },
  });

  // Create Resume (Upload)
  const createResumeMutation = useMutation({
    mutationFn: async (data: InsertResume) => {
      // In a real app, we would upload the file first, get a URL, then post metadata.
      // Or use FormData. For this schema, we just post JSON.
      const res = await fetch(api.resumes.create.path, {
        method: api.resumes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const err = await res.json();
          throw new Error(err.message || "Validation failed");
        }
        throw new Error("Failed to upload resume");
      }
      return api.resumes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
      toast({ title: "Success", description: "Resume uploaded successfully" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
    },
  });

  return {
    resumes,
    isLoading,
    error,
    createResume: createResumeMutation.mutate,
    isCreating: createResumeMutation.isPending,
  };
}

export function useReviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: async (data: InsertReview) => {
      const res = await fetch(api.reviews.create.path, {
        method: api.reviews.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        let errMsg = "Failed to submit review";
        try {
          const errBody = await res.json();
          errMsg = errBody.message || errMsg;
          console.error("POST /reviews error:", errBody);
        } catch (_) {}
        throw new Error(errMsg);
      }
      return api.reviews.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
      toast({ title: "Review Submitted", description: "Feedback has been sent to the student." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  return {
    submitReview: createReviewMutation,
    isSubmitting: createReviewMutation.isPending,
  };
}
