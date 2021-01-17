import { Database } from "./../v1/database";
import { connect, Db } from "mongodb";

export const Socket = async (io: any) => {


    const db: Db = await new Database().connectToMongoDb();



    let statushash: any = {};
    let typinghash: any = {};
    io.on("connection", function (socket: any) {

        socket.on('join', function (room: any) {
            socket.join(room);
        })

        socket.on('typing_receive', function (data: any) {

            let to = data["to"];
            let from = data["from"];
            let fromcandidatelist = typinghash[from];
            if (fromcandidatelist) {
                fromcandidatelist[to] = "typing";
                typinghash[from] = fromcandidatelist;
            }
            else {
                let temphash: any = {};
                temphash[to] = "typing";
                typinghash[from] = temphash;
            }

        })

        socket.on("received", async (data: any) => {


            try {

                if (statushash[data["to"]] == "connected") {
                    data["status"] = "delivered";
                }


                const result: any = await db
                    .collection("chats")
                    .insertOne(data);

                io.to('room1').emit('message', data);
            }
            catch (error) {

            }

        })
        socket.on("online_status", async (data: any) => {

            try {
                console.log("dat", data);
                let hash: any = {}
                let id = data["id"];
                statushash[id] = "connected";
                let queryBody = { to: id }

                const result2 = await db
                    .collection("chats")
                    .updateMany(queryBody, { $set: { "status": "delivered" } });
            }
            catch (error) {

            }

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
            io.to('room1').emit('typing_message', typinghash);
            // console.log("emitting status ", statushash);
        }, 3000)

        // setInterval(() => {
        //     typinghash = {};
        // }, 5000)

    });

}