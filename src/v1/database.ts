import { MongoClient, Db } from "mongodb";

export class Database {
  private url: string = "mongodb+srv://ankan:p1ssw05d@cluster0.qp6co.mongodb.net/chats?retryWrites=true&w=majority";

  private client: MongoClient = new MongoClient(this.url);
  private dbname = "chat_app";
  constructor() {
    this.connectToMongoDb();
  }

  async connectToMongoDb(): Promise<Db> {
    try {
      if (!this.client || !this.client.isConnected()) {
        this.client = await MongoClient.connect(this.url, {
          useUnifiedTopology: true,
        });
      }
    } catch (err) {
      // console.log(err);
    }
    return this.client.db(this.dbname);
  }
}
