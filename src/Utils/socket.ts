import { Database } from "./../v1/database";
import { connect, Db } from "mongodb";

export const Socket = async (io: any) => {


    const db: Db = await new Database().connectToMongoDb();

    console.log("db is ", db);

    let statushash: any = {};
    io.on("connection", function (socket: any) {

        console.log("user connected", socket.id);

        socket.on('join', function (room: any) {
            socket.join(room);
        })

        socket.on("received", async (data: any) => {


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

        })
        socket.on("online_status", (data: any) => {
            console.log("dat", data);
            let hash: any = {}
            let id = data["id"];
            statushash[id] = "connected";

        })

        socket.on("disconnect_socket", (data: any) => {
            let hash: any = {}
            let id = data["id"];
            statushash[id] = "disconnected";
            console.log("emiiting disonline status", hash);

            socket.on("disconnect", () => {
                console.log("user disconnected", socket.id);
            })

        })

        setInterval(() => {
            io.to('room1').emit('status', statushash);
            console.log("emitting status ", statushash);
        }, 5000)

    });

}