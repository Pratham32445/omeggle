import { atom } from "recoil";

interface Message {
  message: string;
  time: Date;
  messageType : string;
}

export const IncomingMessages = atom<Message[]>({
  key: "IncomingMessages",
  default: [],
});
