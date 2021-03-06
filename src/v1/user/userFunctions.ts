import { connect, Db, ObjectId } from "mongodb";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { mail } from "../../Utils/mail";
import bcrypt from "bcrypt";
import path from "path";
import Axios from "axios";
import { timeStamp } from "console";
export class UserFunctions {
  COLLECTION = "user";
  constructor(private db: Db) { }

  // error codes:
  // 0: Successfully logged in
  // 1: Invalid Credentials
  // 2: Please verify your email
  // 3: User Not Found
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
      else {
        queryBody = {
          emailConfirmed: true,
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
  async routeback(req: Request, res: Response) {
    try {
      let decode = jwt.verify(req.params.id, "awesome-learning");
      decode = decode.toString().substring(1, decode.toString().length - 1);
      if (req.query.type === "emailverification") {
        const update = await this.db
          .collection(this.COLLECTION)
          .updateOne(
            { _id: new ObjectId(decode) },
            { $set: { emailConfirmed: true } }
          );
        res.sendFile(
          path.join(
            __dirname,
            "../../../public/html",
            "email_verification_successful.html"
          )
        );
      } else if (req.query.type === "forgotpassword") {
        if (req.method === "GET") {
          res.sendFile(
            path.join(__dirname, "../../../public/html", "reset-password.html")
          );
        } else if (req.method === "POST") {
          const update = await this.db
            .collection(this.COLLECTION)
            .updateOne(
              { _id: new ObjectId(decode) },
              { $set: { password: bcrypt.hashSync(req.body.password, 5) } }
            );
          res.sendFile(
            path.join(
              __dirname,
              "../../../public/html",
              "password-reset-successful.html"
            )
          );
        }
      }
    } catch (error) {
      // console.log("error is ", error);
      res.send({ status: false });
    }
  }
  async login(req: Request, res: Response) {
    try {
      const post = req.body;
      if (!post.password) {
        post.password = "";
      }

      const update = await this.db
        .collection(this.COLLECTION)
        .findOne({ $and: [{ email: post.email }, { emailConfirmed: true }] });
      if (update) {
        // console.log("password is ", post.password);
        let verifypassword: boolean;
        if (post.signInMethod === "email") {
          verifypassword = bcrypt.compareSync(post.password, update.password);
        } else if (post.signInMethod === "google") {
          verifypassword = true;
        } else {
          verifypassword = false;
        }

        if (verifypassword === true) {
          delete update.password;
          const token = jwt.sign(update, "my-secret");

          res.send({
            status: true,
            message: "Successfully logged in",
            token,
            data: update,
            errorCode: 0,
          });
        } else {
          if (update.signInMethod === "google") {
            res.send({
              status: false,
              message: "You have already signed up using Google",
            });
          } else {
            res.send({
              status: false,
              message: "Invalid Credentials",
              errorCode: 1,
            });
          }
        }
      } else {
        const result = await this.db
          .collection(this.COLLECTION)
          .findOne({ $and: [{ email: post.email }] });
        if (result) {
          if (result.emailConfirmed === false) {
            res.send({
              status: false,
              message: "Please verify your email!",
              errorCode: 2,
            });
          }
        } else {
          res.send({
            status: false,
            message: "User Not Found",
            errorCode: 3,
          });
        }
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
        if (update.signInMethod === "google") {
          res.send({
            status: true,
            message: "You have Google signed into this email!",
          });
        } else if (update.signInMethod === "email") {
          await mail(update.email, "forgot password", update._id);
          res.send({
            status: true,
            message: "Please check your email for password recovery link.",
          });
        }
      } else {
        res.send({
          status: false,
          message: "User Not Found",
          errorCode: 3,
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
          res.send({ status: false, message: "Invalid _id provided" });
        }
      } else {
        res.status(400).send({ status: false, message: "No _id provided" });
      }
    } catch (err) {
      res
        .status(500)
        .send({ status: false, message: "error occured", error: err });
    }
  }
  async getchats(req: Request, res: Response) {
    try {
      const post = req.body;
      const id1 = post.id1;
      const id2 = post.id2;
      const to = post.to;
      const from = post.from;

      let queryBody = {};



      const result = await this.db
        .collection("chats")
        .find({}).sort({ "timestamp": 1 }).toArray();

      res.send({ status: true, data: result });


    } catch (err) {
      res
        .status(500)
        .send({ status: false, message: "error occured", error: err });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const post = req.body;
      // console.log("email is ", post.email);
      // signInMethod --> in req.body email/google

      const finduser = await this.db
        .collection(this.COLLECTION)
        .findOne({ email: post.email });

      if (finduser) {
        // console.log("in here");
        // user exist
        if (finduser.emailConfirmed === true) {
          // console.log("user already");
          if (finduser.signInMethod === "google")
            res.send({
              status: false,
              message: "You have already signed up using Google",
            });
          else if (finduser.signInMethod === "email")
            res.send({
              status: false,
              message: "You have already signed up using this email",
            });
        } else {
          res.send({ status: true, message: "Please confirm email" });
        }
      } else {
        let token;
        // user doesnot exist

        post.emailConfirmed = false;
        if (req.body.signInMethod === "email") {
          post.password = bcrypt.hashSync(post.password, 5);
        }
        if (req.body.signInMethod === "google") {
          post.emailConfirmed = true;
        }
        const result = await this.db
          .collection(this.COLLECTION)
          .insertOne(post);
        if (req.body.signInMethod === "email") {
          const mailstatus = await mail(
            post.email,
            "registration",
            result.ops[0]._id
          );
        }
        const temp = result.ops[0];
        delete temp.password;
        let message;
        if (req.body.signInMethod === "email")
          message = "An email has been sent!. Please Confirm to continue";
        else if (req.body.signInMethod === "google") {
          message = "Created an User ";
          token = jwt.sign(result.ops[0], "my-secret");
        }

        res.send({
          status: true,
          message,
          token,
          data: temp,
        });
      }
    } catch (err) {
      res.status(500).send({
        status: false,
        message: "some error occured",
        error: err,
      });
    }
  }


}
