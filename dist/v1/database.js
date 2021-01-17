"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class Database {
    constructor() {
        this.url = "mongodb+srv://ankan:p1ssw05d@cluster0.qp6co.mongodb.net/chats?retryWrites=true&w=majority";
        this.client = new mongodb_1.MongoClient(this.url);
        this.dbname = "chat_app";
        this.connectToMongoDb();
    }
    async connectToMongoDb() {
        try {
            if (!this.client || !this.client.isConnected()) {
                this.client = await mongodb_1.MongoClient.connect(this.url, {
                    useUnifiedTopology: true,
                });
            }
        }
        catch (err) {
        }
        return this.client.db(this.dbname);
    }
}
exports.Database = Database;
