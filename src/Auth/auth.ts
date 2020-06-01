import jwt from "jsonwebtoken";
import { Request, Response } from "express";

export class Auth {
  constructor() {}

 async verifyToken(req: Request, res: Response, next: any) {
    try {
      const bearerHeader = req.headers.authorization;

      if (typeof bearerHeader !== "undefined") {
        const bearer = bearerHeader.split(" ");

        const bearerToken = bearer[1];

        const decoded = jwt.verify(bearerToken, "my-secret");

        next();
      } else {
        res.status(403).send({"message":"forbidden"});

      }
    } catch (err) {
      res.status(403).send({"message":"forbidden"});

    }
  }
}
