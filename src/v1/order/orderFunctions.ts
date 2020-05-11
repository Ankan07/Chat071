import { Db, ObjectId } from "mongodb";
import { Request, Response } from "express";

export class OrderFunctions {
COLLECTION = 'order';
  constructor(private db: Db) {}

  async getOrderByCriteria(req: Request, res: Response) {
    try {
      let query: any = {};
      let data = [];
      if (req.query.where && req.query.is) {
        const where: string = req.query.where as string;
        let is: string | ObjectId = req.query.is as string;
        if (where === '_id') {
          is = new ObjectId(is);
        }

        query = {
          [where]: is
        };

        if (req.query.start && req.query.end) {
          query.orderDate = {
            '$gte': req.query.start,
            '$lte': req.query.end
          }
        }
        data = await this.db
        .collection(this.COLLECTION)
        .find(query)
        .toArray();

        res.send({ message: "success", data });
      } else {
        res.status(400).send({message: 'No items are returned, since no valid criteria was provided'});
      }
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }

  async insertOrUpdateOrder(req: Request, res: Response) {
    try {
      const post = req.body;
      if (post._id) {
        // _id provided, its a update request
        let oid: ObjectId;
        try {
          oid = new ObjectId(post._id);
        } catch (err) {
          res.status(400).send({message: 'Invalid ObjectId provided'});
          return;
        }

        const result = await this.db
        .collection(this.COLLECTION)
        .updateOne({ _id: oid }, { $set: post });

        res.send({ message: "successfully updated an order", status: true });
      } else {
        // create a new order
        const result = await this.db
        .collection(this.COLLECTION)
        .insertOne(post)

        res.send({message: 'Successfully created an order', status: true});
      }
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }

  async getorderbyid(req: Request, res: Response) {
    try {
      let query = {};
      try {
        query = {_id: new ObjectId(req.params.id)};
      } catch (err) {
        res.status(400).send({message: 'Invalid objectId detected'});
        return;
      }
      const result = await this.db
        .collection(this.COLLECTION)
        .findOne({ _id: new ObjectId(req.params.id) });

      res.send({ message: "success", data: result });
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }
}
