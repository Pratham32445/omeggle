import {WebSocketServer} from "ws";
import { UserManager } from "./Managers/UserManager";

const wss = new WebSocketServer({port : 8080})

const userManager = new UserManager();

wss.on("connection",(ws) => {
    console.log("connection")
    userManager.addUser("pratham",ws);
})