import { useMutation, useQueryClient } from "@tanstack/react-query";
import { interviewsApi } from "@/controller/interviews.api";
import { interviewKeys } from "@/hooks/interviews/interviews.keys";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export const useInterviewMutations = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const createRequestMutation = useMutation({
    mutationFn: interviewsApi.createRequest,
    onSuccess: () => {
      toast.success("Interview request sent successfully!");
      queryClient.invalidateQueries({ queryKey: interviewKeys.requests() });
    },
    onError: (err: any) => {
      if (err?.response?.data?.details?.receiver_id) {
        toast.error(err?.response?.data?.details?.receiver_id[0] || "Failed to send request")
      } else {
        toast.error(err?.response?.data?.message || err?.response?.data?.error || "Failed to send request")
      }
    },
  });

  const acceptMutation = useMutation({
    mutationFn: interviewsApi.acceptRequest,
    onSuccess: () => {
      toast.success("Interview accepted successfully!");
      queryClient.invalidateQueries({ queryKey: interviewKeys.requests() });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || "Failed to accept interview"),
  });

  const rejectMutation = useMutation({
    mutationFn: interviewsApi.rejectRequest,
    onSuccess: () => {
      toast.info("Interview request rejected.");
      queryClient.invalidateQueries({ queryKey: interviewKeys.requests() });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || "Failed to reject interview"),
  });

  const cancelMutation = useMutation({
    mutationFn: interviewsApi.cancelRequest,
    onSuccess: () => {
      toast.success("Request cancelled successfully.");
      queryClient.invalidateQueries({ queryKey: interviewKeys.requests() });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || err?.response?.data?.error || "Failed to cancel request"),
  });

  const joinMutation = useMutation({
    mutationFn: interviewsApi.joinRoom,
    onSuccess: (data) => {
      sessionStorage.setItem(`meeting_data_${data.interview.id}`, JSON.stringify({
        livekitUrl: data?.livekit_url,
        token: data?.token,
        roomName: data?.room_name,
        identity: data?.identity,
        isInterviewer: data?.is_interviewer,
        receiver: data?.interview?.receiver,
        sender: data?.interview?.sender,
      }));

      // 2. Redirect to the room page
      router.push(`/interview-room/${data.interview.id}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Could not join the meeting room.")
    }
  });

  return { createRequestMutation, acceptMutation, rejectMutation, joinMutation, cancelMutation };
};