import { Db, ObjectId } from "mongodb";
import { Request, Response } from "express";
 
export class ProductFunctions {
COLLECTION = 'product';
  constructor(private db: Db) {}

  async addproduct(req: Request, res: Response) {
    try {
      const post = req.body;
      const searchKey = post.name;
      post.searchKey = searchKey;

      const result = await this.db.collection(this.COLLECTION).insertOne(post);
      this.db.collection(this.COLLECTION).createIndex({ searchKey: "text" });
      res.send({ message: "success" });
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }

  async listproduct(req: Request, res: Response) {
    try {
      const post = req.body;

      const result = await this.db
        .collection(this.COLLECTION)
        .find({ type: req.params.type });

      res.send({ message: "success", data: result });
    } catch (err) {
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
      let result;
      if (req.params) {
        result = await this.db
          .collection(this.COLLECTION)
          .find({ $text: { $search: req.params.text } });
      }

      res.send({ message: "success", data: result });
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }
}
