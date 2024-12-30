import { useEffect, useRef, useState } from "react";
import Videos from "./Videos";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { IncomingMessages } from "@/store/atoms/Message";
import { isConnected } from "@/store/atoms/Connection";
import { AudioTrack } from "@/store/atoms/AudioTrack";
import { VideoTrack } from "@/store/atoms/VideoTrack";

const Room = ({
  name,
  localVideoTrack,
  localAudioTrack,
}: {
  name: string;
  localVideoTrack: MediaStreamTrack | null;
  localAudioTrack: MediaStreamTrack | null;
}) => {
  // @ts-ignore
  const [senderPc, setSenderPc] = useState<RTCPeerConnection | null>(null);
  // @ts-ignore
  const [recievingPc, setRecievingPc] = useState<RTCPeerConnection | null>(
    null
  );
  // @ts-ignore
  const [remoteVideoStream, setRemoteVideoStream] =
    useState<MediaStreamTrack | null>();
  // @ts-ignore
  const [remoteAudioStream, SetRemoteAudioStream] =
    useState<MediaStreamTrack | null>();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const roomIdRef = useRef<string>("");

  const remoteVideoref = useRef<HTMLVideoElement>();
  const localVideoref = useRef<HTMLVideoElement>();

  const setConnection = useSetRecoilState(isConnected);

  const setMessage = useSetRecoilState(IncomingMessages);

  const allowAudio = useRecoilValue(AudioTrack);

  const allowVideo = useRecoilValue(VideoTrack);

  useEffect(() => {
    const WS_URL = "ws://localhost:8080";
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => {
      console.log("connected");
      setSocket(ws);
    };
    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.log(message);

      if (message.type == "create-offer") {
        const pc = new RTCPeerConnection();
        setSenderPc(pc);
        roomIdRef.current = message.roomId;
        setConnection(true);

        if (localVideoTrack) {
          pc.addTrack(localVideoTrack);
        }

        if (localAudioTrack) {
          pc.addTrack(localAudioTrack);
        }

        pc.onnegotiationneeded = async () => {
          try {
            const offer = await pc.createOffer();
            pc.setLocalDescription(offer);
            ws.send(
              JSON.stringify({
                type: "offer",
                sdp: offer,
                roomId: message.roomId,
              })
            );
          } catch (error) {
            console.log(error);
          }
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            ws.send(
              JSON.stringify({
                type: "add-ice-candidate",
                candidate: e.candidate,
                roomId: message.roomId,
                candidateType: "sender",
              })
            );
          }
        };
      } else if (message.type == "offer") {
        const pc = new RTCPeerConnection();
        pc.setRemoteDescription(message.sdp);
        const answer = await pc.createAnswer();
        pc.setLocalDescription(answer);
        const stream = new MediaStream();
        if (remoteVideoref.current) {
          remoteVideoref.current.srcObject = stream;
        }

        // window.pcr = pc;

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            ws.send(
              JSON.stringify({
                type: "add-ice-candidate",
                roomId: message.roomId,
                candidate: e.candidate,
                candidateType: "reciever",
              })
            );
          }
        };

        ws.send(
          JSON.stringify({
            type: "answer",
            sdp: answer,
            roomId: message.roomId,
          })
        );

        setTimeout(() => {
          const track1 = pc?.getTransceivers()[0].receiver.track;
          const track2 = pc?.getTransceivers()[1].receiver.track;
          console.log(track1, track2);

          if (track1.kind == "video") {
            setRemoteVideoStream(track1);
            SetRemoteAudioStream(track2);
          } else {
            setRemoteVideoStream(track2);
            SetRemoteAudioStream(track1);
          }

          // @ts-ignore
          remoteVideoref.current?.srcObject.addTrack(track1);

          // @ts-ignore
          remoteVideoref.current?.srcObject.addTrack(track2);

          remoteVideoref.current?.play();
        }, 5000);
      } else if (message.type == "answer") {
        setSenderPc((pc) => {
          pc?.setRemoteDescription(message.sdp);
          return pc;
        });
      } else if (message.type == "ice-candidate") {
        console.log(message);
        if (message.candidateType == "sender") {
          setRecievingPc((pc) => {
            pc?.addIceCandidate(message.candidate);
            return pc;
          });
        } else {
          setSenderPc((pc) => {
            pc?.addIceCandidate(message.candidate);
            return pc;
          });
        }
      } else if (message.type == "message") {
        setMessage((prevMessages) => [
          ...prevMessages,
          {
            message: message.IncomingMessage,
            time: message.time,
            messageType: message.messageType,
          },
        ]);
      } else if (message.type == "disconnected") {
        setConnection(false);
      }
    };
    const userDisconnected = () => {
      ws.send(
        JSON.stringify({
          type: "disconnected",
          roomId: roomIdRef,
          socket: socket,
        })
      );
      ws.close();

      if (senderPc) {
        senderPc.close();
        setSenderPc(null);
      }

      if (recievingPc) {
        recievingPc.close();
        setRecievingPc(null);
      }
    };
    window.addEventListener("beforeunload", userDisconnected);
    return () => {
      window.removeEventListener("beforeunload", userDisconnected);
      userDisconnected();
    };
  }, [name]);

  console.log(localVideoTrack, localAudioTrack);

  useEffect(() => {
    if (localVideoref.current) {
      localVideoref.current.srcObject = new MediaStream();
      if (localVideoTrack && allowVideo)
        localVideoref.current.srcObject.addTrack(localVideoTrack);
      localVideoref.current.play();
    }
  }, [localVideoTrack, localAudioTrack, allowVideo, allowAudio]);

  return (
    <div className="w-full h-screen">
      <Videos
        socket={socket}
        localVideo={localVideoref}
        remoteVideo={remoteVideoref}
        roomId={roomIdRef.current}
      />
    </div>
  );
};

export default Room;

// Ice candidate will only exchange if we add tracks
