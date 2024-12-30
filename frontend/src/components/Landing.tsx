import { useEffect, useRef, useState } from "react";
import Room from "./Room";
import { Button } from "./ui/button";
// import { useTheme } from "@/components/theme-provider";
import { SpeakerLoudIcon, VideoIcon } from "@radix-ui/react-icons";
import { Input } from "./ui/input";
import { useRecoilState } from "recoil";
import { AudioTrack } from "@/store/atoms/AudioTrack";
import { VideoTrack } from "@/store/atoms/VideoTrack";

const Landing = () => {
  // const [name, setName] = useState<string>("");
  const [localVideoTrack, setLocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [joined, setJoined] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const [name, setName] = useState<string>("");
  const [allowVideo, setAllowVideo] = useRecoilState(VideoTrack);
  const [allowAudio, setAllowAudio] = useRecoilState(AudioTrack);

  console.log(allowVideo, allowAudio);

  const getCam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: allowVideo,
      audio: {
        noiseSuppression : true,
        echoCancellation : true,
        autoGainControl : true
      },
    });
    streamRef.current = stream;

    let audioTrack;
    let videoTrack;

    if (allowVideo) videoTrack = stream.getVideoTracks()[0];
    if (allowAudio) audioTrack = stream.getAudioTracks()[0];

    setLocalVideoTrack(stream.getVideoTracks()[0]);
    setLocalAudioTrack(stream.getAudioTracks()[0]);

    if (videoRef.current) {
      videoRef.current.srcObject = new MediaStream();
      if (audioTrack) {
        videoRef.current.srcObject.addTrack(audioTrack);
      }
      if (videoTrack) {
        videoRef.current.srcObject.addTrack(videoTrack);
      }
      videoRef.current.play();
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      getCam();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [videoRef, allowVideo]);

  useEffect(() => {
    setAllowAudio(true);
    setAllowVideo(true);
  }, []);

  useEffect(() => {
    if (!allowAudio && localAudioTrack && videoRef.current) {
      streamRef.current?.removeTrack(localAudioTrack);
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play();
    } else if (allowAudio && localAudioTrack && videoRef.current) {
      streamRef.current?.addTrack(localAudioTrack);
      videoRef.current.srcObject = streamRef.current;
      videoRef.current?.play();
    }
  }, [allowAudio]);

  if (!joined) {
    return (
      <div className="h-full w-full flex justify-around mt-[50px]">
        <div className="relative w-[800px] h-[500px] bg-[#202124] rounded-lg overflow-hidden">
          {!allowVideo && (
            <div className="w-full h-full flex justify-center items-center">
              <p className="text-x font-Montserrat">Camera is Off</p>
            </div>  
          )}
          <div className="w-full h-full">
            <video ref={videoRef} className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 flex justify-center gap-5 p-5">
            <div
              className={`w-12 h-12 ${
                allowVideo ? "bg-white" : "bg-red-700"
              } rounded-full flex justify-center items-center cursor-pointer`}
              onClick={() => setAllowVideo((video) => !video)}
            >
              <VideoIcon width={30} height={30} color="black" />
            </div>
            <div
              className={`w-12 h-12 ${
                allowAudio ? "bg-white" : "bg-red-700"
              } rounded-full flex justify-center items-center cursor-pointer`}
              onClick={() => setAllowAudio((audio) => !audio)}
            >
              <SpeakerLoudIcon width={30} height={30} color="black" />
            </div>
          </div>
        </div>
        <div>
          <div className="w-full h-full flex justify-center items-center flex-col">
            <Input
              placeholder="Name..."
              onChange={(e) => setName(e.target.value)}
              className="my-2 w-[300px]"
            />
            <p className="text-sm font-Montserrat mb-5 text-gray-700">
              Name should be greater than 2 characters
            </p>
            <p className="font-Montserrat text-lg">Ready to Meet ?</p>
            <Button
              className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white p-7 my-5 w-[180px] font-Montserrat"
              onClick={() =>
                setJoined((state) => {
                  if (name.length >= 2) state = true;
                  return state;
                })
              }
            >
              Start Random Talk
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full min-h-full">
      <Room
        name={name}
        localVideoTrack={localVideoTrack}
        localAudioTrack={localAudioTrack}
      />
    </div>
  );
};

export default Landing;
