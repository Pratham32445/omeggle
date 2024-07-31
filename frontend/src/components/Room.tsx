import React, { useEffect, useRef, useState } from "react";
import Videos from "./Videos";

const Room = ({
  name,
  localVideoTrack,
  localAudioTrack,
}: {
  name: string;
  localVideoTrack: MediaStreamTrack | null;
  localAudioTrack: MediaStreamTrack | null;
}) => {
  const [senderPc, setSenderPc] = useState<RTCPeerConnection | null>(null);
  const [recievingPc, setRecievingPc] = useState<RTCPeerConnection | null>(
    null
  );
  const [remoteVideoStream, setRemoteVideoStream] =
    useState<MediaStreamTrack | null>();
  const [remoteAudioStream, SetRemoteAudioStream] =
    useState<MediaStreamTrack | null>();

  const remoteVideoref = useRef<HTMLVideoElement>();
  const localVideoref = useRef<HTMLVideoElement>();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
      console.log("connected");
    };
    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.log(message);

      if (message.type == "create-offer") {
        const pc = new RTCPeerConnection();
        setSenderPc(pc);

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
      }
    };
  }, [name]);

  useEffect(() => {
    if (localVideoTrack && localVideoref.current) {
      localVideoref.current.srcObject = new MediaStream([localVideoTrack]);
      localVideoref.current.play();
    }
  }, [localVideoTrack, localAudioTrack]);

  return (
    <div>
      <Videos localVideo={localVideoref} remoteVideo={remoteVideoref} />
    </div>
  );
};

export default Room;

// Ice candidate will only exchange if we add tracks
