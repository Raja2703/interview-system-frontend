"use client";

import { useEffect, useState, useRef } from "react";
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
  Track,
  VideoPresets,
  LocalTrackPublication,
} from "livekit-client";
import { 
  Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, 
  Code, X, ChevronDown, LayoutDashboard,
  MonitorUp, MonitorOff, CheckCheck 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCompleteInterview } from "@/hooks/feedback/feedback.mutations";

// Imports
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(
  () => import("./MonacoEditor"),
  { ssr: false }
);

const ExcalidrawWrapper = dynamic(
  () => import("@/components/interview/Excalidraw"),
  { ssr: false }
);

const ConfirmationModal = dynamic(
  () => import("@/components/ConfirmationModal"),
  { ssr: false }
);

// --- Constants ---
const CODE_TOPIC = "code-update";
const LANGUAGE_TOPIC = "language-update";
const WHITEBOARD_TOPIC = "whiteboard-update"; 
const CONTROL_TOPIC = "control-event"; 
const DEBOUNCE_MS = 500;

const LANGUAGES = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" }, 
  { id: "go", label: "Go" },
];

export interface LiveKitConnectionDetails {
  url: string;
  token: string;
  roomName?: string;
  participantName?: string;
  receiver: {
    name: string
  },
  sender: {
    name: string
  },
}

interface InterviewRoomProps extends LiveKitConnectionDetails {
  onLeave?: () => void;
  isInterviewer: boolean;
  interviewId: string;
}

export default function InterviewRoom({ 
  url, 
  token, 
  roomName, 
  receiver,
  sender,
  onLeave,
  isInterviewer,
  interviewId
}: InterviewRoomProps) {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Track State ---
  const [remoteTracks, setRemoteTracks] = useState<
    { track: RemoteTrack; participant: RemoteParticipant }[]
  >([]);
   
  // --- Local Media State ---
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenShareOn, setIsScreenShareOn] = useState(false); 

  // --- UI State ---
  const [activeTab, setActiveTab] = useState<"code" | "board" | null>(null);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false); // <--- MODAL STATE

  // --- Code State ---
  const [language, setLanguage] = useState("typescript");
  const [code, setCode] = useState("// Write your solution here...\n\nfunction solution() {\n  \n}");
   
  // --- Whiteboard State ---
  const [whiteboardElements, setWhiteboardElements] = useState<any[]>([]);

  // --- Sync Refs ---
  const isRemoteCodeUpdate = useRef(false);
  const isRemoteBoardUpdate = useRef(false);
  const codeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const boardTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Mutations ---
  const completeInterviewMutation = useCompleteInterview();

  // 1. Connect to Room
  useEffect(() => {
    let newRoom: Room | null = null;

    const connectToRoom = async () => {
      try {
        if (!url || !token) throw new Error("Missing connection details");

        newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
        });

        setRoom(newRoom);

        newRoom
          .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
          .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
          .on(RoomEvent.Disconnected, handleDisconnect)
          .on(RoomEvent.LocalTrackUnpublished, handleLocalTrackUnpublished);
        
        // --- DATA HANDLERS ---
        
        newRoom.registerTextStreamHandler(CODE_TOPIC, async (reader) => {
            const fullText = await reader.readAll();
            isRemoteCodeUpdate.current = true; 
            setCode(fullText);
            setTimeout(() => { isRemoteCodeUpdate.current = false; }, 100);
        });

        newRoom.registerTextStreamHandler(LANGUAGE_TOPIC, async (reader) => {
            const newLang = await reader.readAll();
            setLanguage(newLang);
        });

        newRoom.registerTextStreamHandler(WHITEBOARD_TOPIC, async (reader) => {
            const jsonStr = await reader.readAll();
            try {
                const elements = JSON.parse(jsonStr);
                isRemoteBoardUpdate.current = true;
                setWhiteboardElements(elements);
                setTimeout(() => { isRemoteBoardUpdate.current = false; }, 100);
            } catch (e) { console.error("Failed to parse whiteboard data"); }
        });

        // Listen for CONTROL events (Interview Finished)
        newRoom.registerTextStreamHandler(CONTROL_TOPIC, async (reader) => {
           const payload = await reader.readAll();
           if (payload === "INTERVIEW_COMPLETED") {
              router.push(`/feedback/${interviewId}?role=candidate`);
           }
        });

        await newRoom.connect(url, token);
        setIsConnected(true);
        await newRoom.localParticipant.enableCameraAndMicrophone();

      } catch (err: any) {
        console.error("Failed to connect:", err);
        setError(err.message || "Failed to join interview room.");
      }
    };

    const handleTrackSubscribed = (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
        setRemoteTracks((prev) => [...prev, { track, participant }]);
      }
    };

    const handleTrackUnsubscribed = (track: RemoteTrack) => {
      setRemoteTracks((prev) => prev.filter((t) => t.track.sid !== track.sid));
    };

    const handleLocalTrackUnpublished = (publication: LocalTrackPublication) => {
        if (publication.source === Track.Source.ScreenShare) {
            setIsScreenShareOn(false);
        }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    connectToRoom();

    return () => {
      if (newRoom) newRoom.disconnect();
    };
  }, [url, token]);

  // --- STREAMING HELPERS ---
  const sendStreamData = async (topic: string, data: string) => {
      if (!room?.localParticipant) return;
      try {
          const streamWriter = await room.localParticipant.streamText({ topic });
          await streamWriter.write(data);
          await streamWriter.close();
      } catch (error) { console.error(`Error streaming ${topic}:`, error); }
  };

  // --- ACTIONS ---

  // Complete Interview Action (Executed after confirmation)
  const handleFinishInterview = async () => {
    if (!isInterviewer) return;

    try {
        await completeInterviewMutation.mutateAsync(interviewId);
        await sendStreamData(CONTROL_TOPIC, "INTERVIEW_COMPLETED");
        room?.disconnect();
        router.push(`/feedback/${interviewId}?role=interviewer`);
    } catch (error) {
        console.error("Error finishing interview:", error);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    const newVal = value || "";
    setCode(newVal);
    if (isRemoteCodeUpdate.current) return;
    
    if (codeTimeoutRef.current) clearTimeout(codeTimeoutRef.current);
    codeTimeoutRef.current = setTimeout(() => {
        sendStreamData(CODE_TOPIC, newVal);
    }, DEBOUNCE_MS);
  };

  const handleLanguageChange = async (newLang: string) => {
      setLanguage(newLang); 
      sendStreamData(LANGUAGE_TOPIC, newLang);
  };

  const handleWhiteboardChange = (elements: any) => {
    if (isRemoteBoardUpdate.current) return;
    setWhiteboardElements(elements);
    if (boardTimeoutRef.current) clearTimeout(boardTimeoutRef.current);
    boardTimeoutRef.current = setTimeout(() => {
        sendStreamData(WHITEBOARD_TOPIC, JSON.stringify(elements));
    }, DEBOUNCE_MS);
  };

  const toggleMic = async () => {
    if (room?.localParticipant) {
      const newVal = !isMicOn;
      await room.localParticipant.setMicrophoneEnabled(newVal);
      setIsMicOn(newVal);
    }
  };

  const toggleCam = async () => {
    if (room?.localParticipant) {
      const newVal = !isCamOn;
      await room.localParticipant.setCameraEnabled(newVal);
      setIsCamOn(newVal);
    }
  };

  const toggleScreenShare = async () => {
    if (!room?.localParticipant) return;
    try {
        if (isScreenShareOn) {
            await room.localParticipant.setScreenShareEnabled(false);
            setIsScreenShareOn(false);
            return;
        }
        const tracks = await room.localParticipant.createScreenTracks({
            audio: true,
            video: { resolution: { width: 1920, height: 1080 }, frameRate: 30 },
        });
        for (const track of tracks) {
            await room.localParticipant.publishTrack(track, {
                simulcast: false,
                videoEncoding: { maxBitrate: 5_000_000, maxFramerate: 30 },
            });
        }
        setIsScreenShareOn(true);
    } catch (err) { console.error("Screen share failed:", err); }
  };

  const leaveRoom = () => {
    room?.disconnect();
    if (onLeave) onLeave();
    else router.push("/dashboard");
  };

  // --- LOGIC: Video Selection ---
  const remoteCameraTrack = remoteTracks.find(t => t.track.kind === Track.Kind.Video && t.track.source === Track.Source.Camera);
  const remoteScreenShareTrack = remoteTracks.find(t => t.track.kind === Track.Kind.Video && t.track.source === Track.Source.ScreenShare);
  const mainVideoTrack = remoteScreenShareTrack || remoteCameraTrack;

  if (error) return <div className="h-screen flex items-center justify-center text-red-500 font-medium">{error}</div>;
  if (!isConnected || !room) return <div className="h-screen flex items-center justify-center text-indigo-500"><Loader2 className="animate-spin" /></div>;

  return (
    <>
      <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50 h-16 shrink-0">
          <h1 className="font-bold text-lg">{roomName || "Live Interview"}</h1>
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-xs uppercase font-bold tracking-wider text-red-500">Live</span>
              </div>
              
              {/* Finish Button - Triggers Modal */}
              {isInterviewer && (
                  <button 
                      onClick={() => setIsFinishModalOpen(true)} // <--- TRIGGER MODAL
                      disabled={completeInterviewMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-green-600/20"
                  >
                      {completeInterviewMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <CheckCheck size={16} />}
                      Finish Interview
                  </button>
              )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          <div className={`flex-1 p-4 transition-all duration-500 ease-in-out ${activeTab ? 'w-1/2' : 'w-full'}`}>
              <div className="relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl ring-1 ring-white/5">
                  {mainVideoTrack ? (
                      <div className="absolute inset-0 w-full h-full">
                          <RemoteVideoTrack track={mainVideoTrack.track} fit={mainVideoTrack.track.source === Track.Source.ScreenShare ? "contain" : "cover"} />
                          <div className="absolute top-4 left-4 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
                              <p className="text-sm font-medium text-white shadow-sm flex items-center gap-2">
                                  { isInterviewer ? sender?.name : receiver?.name}
                                  {mainVideoTrack.track.source === Track.Source.ScreenShare && <span className="text-xs text-indigo-300 bg-indigo-500/20 px-1.5 rounded border border-indigo-500/30">Sharing Screen</span>}
                              </p>
                          </div>
                      </div>
                  ) : (
                      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-900/50 gap-4">
                          <div className="relative"><div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center animate-pulse"><Loader2 className="w-10 h-10 text-indigo-400 animate-spin" /></div></div>
                          <p className="text-slate-500 font-medium">Waiting for participant to join...</p>
                      </div>
                  )}
                  <div className="absolute bottom-4 right-4 w-80 aspect-[16/9] bg-slate-800 rounded-xl overflow-hidden border border-white/20 shadow-2xl z-50 transition-transform hover:scale-105 group">
                      <LocalVideoTrack room={room} />
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-medium backdrop-blur-md">You {isScreenShareOn && "(Sharing)"}</div>
                      {!isMicOn && (<div className="absolute top-2 right-2 bg-red-500/90 p-1.5 rounded-full backdrop-blur-sm"><MicOff size={10} className="text-white" /></div>)}
                  </div>
                  {remoteTracks.filter(t => t.track.kind === Track.Kind.Audio).map(t => <RemoteAudioTrack key={t.track.sid} track={t.track} />)}
              </div>
          </div>

          <div className={`bg-slate-900 border-l border-white/10 flex flex-col transition-all duration-500 ease-in-out ${activeTab ? 'w-1/2 translate-x-0 opacity-100' : 'w-0 translate-x-full opacity-0'}`}>
              <div className="flex items-center justify-between p-3 bg-slate-950 border-b border-white/10">
                  <div className="flex items-center gap-3">
                      {activeTab === "code" && (<><Code size={16} className="text-indigo-400" /><span className="text-sm font-semibold">Code Editor</span><div className="relative group ml-2"><select value={language} onChange={(e) => handleLanguageChange(e.target.value)} className="bg-slate-800 text-xs text-white border border-white/10 rounded-md py-1 pl-2 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer hover:bg-slate-700 transition">{LANGUAGES.map(lang => <option key={lang.id} value={lang.id}>{lang.label}</option>)}</select><ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /></div></>)}
                      {activeTab === "board" && (<><LayoutDashboard size={16} className="text-indigo-400" /><span className="text-sm font-semibold">Whiteboard</span></>)}
                  </div>
                  <button onClick={() => setActiveTab(null)} className="hover:bg-white/10 p-1 rounded transition text-slate-400 hover:text-white"><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-hidden relative bg-[#0f172a]"> 
                {activeTab === "code" && <MonacoEditor height="100%" language={language} value={code} onChange={handleEditorChange} theme="vs-dark" />}
                {activeTab === "board" && <ExcalidrawWrapper elements={whiteboardElements} onChange={handleWhiteboardChange} />}
              </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="p-4 flex justify-center items-center gap-4 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 h-24 shrink-0 z-50">
          <button onClick={toggleMic} className={`p-3 rounded-full transition-all ${isMicOn ? "bg-slate-800 hover:bg-slate-700" : "bg-red-500 hover:bg-red-600 shadow-red-500/20 shadow-lg"}`}>{isMicOn ? <Mic size={20} /> : <MicOff size={20} />}</button>
          <button onClick={toggleCam} className={`p-3 rounded-full transition-all ${isCamOn ? "bg-slate-800 hover:bg-slate-700" : "bg-red-500 hover:bg-red-600 shadow-red-500/20 shadow-lg"}`}>{isCamOn ? <Video size={20} /> : <VideoOff size={20} />}</button>
          <button onClick={toggleScreenShare} title="Share Screen" className={`p-3 rounded-full transition-all ${isScreenShareOn ? "bg-green-600 hover:bg-green-500 shadow-green-500/20 shadow-lg text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"}`}>{isScreenShareOn ? <MonitorOff size={20} /> : <MonitorUp size={20} />}</button>
          <button onClick={leaveRoom} className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 transition-all font-bold flex items-center gap-2 shadow-lg shadow-red-600/20 active:scale-95"><PhoneOff size={20} /> <span>End</span></button>
          <div className="w-px h-8 bg-white/10 mx-2"></div>
          <button onClick={() => setActiveTab(activeTab === "code" ? null : "code")} className={`p-3 rounded-full transition-all flex items-center gap-2 ${activeTab === "code" ? "bg-indigo-600 shadow-indigo-500/20 shadow-lg" : "bg-slate-800 hover:bg-slate-700"}`}><Code size={20} /> <span className="hidden md:inline font-medium text-sm">Code</span> </button>
          <button onClick={() => setActiveTab(activeTab === "board" ? null : "board")} className={`p-3 rounded-full transition-all flex items-center gap-2 ${activeTab === "board" ? "bg-indigo-600 shadow-indigo-500/20 shadow-lg" : "bg-slate-800 hover:bg-slate-700"}`}><LayoutDashboard size={20} /> <span className="hidden md:inline font-medium text-sm">Board</span> </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        onConfirm={handleFinishInterview}
        title="Complete Interview"
        message="Are you sure you want to finish the interview? This will end the session for both participants and redirect you to the feedback page."
        confirmText="Yes, Finish"
        variant="success"
      />
    </>
  );
}

// Sub components (LocalVideoTrack, RemoteVideoTrack, etc.) unchanged...
function LocalVideoTrack({ room }: { room: Room }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
      if (!videoRef.current) return;
      const attachTrack = () => {
        const videoTrack = room.localParticipant.getTrackPublication(Track.Source.Camera)?.videoTrack;
        if (videoTrack) videoTrack.attach(videoRef.current!);
      };
      room.localParticipant.on(RoomEvent.LocalTrackPublished, attachTrack);
      room.localParticipant.on(RoomEvent.LocalTrackUnpublished, attachTrack);
      attachTrack();
      return () => { 
        room.localParticipant.off(RoomEvent.LocalTrackPublished, attachTrack); 
        room.localParticipant.off(RoomEvent.LocalTrackUnpublished, attachTrack);
      }
    }, [room]);
    return <video ref={videoRef} className="w-full h-full object-cover transform -scale-x-100" />;
}

function RemoteVideoTrack({ track, fit = "cover" }: { track: RemoteTrack, fit?: "cover" | "contain" }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
      if (videoRef.current) track.attach(videoRef.current);
      return () => { track.detach(); };
    }, [track]);
    return <video ref={videoRef} className="w-full h-full" style={{ objectFit: fit }} />;
}

function RemoteAudioTrack({ track }: { track: RemoteTrack }) {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
      const el = audioRef.current;
      if (el) {
        track.attach(el);
        
        // --- FORCE SPEAKER LOGIC (ANDROID ONLY) ---
        const forceSpeaker = async () => {
           try {
              // Check if browser supports audio output selection
              // @ts-ignore - setSinkId is not yet in all TS definitions
              if (typeof el.setSinkId !== 'function') return;

              const devices = await navigator.mediaDevices.enumerateDevices();
              const audioOutputs = devices.filter(d => d.kind === 'audiooutput');

              // Attempt to find the "speaker" or "hands-free" device
              // Note: Labels might be empty if permissions aren't fully granted yet, 
              // but usually are available during an active call.
              const speaker = audioOutputs.find(d => 
                  d.label.toLowerCase().includes('speaker') || 
                  d.label.toLowerCase().includes('hands-free')
              );

              if (speaker) {
                  // @ts-ignore
                  await el.setSinkId(speaker.deviceId);
              }
           } catch (e) {
              console.warn("Failed to set audio output:", e);
           }
        };

        forceSpeaker();
      }

      return () => { track.detach(); };
    }, [track]);

    return <audio ref={audioRef} autoPlay playsInline />;
}