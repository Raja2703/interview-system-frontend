"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import InterviewRoom, {
  LiveKitConnectionDetails,
} from "@/components/interview/InterviewRoom";
import { Loader2, AlertTriangle } from "lucide-react";

export default function InterviewRoomClient() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [connectionDetails, setConnectionDetails] =
    useState<LiveKitConnectionDetails | null>(null);
  const [isInterviewer, setIsInterviewer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem(
      `meeting_data_${interviewId}`
    );

    if (!storedData) {
      setError(
        "No connection credentials found. Please join from the Dashboard again."
      );
      return;
    }

    try {
      const data = JSON.parse(storedData);

      setConnectionDetails({
        url: data.livekitUrl,
        token: data.token,
        roomName: data.room_name,
        participantName: data.identity,
        receiver: data.receiver,
        sender: data.sender,
      });

      setIsInterviewer(!!data.isInterviewer);
      sessionStorage.removeItem(`meeting_data_${interviewId}`);
    } catch {
      setError("Corrupted meeting data.");
    }
  }, [interviewId]);

  if (!connectionDetails && !error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow border text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={32} />
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <InterviewRoom
      {...connectionDetails}
      isInterviewer={isInterviewer}
      interviewId={interviewId}
      onLeave={() => router.push("/dashboard")}
    />
  );
}
