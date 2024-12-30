import { atom } from "recoil";

export const isConnected = atom<boolean>({
  key: "isConnected",
  default: false,
});
