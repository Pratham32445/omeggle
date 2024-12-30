import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useRecoilState } from "recoil";
import { IncomingMessages } from "@/store/atoms/Message";
import { PaperPlaneIcon, FileIcon } from "@radix-ui/react-icons";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";

const Message = ({
  socket,
  roomId,
}: {
  socket: WebSocket | null;
  roomId: string;
}) => {
  const [text, setText] = useState("");

  const [message, setMessage] = useRecoilState(IncomingMessages);

  const messageRef = useRef<HTMLVideoElement>(null);

  const sendMessage = (e: any) => {
    e.preventDefault();
    if (text.length == 0) return;
    socket?.send(
      JSON.stringify({
        type: "send-message",
        roomId: roomId,
        message: text,
        time: new Date(),
      })
    );
    setMessage((prev) => [
      ...prev,
      {
        message: text,
        time: new Date(),
        messageType: "me",
      },
    ]);
    setText("");
  };

  const handleFileChange = async (e: any) => {
    e.preventDefault();
    const file: File = e.target.files[0];
    console.log(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (socket && socket.readyState == WebSocket.OPEN) {
        console.log(reader.result);
        socket.send(
          JSON.stringify({
            type: "file",
            fileName: file.name,
            // @ts-ignore
            fileData: new Uint8Array(reader.result),
          })
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollTop = messageRef.current?.scrollHeight;
    }
  }, [message]);

  return (
    <div className="relative w-full h-full overflow-auto flex flex-col">
      <div className="p-5">
        <p className="font-Montserrat text-2xl font-bold">Messages</p>
      </div>
      {/*  @ts-ignore */}
      <div ref={messageRef} className="p-5 h-4/6 overflow-y-auto">
        {message.map(({ message, messageType }) => (
          <div
            className={`${
              messageType == "me"
                ? "bg-[#202124] float-right"
                : "bg-blue-800 float-left"
            } clear-both p-2 my-5 rounded-md`}
          >
            <p>{message}</p>
            {messageType == "me" && (
              <p className="text-xs item text-end">
                {messageType == "me" && "me"}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-5 p-3">
        <div className="w-5/6 p-2 flex gap-2 border-2 border-white rounded-md">
          <div>
            <Label htmlFor="File">
              <FileIcon />
            </Label>
            <Input
              id="File"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <Textarea
            onChange={(e) => setText(e.target.value)}
            style={{ boxShadow: "none", outline: "none" }}
            placeholder="Message..."
            className="font-Montserrat border-none outline-none focus:outline-none focus:ring-0"
            value={text}
            onKeyDown={(e) => {
              if (e.key == "Enter" && e.shiftKey == false) {
                sendMessage(e);
              }
            }}
          />
        </div>
        <Button onClick={sendMessage}>
          <PaperPlaneIcon />
        </Button>
      </div>
    </div>
  );
};
export default Message;
