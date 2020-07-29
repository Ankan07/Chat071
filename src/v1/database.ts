import { MongoClient, Db } from "mongodb";

export class Database {
  private url: string =
    "mongodb://ec2-15-207-42-59.ap-south-1.compute.amazonaws.com:20202/?readPreference=primary&appname=MongoDB%20Compass&ssl=false";
  //"mongodb://localhost:20202/";
  // "mongodb://breakingbugs:bb%40covid19@ec2-52-66-245-195.ap-south-1.compute.amazonaws.com:20202/admin?authSource=admin&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=false";
  // "mongodb://krishnabose02:adminKrishna123@ec2-52-66-245-195.ap-south-1.compute.amazonaws.com:20202/admin?authSource=admin&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=false";
  private client: MongoClient = new MongoClient(this.url);
  private dbname = "essentials_dev";
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
