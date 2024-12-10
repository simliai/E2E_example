import './Tile.css';
import { useEffect, useRef, useState } from 'react';
import { useMediaTrack } from '@daily-co/daily-react';

interface TileProps {
  id: string;
}

export default function Tile({ id }: TileProps) {
  const videoTrack = useMediaTrack(id, 'video');
  const audioTrack = useMediaTrack(id, 'audio');

  const [videoSrcObjectSet, setVideoSrcObjectSet] = useState(false);
  const [audioSrcObjectSet, setAudioSrcObjectSet] = useState(false);

  const videoElement = useRef<HTMLVideoElement | null>(null);
  const audioElement = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const videoRef = videoElement.current;

    if (videoRef && videoTrack?.track && !videoSrcObjectSet) {
      videoRef.srcObject = new MediaStream([videoTrack.track]);
      setVideoSrcObjectSet(true);
    }
  }, [videoTrack, videoSrcObjectSet]);

  useEffect(() => {
    const audioRef = audioElement.current;

    if (audioRef && audioTrack?.persistentTrack && !audioSrcObjectSet) {
      audioRef.srcObject = new MediaStream([audioTrack.persistentTrack]);
      setAudioSrcObjectSet(true);
    }
  }, [audioTrack, audioSrcObjectSet]);

  return (
    <div className='tile-video'>
      {videoTrack && <video autoPlay muted playsInline ref={videoElement} />}
      {audioTrack && <audio autoPlay playsInline ref={audioElement} />}
    </div>
  );
}
