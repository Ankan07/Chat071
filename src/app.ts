import express from "express";
import { BaseRoutes } from "./v1/routes";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use("/v1", new BaseRoutes().getRouter());
app.get("/", (req, res) => {
  res.send("You dont know what you're doing, do you?");
});

app.listen(PORT, () => {
  console.log("running on port 4000");
});
