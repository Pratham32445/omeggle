import { User } from "./UserManager";
import { v4 as uuid } from "uuid";
import { WebSocket } from "ws";

interface Room {
  user1: User;
  user2: User;
}

export class RoomManager {
  private rooms: Map<string, Room>;
  constructor() {
    this.rooms = new Map<string, Room>();
  }
  createRoom(user1: User, user2: User) {
    const roomId = uuid();
    this.rooms.set(roomId, { user1, user2 });
    console.log("romm created");
    user1.socket.send(
      JSON.stringify({
        type: "create-offer",
        roomId,
      })
    );
    user2.socket.send(
      JSON.stringify({
        type: "create-offer",
        roomId,
      })
    );
  }
  onOffer(socket: WebSocket, roomId: string, sdp: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const recievingUser =
      room.user1.socket == socket ? room.user2.socket : room.user1.socket;
    recievingUser.send(
      JSON.stringify({
        type: "offer",
        sdp,
        roomId
      })
    );
  }
  onAnswer(socket: WebSocket, roomId: string, sdp: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const recievingUser =
      room.user1.socket == socket ? room.user2.socket : room.user1.socket;
    recievingUser.send(
      JSON.stringify({
        type: "answer",
        sdp,
        roomId
      })
    );
  }
  onIceCandidate(socket: WebSocket, roomId: string, candidate: any,candidateType : string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const recievingUser =
      room.user1.socket == socket ? room.user2.socket : room.user1.socket;
    recievingUser.send(
      JSON.stringify({
        type: "ice-candidate",
        candidate,
        candidateType
      })
    );
  }
}
