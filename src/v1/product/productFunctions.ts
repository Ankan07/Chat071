import { Db, ObjectId } from "mongodb";
import { Request, Response } from "express";

export class ProductFunctions {
  COLLECTION = "product";
  constructor(private db: Db) {}

  async addproduct(req: Request, res: Response) {
    try {
      const post = req.body;
      const searchKey = post.name;
      post.searchKey = searchKey;

      const result = await this.db.collection(this.COLLECTION).insertOne(post);

      res.send({ message: "success" });
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }

  async listproduct(req: Request, res: Response) {
    try {
      const query = { type: req.params.type };
      console.log("query", query);
      const result = await this.db
        .collection(this.COLLECTION)
        .find(query)
        .toArray();

      res.send({ message: "success", data: result });

      console.log();
    } catch (err) {
      console.log("error is ", err);
      res.status(500).send({ message: "failure", error: err });
    }
  }

  async editproduct(req: Request, res: Response) {
    try {
      const post = req.body;

      const result = await this.db
        .collection(this.COLLECTION)
        .updateOne({ _id: new ObjectId(req.params.id) }, { $set: post });

      res.send({ message: "success" });
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }

  async deleteproduct(req: Request, res: Response) {
    try {
      const result = await this.db
        .collection(this.COLLECTION)
        .deleteOne({ _id: new ObjectId(req.params.id) });

      res.send({ message: "success" });
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }

  async searchproduct(req: Request, res: Response) {
    try {
      const post = req.body;
      const query =
        req.params.text === "all"
          ? {}
          : {
              searchKey: {
                $regex: ` ${req.params.text}|^${req.params.text}`,
                $options: "$i",
              },
            };
      console.log("query", query);
      const result = await this.db
        .collection(this.COLLECTION)
        .find(query)
        .toArray();

      res.send({ message: "success", data: result });

      console.log();
    } catch (err) {
      console.log("error is ", err);
      res.status(500).send({ message: "failure", error: err });
    }
  }
}
