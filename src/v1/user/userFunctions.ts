import { Db, ObjectId } from "mongodb";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { mail } from "../../Utils/mail";
import bcrypt from "bcrypt";
export class UserFunctions {
  COLLECTION = "user";
  constructor(private db: Db) {}

  async getuser(req: Request, res: Response) {
    try {
      let queryBody = {};
      if (req.params.id) {
        try {
          queryBody = {
            _id: new ObjectId(req.params.id as string),
          };
        } catch (err) {
          res.status(400).send({ message: "invalid ObjectId provided" });
          return;
        }
      }

      const result = await this.db
        .collection(this.COLLECTION)
        .find(queryBody)
        .toArray();

      res.send({ message: "success", data: result });
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }
  async routeback(req: Request, res: Response) {
    try {
      let decode = jwt.verify(req.params.id, "awesome-learning");
      decode = decode.toString().substring(1, decode.toString().length - 1);

      const update = await this.db
        .collection(this.COLLECTION)
        .updateOne(
          { _id: new ObjectId(decode) },
          { $set: { emailConfirmed: true } }
        );
      res.send({ status: true });
    } catch (error) {
      // console.log("error is ", error);
      res.send({ status: false });
    }
  }
  async login(req: Request, res: Response) {
    try {
      const post = req.body;

      const update = await this.db
        .collection(this.COLLECTION)
        .findOne({ $and: [{ email: post.email }, { emailConfirmed: true }] });
      if (update) {
        // console.log("password is ", post.password);
        const verifypassword = bcrypt.compareSync(
          post.password,
          update.password
        );
        if (verifypassword === true) {
          const token = jwt.sign(update, "my-secret");

          res.send({
            status: true,
            message: "Successfully logged in",
            token,
            data: update,
          });
        } else {
          res.send({
            status: false,
            message: "Invalid Credentials",
          });
        }
      } else {
        res.send({
          status: false,
          message: "User Not Found",
        });
      }
    } catch (error) {
      // console.log("error is ", error);
      res.status(500).send({
        message: "failure",
        error: JSON.stringify(error),
      });
    }
  }
async forgotpassword(req: Request, res: Response) {
    try {
      const post = req.body;

      const update = await this.db
        .collection(this.COLLECTION)
        .findOne({ $and: [{ email: post.email }, { emailConfirmed: true }] });
      if (update) {

       await mail(update.email,'forgot password', update._id)

       res.send({
        status: true,
        message: "Please check your email for password recovery link.",
      });
      } else {
        res.send({
          status: false,
          message: "User Not Found",
        });
      }
    } catch (error) {
      // console.log("error is ", error);
      res.status(500).send({
        message: "failure",
        error: JSON.stringify(error),
      });
    }
  }
async updateUser(req: Request, res: Response) {
  try {
    const post = req.body;
    let queryBody = {};
    if (post._id) {
      queryBody = {
        _id: new ObjectId(post._id),
      };
      delete post._id;
      const result = await this.db
        .collection(this.COLLECTION)
        .updateOne(queryBody, {
          $set: post,
        });
      if (result.modifiedCount === 1) {
        res.send({ status: true, message: "updated an user" });
      } else {
        res.send({status: false, message: 'Invalid _id provided'});
      }
    } else {
      res.status(400).send({status: false, message: 'No _id provided'});
    }
  } catch (err) {
    res.status(500).send({status: false, message: 'error occured', error: err});
  }
}

async createUser(req: Request, res: Response) {
  try {
    const post = req.body;
    // console.log("email is ", post.email);
    const finduser = await this.db
      .collection(this.COLLECTION)
      .findOne({ email: post.email });

    if (finduser) {
      // console.log("in here");
      // user exist
      if (finduser.emailConfirmed === true) {
        // console.log("user already");
        res.send({ status: true, message: "user already exist" });
      } else {
        res.send({ status: true, message: "Please confirm email" });
      }
    } else {
      // user doesnot exist

      post.emailConfirmed = false;
      post.password = bcrypt.hashSync(post.password, 15);
      const result = await this.db
        .collection(this.COLLECTION)
        .insertOne(post);

      const mailstatus = await mail(
        post.email,
        "registration",
        result.ops[0]._id
      );

      const token = jwt.sign(result.ops[0], "my-secret");

      res.send({
        status: true,
        message: "created an user",
        token,
        data: result.ops[0],
      });
    }
  } catch (err) {
    res.status(500).send({
      status: false,
      message: 'some error occured',
      error: err
    });
  }
}

// deprecated function
// Use createUser() or updateUser() respectively
async createOrUpdateUser(req: Request, res: Response) {
    try {
      const post = req.body;
      let queryBody = {};
      if (post._id) {
        // _id available so its a old user and a Update request
        queryBody = {
          _id: new ObjectId(post._id),
        };
        delete post._id;
        const result = await this.db
          .collection(this.COLLECTION)
          .updateOne(queryBody, {
            $set: post,
          });

        res.send({ status: true, message: "updated an user" });
      } else {
        // console.log("email is ", post.email);
        const finduser = await this.db
          .collection(this.COLLECTION)
          .findOne({ email: post.email });

        if (finduser) {
          // console.log("in here");
          // user exist
          if (finduser.emailConfirmed === true) {
            // console.log("user already");
            res.send({ status: true, message: "user already exist" });
          } else {
            res.send({ status: true, message: "Please confirm email" });
          }
        } else {
          // user doesnot exist

          post.emailConfirmed = false;
          post.password = bcrypt.hashSync(post.password, 15);
          const result = await this.db
            .collection(this.COLLECTION)
            .insertOne(post);

          const mailstatus = await mail(
            post.email,
            "registration",
            result.ops[0]._id
          );

          const token = jwt.sign(result.ops[0], "my-secret");

          res.send({
            status: true,
            message: "created an user",
            token,
            data: result.ops[0],
          });
        }
      }
    } catch (error) {
      res.status(500).send({
        message: "failure",
        error: JSON.stringify(error),
      });
    }
  }
}
