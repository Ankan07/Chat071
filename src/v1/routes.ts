import { Router } from "express";
import { ProductRoutes } from "./product/productRoutes";
import { Database } from "./database";
import { Db } from "mongodb";
import { OrderRoutes } from "./order/orderRoutes";
import { UserRoutes } from "./user/userRoutes";
import { update_fuzzy } from "../Utils/fuzzyset";
export class BaseRoutes {
  private router: Router;
  constructor() {
    this.setupRoutes();
    this.router = Router();
  }

  getRouter(): Router {
    return this.router;
  }
  async fetchfuzzy(db: Db) {
    const fuzzyset = await db.collection("keywords").find({}).toArray();
    const fuzzy_array = fuzzyset[0].keywords;
    const updated_array = await update_fuzzy(fuzzy_array);
  }
  async setupRoutes() {
    const db: Db = await new Database().connectToMongoDb();
    await this.fetchfuzzy(db);

    this.router
      .use("/product", new ProductRoutes(db).getRoutes())
      .use("/order", new OrderRoutes(db).getRoutes())
      .use("/user", new UserRoutes(db).getRoutes());
  }
}
