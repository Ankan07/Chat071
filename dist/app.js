"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = require("./v1/routes");
const cors_1 = __importDefault(require("cors"));
const socket_1 = require("./Utils/socket");
const app = express_1.default();
app.use(cors_1.default());
let server = require("http").Server(app);
let io = require("socket.io")(server, {
    cors: {
        origin: "http://product-catalog-11.s3-website.ap-south-1.amazonaws.com",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});
socket_1.Socket(io);
app.use(express_1.default.json({ limit: "50mb" }));
const PORT = process.env.PORT || 4000;
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("public"));
app.use(express_1.default.json());
app.use("/v1", new routes_1.BaseRoutes().getRouter());
app.get("/", (req, res) => {
    res.send("Ich Bin Du, but is this how the game is played?");
});
server.listen(PORT, () => {
    console.log("running on port 4000");
});
