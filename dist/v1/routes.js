"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("./database");
const userRoutes_1 = require("./user/userRoutes");
class BaseRoutes {
    constructor() {
        this.setupRoutes();
        this.router = express_1.Router();
    }
    getRouter() {
        return this.router;
    }
    async setupRoutes() {
        const db = await new database_1.Database().connectToMongoDb();
        this.router
            .use("/user", new userRoutes_1.UserRoutes(db).getRoutes());
    }
}
exports.BaseRoutes = BaseRoutes;
