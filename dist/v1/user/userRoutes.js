"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userFunctions_1 = require("./userFunctions");
const auth_1 = require("../../Auth/auth");
class UserRoutes {
    constructor(db) {
        this.db = db;
        this.functions = new userFunctions_1.UserFunctions(db);
    }
    getRoutes() {
        const auth = new auth_1.Auth().verifyToken;
        return (express_1.default
            .Router()
            .post("", (req, res) => {
            this.functions.createUser(req, res);
        })
            .get("", auth, (req, res) => {
            this.functions.getuser(req, res);
        })
            .put("", auth, (req, res) => {
            this.functions.updateUser(req, res);
        })
            .get("/:id", auth, (req, res) => {
            this.functions.getuser(req, res);
        })
            .get("/confirmation/:id", (req, res) => {
            this.functions.routeback(req, res);
        })
            .post("/confirmation/:id", (req, res) => {
            this.functions.routeback(req, res);
        })
            .post("/login", (req, res) => {
            this.functions.login(req, res);
        })
            .post("/forgotpassword", (req, res) => {
            this.functions.forgotpassword(req, res);
        })
            .post("/getchat", (req, res) => {
            this.functions.getchats(req, res);
        }));
    }
}
exports.UserRoutes = UserRoutes;
