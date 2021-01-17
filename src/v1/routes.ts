import { Router } from "express";

import { Database } from "./database";
import { Db } from "mongodb";

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
      .use("/user", new UserRoutes(db).getRoutes());
  }
}
