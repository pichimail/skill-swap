'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ShieldAlert, MessageSquare, ShieldCheck } from 'lucide-react';
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
  const [partnerName, setPartnerName] = useState('Connecting...');
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
        .then((s) => {
          stream = s;
          if (localVideoRef.current) localVideoRef.current.srcObject = s;
          s.getAudioTracks().forEach((track) => { track.enabled = micOn; });
        })
        .catch((err) => console.error('Webcam error:', err));
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
    const interval = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [aiWarning, countdown]);

  if (!callActive) {
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center p-4 text-center">
        {disconnectReason === 'AI_MODERATION_NO_FACE' ? (
          <>
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-6 border-4 border-red-500/20">
              <ShieldAlert className="h-10 w-10 text-red-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-red-600 mb-2">Disconnected by AI Safety System</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">The call was terminated because a clear face was not detected in the camera frame. This platform enforces strict identity verification to keep the community safe.</p>
          </>
        ) : (
          <>
            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6"><PhoneOff className="h-10 w-10 text-slate-500" /></div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Call Ended</h2>
            <p className="text-slate-500 mb-8">The session has ended. How was your experience?</p>
          </>
        )}
        <Link href="/dashboard" className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-lg">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] p-4 md:p-6 max-w-6xl mx-auto flex flex-col gap-4">
      {!cameraEnabled && (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white">
          <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700"><Video className="h-10 w-10 text-sky-500" /></div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Ready to Join?</h2>
          <p className="text-slate-400 mb-8 max-w-md text-center text-sm">Skill Swap requires camera access to enforce our zero-proxy safety policy and run identity checks.</p>
          <button onClick={() => setCameraEnabled(true)} className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-sky-500/20">Enable Camera & Join Call</button>
        </div>
      )}

      <div className="flex-1 grid md:grid-cols-2 gap-4 relative">
        <div className="relative rounded-2xl bg-slate-900 overflow-hidden shadow-lg border border-slate-900">
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900"><span className="text-white/20 text-xl font-medium">Waiting for Partner...</span></div>
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm font-medium flex items-center gap-2">{partnerName}{partnerName === 'Connecting...' && <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}</div>
        </div>
        <div className="relative rounded-2xl bg-slate-900 overflow-hidden shadow-lg border border-slate-900">
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            {vidOn ? <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror-mode" /> : <div className="h-24 w-24 rounded-full bg-slate-700 flex items-center justify-center text-3xl font-bold text-slate-500">You</div>}
          </div>
          <AnimatePresence>
            {aiWarning && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 z-40 bg-red-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center border-[6px] border-red-500 rounded-2xl">
                <div className="h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-500/50 animate-pulse"><ShieldAlert className="h-8 w-8 text-white" /></div>
                <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">AI Moderation Warning</h2>
                <p className="text-white/90 text-sm max-w-sm mb-6 font-medium">Face not detected. Please look at the camera to verify your identity.</p>
                <div className="bg-black/50 px-6 py-3 rounded-xl border border-red-500/50 flex items-center gap-4">
                  <span className="text-4xl font-mono font-bold text-red-500">{countdown}s</span>
                  <button onClick={() => { setAiWarning(false); setCountdown(5); }} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg shadow-lg">I am here</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute top-4 right-4"><button onClick={() => setShowCheckIn(true)} className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-full text-[10px] font-medium text-slate-300 hover:text-white"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Safety Check</button></div>
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm font-medium flex items-center gap-2">You{!micOn && <MicOff className="h-3.5 w-3.5 text-rose-500" />}</div>
        </div>
      </div>

      <div className="h-20 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center gap-4 md:gap-6 px-4">
        <button onClick={() => setMicOn(!micOn)} className={`h-12 w-12 rounded-full flex items-center justify-center ${micOn ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-600'}`}>{micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}</button>
        <button onClick={() => setVidOn(!vidOn)} className={`h-12 w-12 rounded-full flex items-center justify-center ${vidOn ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-600'}`}>{vidOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}</button>
        <button className="h-12 w-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center"><MessageSquare className="h-5 w-5" /></button>
        <div className="w-px h-8 bg-slate-200 mx-2" />
        <button onClick={() => setCallActive(false)} className="h-12 w-16 md:w-24 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 shadow-md shadow-rose-500/20"><PhoneOff className="h-5 w-5" /></button>
      </div>

      <AnimatePresence>
        {showCheckIn && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed bottom-28 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 z-50">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0"><ShieldCheck className="h-5 w-5 text-teal-600" /></div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Safety Check-in</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">Are you comfortable with how this session is going?</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowCheckIn(false)} className="flex-1 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium">Yes, all good</button>
                  <button onClick={() => { setShowCheckIn(false); setCallActive(false); }} className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium border border-rose-100"><span className="flex items-center justify-center gap-2"><ShieldAlert className="h-4 w-4" /> End Call</span></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
