'use client';

import Link from 'next/link';
import { Mic, MicOff, PhoneOff, Radio, ShieldCheck, Video, VideoOff } from 'lucide-react';
import { Room, RoomEvent, Track } from 'livekit-client';
import { useEffect, useRef, useState } from 'react';
import { AccessibleSheet } from '@/components/ui/AccessibleSheet';
import { authenticatedFetch, readJson } from '@/lib/api';

type Match = { id: string; other_display_name: string | null; skill_name: string | null };
type Session = { id: string; livekit_room: string; status: string };
type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'ended' | 'error';

export default function CallPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [state, setState] = useState<ConnectionState>('idle');
  const [partner, setPartner] = useState('Waiting for partner…');
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const audioElementsRef = useRef<HTMLMediaElement[]>([]);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('match') || '';
    setSelectedMatch(fromUrl);
    authenticatedFetch('/api/matches?view=accepted').then((r) => readJson<{ matches: Match[] }>(r)).then((data) => {
      setMatches(data.matches);
      if (!fromUrl && data.matches[0]) setSelectedMatch(data.matches[0].id);
    }).catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to load accepted matches'));

    return () => {
      const room = roomRef.current;
      roomRef.current = null;
      room?.disconnect();
      audioElementsRef.current.forEach((element) => element.remove());
      audioElementsRef.current = [];
    };
  }, []);

  const bindRoom = (room: Room) => {
    room.on(RoomEvent.ParticipantConnected, (participant) => setPartner(participant.name || participant.identity));
    room.on(RoomEvent.ParticipantDisconnected, () => setPartner('Waiting for partner…'));
    room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
      setPartner(participant.name || participant.identity);
      if (track.kind === Track.Kind.Video && remoteVideoRef.current) track.attach(remoteVideoRef.current);
      if (track.kind === Track.Kind.Audio) {
        const element = track.attach();
        element.dataset.livekitAudio = 'true';
        document.body.appendChild(element);
        audioElementsRef.current.push(element);
      }
    });
    room.on(RoomEvent.TrackUnsubscribed, (track) => track.detach());
    room.on(RoomEvent.Reconnecting, () => setState('reconnecting'));
    room.on(RoomEvent.Reconnected, () => setState('connected'));
    room.on(RoomEvent.Disconnected, () => setState((current) => current === 'ended' ? current : 'ended'));
  };

  const startCall = async () => {
    if (!selectedMatch || state === 'connecting') return;
    setError(null); setState('connecting');
    try {
      const created = await authenticatedFetch('/api/sessions', { method: 'POST', body: JSON.stringify({ matchId: selectedMatch }) }).then((r) => readJson<{ session: Session }>(r));
      setSessionId(created.session.id);
      const credentials = await authenticatedFetch(`/api/sessions/${created.session.id}/token`, { method: 'POST' }).then((r) => readJson<{ token: string; serverUrl: string }>(r));
      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room; bindRoom(room);
      await room.connect(credentials.serverUrl, credentials.token);
      await room.localParticipant.enableCameraAndMicrophone();
      const localCamera = room.localParticipant.getTrackPublication(Track.Source.Camera);
      if (localCamera?.videoTrack && localVideoRef.current) localCamera.videoTrack.attach(localVideoRef.current);
      const existing = [...room.remoteParticipants.values()][0];
      if (existing) setPartner(existing.name || existing.identity);
      setState('connected'); setMicOn(true); setCameraOn(true);
    } catch (cause) {
      setState('error');
      setError(cause instanceof Error ? cause.message : 'Unable to start call. Check camera/microphone permissions and LiveKit configuration.');
      roomRef.current?.disconnect(); roomRef.current = null;
    }
  };

  const disconnectRoom = async (persist = true, reason = 'user_ended') => {
    const room = roomRef.current; roomRef.current = null;
    if (persist && sessionId) await authenticatedFetch(`/api/sessions/${sessionId}`, { method: 'PATCH', body: JSON.stringify({ action: 'end', reason }) }).catch(() => undefined);
    room?.disconnect();
    audioElementsRef.current.forEach((element) => element.remove()); audioElementsRef.current = [];
    setState('ended');
  };

  const toggleMic = async () => { const next = !micOn; try { await roomRef.current?.localParticipant.setMicrophoneEnabled(next); setMicOn(next); } catch { setError('Unable to change microphone state.'); } };
  const toggleCamera = async () => { const next = !cameraOn; try { const pub = await roomRef.current?.localParticipant.setCameraEnabled(next); if (next && pub?.videoTrack && localVideoRef.current) pub.videoTrack.attach(localVideoRef.current); setCameraOn(next); } catch { setError('Unable to change camera state.'); } };
  const safetyCheck = async (comfortable: boolean) => { if (!sessionId) return; await authenticatedFetch(`/api/sessions/${sessionId}`, { method: 'PATCH', body: JSON.stringify({ action: 'checkin', comfortable }) }).then(readJson); setSafetyOpen(false); if (!comfortable) await disconnectRoom(true, 'safety_checkin_ended'); };
  const report = async () => { if (!sessionId || reportText.trim().length < 2) return; await authenticatedFetch(`/api/sessions/${sessionId}`, { method: 'PATCH', body: JSON.stringify({ action: 'report', reason: reportText }) }).then(readJson); setSafetyOpen(false); await disconnectRoom(false, 'user_report'); };

  if (state === 'ended') return <div className="ss-page ss-page-pad min-h-[calc(100dvh-122px)] grid place-items-center text-center"><div><PhoneOff className="h-7 w-7 mx-auto text-muted-foreground" /><h1 className="mt-5 text-2xl">Call ended.</h1><p className="mt-3 text-sm text-muted-foreground">The session duration and end state were persisted.</p><Link href="/dashboard" className="ss-button-primary mt-6">Return home</Link></div></div>;

  return <div className="ss-page ss-page-pad !pb-3 min-h-[calc(100dvh-122px)] lg:min-h-[calc(100dvh-64px)] flex flex-col gap-4">
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">LiveKit session</p><h1 className="mt-1 text-xl lg:text-2xl">Skill call</h1><p className="mt-2 text-xs text-muted-foreground">{state === 'reconnecting' ? 'Reconnecting…' : state === 'connected' ? 'Connected' : 'Choose an accepted match to join a realtime room.'}</p></div><div className="flex flex-wrap gap-2"><select aria-label="Accepted match" value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)} disabled={state === 'connected' || state === 'connecting'} className="ss-input !w-auto min-w-48"><option value="">Choose match</option>{matches.map((match) => <option key={match.id} value={match.id}>{match.other_display_name || 'Skill partner'}{match.skill_name ? ` · ${match.skill_name}` : ''}</option>)}</select>{state !== 'connected' && <button onClick={startCall} disabled={!selectedMatch || state === 'connecting'} className="ss-button-primary disabled:opacity-50"><Radio className="h-4 w-4" /> {state === 'connecting' ? 'Connecting…' : 'Join room'}</button>}{state === 'connected' && <button onClick={() => setSafetyOpen(true)} className="ss-button-secondary"><ShieldCheck className="h-4 w-4" /> Safety check</button>}</div></div>
    {error && <div role="alert" className="p-3 border border-red-500/30 rounded-[9px] text-xs text-red-500">{error}</div>}
    <div className="flex-1 min-h-[420px] grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 gap-2 lg:gap-3"><div className="relative overflow-hidden bg-black border border-white/10 rounded-[10px] min-h-[200px]"><video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" /><div className="absolute inset-0 -z-0 grid place-items-center text-white/35 text-sm">{state === 'connected' ? 'Waiting for remote video…' : 'Not connected'}</div><span className="absolute left-3 bottom-3 bg-black/70 text-white border border-white/10 px-3 py-1.5 rounded-full text-[11px] font-bold">{partner}</span></div><div className="relative overflow-hidden bg-black border border-white/10 rounded-[10px] min-h-[200px]">{cameraOn ? <video ref={localVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover mirror-mode" /> : <div className="absolute inset-0 grid place-items-center text-white/35">Camera off</div>}<span className="absolute left-3 bottom-3 bg-black/70 text-white border border-white/10 px-3 py-1.5 rounded-full text-[11px] font-bold">You</span></div></div>
    {state === 'connected' && <div className="sticky bottom-[72px] lg:bottom-3 z-30 mx-auto w-fit bg-background border ss-hairline rounded-full px-2.5 py-2 flex items-center gap-1.5"><button onClick={toggleMic} className={`h-11 w-11 rounded-full grid place-items-center ${micOn ? 'bg-muted' : 'bg-red-500/15 text-red-500'}`} aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}>{micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}</button><button onClick={toggleCamera} className={`h-11 w-11 rounded-full grid place-items-center ${cameraOn ? 'bg-muted' : 'bg-red-500/15 text-red-500'}`} aria-label={cameraOn ? 'Turn camera off' : 'Turn camera on'}>{cameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}</button><button onClick={() => disconnectRoom()} className="h-11 px-4 rounded-full bg-red-500 text-white" aria-label="End call"><PhoneOff className="h-5 w-5" /></button></div>}
    <AccessibleSheet open={safetyOpen} onClose={() => setSafetyOpen(false)} title="Session safety" description="These controls record an explicit check-in or report. No automated face/identity claim is made."><div className="grid grid-cols-2 gap-2"><button onClick={() => safetyCheck(true)} className="ss-button-primary">I’m comfortable</button><button onClick={() => safetyCheck(false)} className="ss-button-secondary">End session</button></div><textarea value={reportText} onChange={(e) => setReportText(e.target.value)} className="ss-input min-h-28 py-3 mt-4" placeholder="Report a safety concern" /><button disabled={reportText.trim().length < 2} onClick={report} className="mt-2 min-h-11 w-full rounded-[9px] bg-red-500 text-white text-xs font-bold disabled:opacity-50">Report & end call</button></AccessibleSheet>
  </div>;
}
