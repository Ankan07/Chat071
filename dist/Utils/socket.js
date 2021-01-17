"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./../v1/database");
exports.Socket = async (io) => {
    const db = await new database_1.Database().connectToMongoDb();
    let statushash = {};
    let typinghash = {};
    io.on("connection", function (socket) {
        socket.on('join', function (room) {
            socket.join(room);
        });
        socket.on('typing_receive', function (data) {
            let to = data["to"];
            let from = data["from"];
            let fromcandidatelist = typinghash[from];
            if (fromcandidatelist) {
                fromcandidatelist[to] = "typing";
                typinghash[from] = fromcandidatelist;
            }
            else {
                let temphash = {};
                temphash[to] = "typing";
                typinghash[from] = temphash;
            }
        });
        socket.on("received", async (data) => {
            try {
                if (statushash[data["to"]] == "connected") {
                    data["status"] = "delivered";
                }
                const result = await db
                    .collection("chats")
                    .insertOne(data);
                io.to('room1').emit('message', data);
            }
            catch (error) {
            }
        });
        socket.on("online_status", async (data) => {
            try {
                console.log("dat", data);
                let hash = {};
                let id = data["id"];
                statushash[id] = "connected";
                let queryBody = { to: id };
                const result2 = await db
                    .collection("chats")
                    .updateMany(queryBody, { $set: { "status": "delivered" } });
            }
            catch (error) {
            }
        });
        socket.on("disconnect_socket", (data) => {
            let hash = {};
            let id = data["id"];
            statushash[id] = "disconnected";
            console.log("emiiting disonline status", hash);
            socket.on("disconnect", () => {
                console.log("user disconnected", socket.id);
            });
        });
        setInterval(() => {
            io.to('room1').emit('status', statushash);
            io.to('room1').emit('typing_message', typinghash);
        }, 1000);
        setInterval(() => {
            typinghash = {};
        }, 5000);
    });
};
