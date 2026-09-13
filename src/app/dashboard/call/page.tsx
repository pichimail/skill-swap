'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, Mic, MicOff, PhoneOff, ShieldAlert, ShieldCheck, Video, VideoOff, X } from 'lucide-react';
import Link from 'next/link';

export default function CallPage() {
  const [micOn, setMicOn] = useState(true);
  const [vidOn, setVidOn] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [callActive, setCallActive] = useState(true);
  const [disconnectReason, setDisconnectReason] = useState<string | null>(null);
  const [aiWarning, setAiWarning] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [partnerName, setPartnerName] = useState('Connecting…');
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!cameraEnabled) return;
    const timer = setTimeout(() => setPartnerName('Alice Chen'), 3000);
    return () => clearTimeout(timer);
  }, [cameraEnabled]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (vidOn && callActive && cameraEnabled) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((nextStream) => {
          stream = nextStream;
          if (localVideoRef.current) localVideoRef.current.srcObject = nextStream;
          nextStream.getAudioTracks().forEach((track) => { track.enabled = micOn; });
        })
        .catch((error) => console.error('Webcam error:', error));
    }
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, [vidOn, callActive, cameraEnabled, micOn]);

  useEffect(() => {
    if (!callActive || !cameraEnabled) return;
    const warningTimer = setTimeout(() => setAiWarning(true), 4000);
    return () => clearTimeout(warningTimer);
  }, [callActive, cameraEnabled]);

  useEffect(() => {
    if (!aiWarning) return;
    if (countdown === 0) {
      setAiWarning(false);
      setCallActive(false);
      setDisconnectReason('AI_MODERATION_NO_FACE');
      return;
    }
    const interval = setInterval(() => setCountdown((value) => value - 1), 1000);
    return () => clearInterval(interval);
  }, [aiWarning, countdown]);

  if (!callActive) {
    return (
      <div className="ss-page ss-page-pad min-h-[calc(100dvh-122px)] lg:min-h-[calc(100dvh-64px)] grid place-items-center">
        <div className="max-w-md text-center">
          <span className={`mx-auto h-14 w-14 rounded-full grid place-items-center ${disconnectReason ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground'}`}>
            {disconnectReason ? <ShieldAlert className="h-6 w-6" /> : <PhoneOff className="h-6 w-6" />}
          </span>
          <h1 className="mt-5 text-2xl">{disconnectReason ? 'Session stopped for safety.' : 'Call ended.'}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{disconnectReason ? 'A clear face was not detected during the identity check. Start a new session when your camera framing is ready.' : 'Your session is complete. Progress and feedback can be attached to the session record.'}</p>
          <Link href="/dashboard" className="ss-button-primary mt-6">Return home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ss-page ss-page-pad !pb-2 lg:!pb-6 min-h-[calc(100dvh-122px)] lg:min-h-[calc(100dvh-64px)] flex flex-col gap-3 lg:gap-4">
      {!cameraEnabled && (
        <div className="fixed inset-0 z-[120] bg-[#050505] text-white grid place-items-center p-5">
          <div className="max-w-md text-center">
            <span className="mx-auto h-16 w-16 ss-chamfer bg-[var(--signal)] text-black grid place-items-center"><Video className="h-7 w-7" /></span>
            <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-white/50 font-bold">Video session</p>
            <h1 className="mt-3 text-3xl text-white">Ready to join?</h1>
            <p className="mt-3 text-sm text-white/60">Camera access is required for video and identity-safety checks. Your local media starts only after you continue.</p>
            <button onClick={() => setCameraEnabled(true)} className="ss-button-primary mt-7 min-w-52">Enable camera & join</button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Live session</p>
          <h1 className="mt-1 text-xl lg:text-2xl">Skill call</h1>
        </div>
        <button onClick={() => setShowCheckIn(true)} className="ss-chip ss-chip-active"><ShieldCheck className="h-3.5 w-3.5" /> Safety check</button>
      </div>

      <div className="flex-1 min-h-[420px] grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 gap-2 lg:gap-3">
        <div className="relative overflow-hidden bg-black border border-white/10 rounded-[10px] min-h-[200px]">
          <div className="absolute inset-0 grid place-items-center text-white/30 text-sm">Waiting for partner…</div>
          <span className="absolute left-3 bottom-3 bg-black/70 text-white border border-white/10 px-3 py-1.5 rounded-full text-[11px] font-bold inline-flex items-center gap-2">{partnerName}<span className="h-2 w-2 rounded-full bg-[var(--signal)]" /></span>
        </div>

        <div className="relative overflow-hidden bg-black border border-white/10 rounded-[10px] min-h-[200px]">
          {vidOn ? (
            <video ref={localVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover mirror-mode" />
          ) : (
            <div className="absolute inset-0 grid place-items-center"><span className="h-20 w-20 rounded-full bg-white/10 text-white/40 grid place-items-center text-sm font-bold">You</span></div>
          )}
          <span className="absolute left-3 bottom-3 bg-black/70 text-white border border-white/10 px-3 py-1.5 rounded-full text-[11px] font-bold inline-flex items-center gap-2">You {!micOn && <MicOff className="h-3.5 w-3.5 text-red-400" />}</span>

          <AnimatePresence>
            {aiWarning && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 bg-red-950/78 p-5 grid place-items-center border-4 border-red-500">
                <div className="text-center max-w-sm text-white">
                  <ShieldAlert className="h-8 w-8 mx-auto text-red-400" />
                  <h2 className="mt-3 text-xl font-black text-white">Face check required</h2>
                  <p className="mt-2 text-xs text-white/75">Look at the camera to keep the session active.</p>
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <span className="text-3xl font-black tabular-nums">{countdown}s</span>
                    <button onClick={() => { setAiWarning(false); setCountdown(5); }} className="min-h-11 px-4 rounded-[9px] bg-white text-black text-xs font-black">I’m here</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="sticky bottom-[72px] lg:bottom-3 z-30 mx-auto w-fit max-w-full bg-background border ss-hairline rounded-full px-2.5 py-2 flex items-center gap-1.5 shadow-[0_10px_35px_rgba(0,0,0,.16)]">
        <button onClick={() => setMicOn((value) => !value)} aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'} className={`h-11 w-11 rounded-full grid place-items-center ${micOn ? 'bg-muted' : 'bg-red-500/15 text-red-500'}`}>{micOn ? <Mic className="h-4.5 w-4.5" /> : <MicOff className="h-4.5 w-4.5" />}</button>
        <button onClick={() => setVidOn((value) => !value)} aria-label={vidOn ? 'Turn camera off' : 'Turn camera on'} className={`h-11 w-11 rounded-full grid place-items-center ${vidOn ? 'bg-muted' : 'bg-red-500/15 text-red-500'}`}>{vidOn ? <Video className="h-4.5 w-4.5" /> : <VideoOff className="h-4.5 w-4.5" />}</button>
        <button aria-label="Open messages" className="h-11 w-11 rounded-full bg-muted grid place-items-center"><MessageSquare className="h-4.5 w-4.5" /></button>
        <button onClick={() => setCallActive(false)} aria-label="End call" className="h-11 px-4 rounded-full bg-red-500 text-white grid place-items-center"><PhoneOff className="h-5 w-5" /></button>
      </div>

      <AnimatePresence>
        {showCheckIn && (
          <>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCheckIn(false)} className="fixed inset-0 z-[90] bg-black/55" aria-label="Close safety check" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              drag="y" dragConstraints={{ top: 0, bottom: 220 }} dragElastic={0.12}
              onDragEnd={(_, info) => { if (info.offset.y > 90) setShowCheckIn(false); }}
              className="ss-mobile-sheet sm:left-1/2 sm:right-auto sm:bottom-6 sm:-translate-x-1/2 sm:w-[420px] sm:rounded-[12px] sm:border-b"
            >
              <div className="ss-sheet-handle" />
              <div className="p-5 pt-3">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Safety</p><h2 className="mt-1 text-xl">Check in</h2></div>
                  <button onClick={() => setShowCheckIn(false)} className="h-10 w-10 rounded-full grid place-items-center hover:bg-muted"><X className="h-4 w-4" /></button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Are you comfortable with how this session is going?</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button onClick={() => setShowCheckIn(false)} className="ss-button-primary">All good</button>
                  <button onClick={() => { setShowCheckIn(false); setCallActive(false); }} className="min-h-11 rounded-[9px] border border-red-500/30 text-red-500 text-xs font-bold">End call</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
