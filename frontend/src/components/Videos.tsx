import { MutableRefObject, useEffect } from "react";
import Message from "./Message";
import Draggable from "react-draggable";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { isConnected } from "@/store/atoms/Connection";
import { RotatingLines } from "react-loader-spinner";
import { IncomingMessages } from "@/store/atoms/Message";
import { SpeakerOffIcon, VideoIcon } from "@radix-ui/react-icons";
import { AudioTrack } from "@/store/atoms/AudioTrack";

const Videos = ({
  localVideo,
  remoteVideo,
  socket,
  roomId,
}: {
  localVideo: MutableRefObject<HTMLVideoElement | undefined>;
  remoteVideo: MutableRefObject<HTMLVideoElement | undefined>;
  socket: WebSocket | null;
  roomId: string;
}) => {
  const isStarted = useRecoilValue(isConnected);
  const setMessages = useSetRecoilState(IncomingMessages);
  const setAudio = useSetRecoilState(AudioTrack);

  useEffect(() => {
    setMessages([]);
  });

  console.log(remoteVideo.current?.srcObject);  

  return (
    <div className="flex w-full h-screen">
      <div className="flex-1 min-h-full flex justify-center items-center">
        <div className="w-[800px] h-[500px] relative bg-[#202124] rounded-md overflow-hidden">
          {isStarted ? (
            <>
              <div className="w-full h-full">
                <video
                  // @ts-ignore
                  ref={remoteVideo}
                  className="w-full h-full object-cover"
                />
              </div>
              {!remoteVideo.current?.srcObject && (
                <div className="absolute top-0 w-full h-full flex justify-center items-center">
                  <p className="text-center text-white font-Montserrat">
                    Connected...
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                Looking for someone who can connect
              </h4>
              <RotatingLines
                visible={true}
                // @ts-ignore
                height="96"
                width="96"
                color="grey"
                strokeWidth="5"
                animationDuration="0.75"
                ariaLabel="rotating-lines-loading"
                wrapperStyle={{}}
              />
            </div>
          )}
          <Draggable bounds="parent">
            <div className="absolute w-[150px] left-0 top-0">
              {/* @ts-ignore */}
              <video ref={localVideo} className="w-full h-full object-cover" />
            </div>
          </Draggable>
          <div className="absolute bottom-0 left-0 w-full flex justify-center items-center gap-4 p-5">
            <div
              className="border-2 bg-transparent border-white p-3 rounded-full cursor-pointer hover:bg-gray-700"
              onClick={() => setAudio((prev) => !prev)}
            >
              <SpeakerOffIcon width={20} height={20} />
            </div>
            <div className="border-2 bg-transparent border-white p-3 rounded-full cursor-pointer hover:bg-gray-700">
              <VideoIcon width={20} height={20} />
            </div>
          </div>
        </div>
      </div>
      {remoteVideo &&
        isStarted &&
        remoteVideo.current &&
        remoteVideo.current.srcObject && (
          <div
            className={`w-1/4 ${
              isConnected ? "block" : "hidden"
            } transition ease-in-out delay-150`}
          >
            <Message roomId={roomId} socket={socket} />
          </div>
        )}
    </div>
  );
};

export default Videos;
