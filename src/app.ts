import express from "express";
import { BaseRoutes } from "./v1/routes";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
app.use("/v1", new BaseRoutes().getRouter());
app.get("/", (req, res) => {
  res.send("You dont know what you're doing, do you? yo yo yo honey singh ");
});

app.listen(PORT, () => {
  console.log("running on port 4000");
});
