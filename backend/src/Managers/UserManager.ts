import { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";

export interface User {
  name: string;
  socket: WebSocket;
}

export class UserManager {
  private Users: User[];
  private Queue: WebSocket[];
  private roomManager: RoomManager;

  constructor() {
    this.Users = [];
    this.Queue = [];
    this.roomManager = new RoomManager();
  }

  addUser(name: string, socket: WebSocket) {
    this.Users.push({ name, socket });
    this.Queue.push(socket);
    this.clearQueue();
    this.initHandlers(socket);
  }

  clearQueue() {
    if (this.Queue.length < 2) return;
    while (this.Queue.length >= 2) {
      let socket1 = this.Queue.pop();
      let socket2 = this.Queue.pop();
      let firstUser = this.Users.find((user) => user.socket == socket1);
      let secondUser = this.Users.find((user) => user.socket == socket2);
      if (!firstUser || !secondUser) return;
      const room = this.roomManager.createRoom(firstUser, secondUser);
    }
  }

  initHandlers(socket: WebSocket) {
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data as unknown as string);
      if (message.type == "offer") {
        this.roomManager.onOffer(socket, message.roomId, message.sdp);
      } else if (message.type == "answer") {
        // console.log(message.sdp,"this is answer")
        this.roomManager.onAnswer(socket, message.roomId, message.sdp);
      } else if (message.type == "add-ice-candidate") {
        this.roomManager.onIceCandidate(
          socket,
          message.roomId,
          message.candidate,
          message.candidateType
        );
      }
    };
  }
}
