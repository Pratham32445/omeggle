import React, { useEffect, useRef, useState } from "react";
import Room from "./Room";
import { Button } from "./ui/button";
import Home from "./Home";

const Landing = () => {
  const [name, setName] = useState<string>("");
  const [localVideoTrack, setLocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [joined, setJoined] = useState(false);

  const getCam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];
    setLocalAudioTrack(audioTrack);
    setLocalVideoTrack(videoTrack);
    if (videoRef.current) {
      videoRef.current.srcObject = new MediaStream([videoTrack]);
      videoRef.current.play();
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      getCam();
    }
  }, [videoRef]);

  if (!joined) {
    return (
      <div>
        <Home name={name} setname={setName} />
      </div>
    );
  }
  return (
    <div>
      <Room
        name={name}
        localVideoTrack={localVideoTrack}
        localAudioTrack={localAudioTrack}
      />
    </div>
  );
};

export default Landing;
