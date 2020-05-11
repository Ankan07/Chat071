import { Router } from "express";
import { ProductRoutes } from "./product/productRoutes";
import { Database } from "./database";
import { Db } from "mongodb";
import { OrderRoutes } from "./order/orderRoutes";
import { UserRoutes } from "./user/userRoutes";

export class BaseRoutes {
  private router: Router;
  constructor() {
    this.setupRoutes();
    this.router = Router();
  }

  getRouter(): Router {
    return this.router;
  }

  async setupRoutes() {
    const db: Db = await new Database().connectToMongoDb();
    this.router
      .use("/product", new ProductRoutes(db).getRoutes())
      .use("/order", new OrderRoutes(db).getRoutes())
      .use("/user", new UserRoutes(db).getRoutes());
  }
}
