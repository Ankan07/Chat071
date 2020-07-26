import { Db, ObjectId } from "mongodb";
import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import axios from "axios";
export class OrderFunctions {
  COLLECTION = "order";
  constructor(private db: Db) {}

  async getOrderByCriteria(req: Request, res: Response) {
    try {
      let query: any = {};
      let data = [];
      if (req.query.where && req.query.is) {
        const where: string = req.query.where as string;
        let is: string | ObjectId | Number = req.query.is as string;
        if (where === "_id") {
          is = new ObjectId(is);
        }
        if (where === "invoice_number" || where === "uniqueId") {
          is = Number(is);
        }

        query = {
          [where]: is,
        };

        if (req.query.start && req.query.end) {
          query.orderDate = {
            $gte: req.query.start,
            $lte: req.query.end,
          };
        }
        data = await this.db
          .collection(this.COLLECTION)
          .find(query)
          .sort({ orderDate: -1 })
          .toArray();

        res.send({ message: "success", data });
      } else {
        res.status(400).send({
          message:
            "No items are returned, since no valid criteria was provided",
        });
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
          res.status(400).send({ message: "Invalid ObjectId provided" });
          return;
        }
        delete post._id;
        const result = await this.db
          .collection(this.COLLECTION)
          .updateOne({ _id: oid }, { $set: post });

        res.send({ message: "successfully updated an order", status: true });
      } else {
        // create a new order

        const array = post.cartItems;
        let sum: any = 0;
        array.forEach((element: any) => {
          sum +=
            Number(element.quantity) * Number(element.variant.discountedPrice);
        });

        const deliverycharge = await this.db
          .collection("deliverycharge")
          .find({})
          .toArray();
        const deliverychargevalue = deliverycharge[0].deliverycharge;
        sum += Number(deliverychargevalue);
        post.totalPrice = sum;
        post.uniqueId = Math.floor(Math.random() * 10000) + 10000;
        const invoice = await this.db
          .collection("meta")
          .findOne({ type: "invoice" });
        let invoice_number = invoice["count"] + 1;
        await this.db
          .collection("meta")
          .updateOne({ type: "invoice" }, { $set: { count: invoice_number } });
        post.invoice_number = invoice_number;
        const result = await this.db
          .collection(this.COLLECTION)
          .insertOne(post);

        res.send({
          message: "Successfully created an order",
          status: true,
          data: result["ops"][0],
        });
      }
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }

  async getorderbyid(req: Request, res: Response) {
    try {
      let query = {};
      try {
        query = { _id: new ObjectId(req.params.id) };
      } catch (err) {
        res.status(400).send({ message: "Invalid objectId detected" });
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
  async createorderrazorpay(req: Request, res: Response) {
    const razorpay = new Razorpay({
      key_id: "rzp_test_eocEawhmisMu23",
      key_secret: "XrScEMqT58hMuZ7peluZ2UtS",
    });

    const payment_capture = 1;
    const amount = Number(req.body.amount);
    const currency = "INR";

    const options = {
      amount: amount,
      currency,
      receipt: "random",
    };
    console.log("in heer");

    try {
      const response = await razorpay.orders.create(options);
      console.log("response is ", response);
      res.json({
        id: response.id,
        currency: response.currency,
        amount: response.amount,
      });
    } catch (error) {
      res.send({
        message: "error",
      });
      console.log(error);
    }
  }
  async verifyorderrazorpay(req: Request, res: Response) {
    try {
      // do a validation
      const secret = "12345678";

      console.log(req.body);

      const shasum = crypto.createHmac("sha256", secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest("hex");

      console.log(digest, req.headers["x-razorpay-signature"]);

      if (digest === req.headers["x-razorpay-signature"]) {
        console.log("request is legit");
        // process it
      } else {
        console.log("not valid");
      }
      res.json({ status: "ok" });
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async capturepayment(req: Request, res: Response) {
    try {
      let payment_id = req.params.payment_id;
      const order = await this.db
        .collection("order")
        .findOne({ _id: new ObjectId(req.body.order_id) });
      const amount = Number(order.totalPrice) * 100;

      const capture_payment = await axios.post(
        `https://rzp_test_eocEawhmisMu23:XrScEMqT58hMuZ7peluZ2UtS@api.razorpay.com/v1/payments/${payment_id}/capture`,
        {
          amount: amount,
          currency: "INR",
        }
      );
      console.log("result is ", capture_payment.data);
      const insert_into_payments = await this.db
        .collection("payments")
        .insertOne(capture_payment.data);
      if (capture_payment.data.captured) {
        const update_order = await this.db.collection("order").updateOne(
          { _id: new ObjectId(req.body.order_id) },
          {
            $set: {
              paymentId: insert_into_payments.ops[0]._id,
              orderPaymentStatus: "complete",
            },
          }
        );
      } else {
        const delete_order = await this.db
          .collection("order")
          .deleteOne({ _id: new ObjectId(req.body.order_id) });
      }

      res.send({ captured: capture_payment.data.captured });
    } catch (err) {
      console.log("err is ", err);
      res.status(500).send({
        message: "payment failure",
        error: JSON.stringify(err),
        status: false,
      });
    }
  }
  async deleteorderbyid(req: Request, res: Response) {
    try {
      const delete_order = await this.db
        .collection("order")
        .deleteOne({ _id: new ObjectId(req.params.id) });
      res.send({ message: "deleted" });
    } catch (err) {
      res.status(500).send({ message: "error", error: err });
    }
  }
  async setdeliverycharge(req: Request, res: Response) {
    try {
      const count = await this.db
        .collection("deliverycharge")
        .find({})
        .toArray();

      if (count.length == 0) {
        await this.db
          .collection("deliverycharge")
          .insertOne({ deliverycharge: Number(req.params.id) });
      } else {
        const id = count[0]._id;
        await this.db
          .collection("deliverycharge")
          .updateOne(
            { _id: new ObjectId(id) },
            { $set: { deliverycharge: Number(req.params.id) } }
          );
      }

      res.send({
        message: "updated",
      });
    } catch (err) {
      res.status(500).send({
        message: "failure",
        error: err,
      });
    }
  }
  async getdeliverycharge(req: Request, res: Response) {
    try {
      const count = await this.db
        .collection("deliverycharge")
        .find({})
        .toArray();

      res.send({
        deliverycharge: count[0].deliverycharge,
      });
    } catch (err) {
      res.status(500).send({
        message: "failure",
        error: err,
      });
    }
  }
}
