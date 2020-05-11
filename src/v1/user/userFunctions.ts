import { Db, ObjectId } from "mongodb";
import { Request, Response } from "express";

export class UserFunctions {
COLLECTION = 'user';
  constructor(private db: Db) {}

  async getuser(req: Request, res: Response) {
    try {
      let queryBody = {};
      if (req.params.id) {
        try {
          queryBody = {
            _id: new ObjectId(req.params.id as string)
          }
        } catch(err) {
          res.status(400).send({message: 'invalid ObjectId provided'});
          return;
        }
      }

      const result = await this.db
        .collection(this.COLLECTION)
        .find(queryBody).toArray();

      res.send({ message: "success", data: result });
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }

  async createOrUpdateUser(req: Request, res: Response) {
    try {
      const post = req.body;
      let queryBody = {};
      if (post._id) {
        // _id available so its a old user and a Update request
        queryBody = {
          _id: new ObjectId(post._id)
        }
        delete post._id;
        const result = await this.db
        .collection(this.COLLECTION)
        .updateOne(
          queryBody,
          {
            $set: post
          }
        );
      } else {
        const result = await this.db
        .collection(this.COLLECTION)
        .insertOne(
          post
        )
      }

      res.send({ status: true, message: 'created/updated an user' });
    } catch (err) {
      res.status(500).send({
        message: "failure",
        error: err
      });
    }
  }
}
