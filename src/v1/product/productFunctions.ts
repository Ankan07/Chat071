import { Db, ObjectId } from "mongodb";
import { Request, Response } from "express";
import { update_fuzzy, fuzzy_array } from "../../Utils/fuzzyset";
import FuzzySet from "fuzzyset";
import fs from "fs";
import aws from "aws-sdk";
import { resolve } from "path";
import sharp from "sharp";
import { type } from "os";
export class ProductFunctions {
  COLLECTION = "product";
  constructor(private db: Db) {}

  async uploads3(params: any) {
    const s3 = new aws.S3({});
    return new Promise((resolve: any, reject: any) => {
      s3.upload(params, (err: any, data: any) => {
        if (err) reject("error");
        else {
          resolve(data.Location);
        }
      });
    });
  }
  async addproduct(req: Request, res: Response) {
    try {
      const post = req.body;
      const searchKey = post.name;

      post.searchKey = searchKey;
      const s3 = new aws.S3({});
      let thumb: any;
      aws.config.update({
        accessKeyId: "AKIAJRJB4MOKHBI6L4QQ",
        secretAccessKey: "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",
      });
      const images_array: any = [];
      const images = req.body.images;
      images.forEach((element: any) => {
        if (element.startsWith("https://")) images_array.push(element);
      });
      console.log("no of images is ", images.length);

      if (!fs.existsSync("data")) {
        fs.mkdirSync("data");
      }
      images.forEach((element: any) => {
        if (element.startsWith("https://") === false) {
          console.log("");
          let temp: string = "jpeg";
          if (element.charAt(0) === "/") {
            temp = "jpg";
          } else if (element.charAt(0) === "i") {
            temp = "png";
          }
          fs.writeFileSync(
            `data/image-${new Date().getTime()}-${Math.floor(
              100000 + Math.random() * 900000
            )}.${temp}`,
            element,
            {
              encoding: "base64",
            }
          );
        }
      });
      console.log("ba ba ");
      const files = fs.readdirSync("data");
      console.log("files is ", files);

      files.forEach((element: any) => {
        console.log("dhdh", element);
        const signedUrl = `https://crystoapp.s3.amazonaws.com/${element}`;
        images_array.push(signedUrl);
      });
      let thumb_element: any;
      files.forEach(async (element: any, i: any) => {
        if (i === 0) {
          thumb_element = element;
        }

        const params = {
          ACL: "public-read",
          Bucket: "crystoapp",
          Body: fs.createReadStream(`data/${element}`),
          Key: `${element}`,
        };

        const result = await this.uploads3(params);

        fs.unlinkSync(`data/${element}`);
      });
      if (post.images[0].startsWith("https://") === false) {
        await sharp(`data/${thumb_element}`)
          .resize(200, 200)
          .toFile(`${thumb_element}`);

        const params_thumb = {
          ACL: "public-read",
          Bucket: "crystoapp",
          Body: fs.createReadStream(`${thumb_element}`),
          Key: `thumb-${thumb_element}`,
        };
        let result: any;
        result = await this.uploads3(params_thumb);

        fs.unlinkSync(`${thumb_element}`);

        thumb = result;
        post.thumb = thumb;
      }
      post.images = images_array;
      let product: any;

      if (post._id) {
        console.log("post.images ", post.images);
        const id = post._id;
        delete post._id;

        product = await this.db
          .collection(this.COLLECTION)
          .updateOne({ _id: new ObjectId(id) }, { $set: post });
      } else {
        // updating fuzzy array

        let words = post.name.split(" ");
        console.log("name is ", post.name);
        words.forEach(async (element: any) => {
          await this.db
            .collection("keywords")
            .updateOne({ type: "fuzzy" }, { $push: { keywords: element } });
        });

        product = await this.db.collection(this.COLLECTION).insertOne(post);
      }

      res.send({ message: "success", data: product.ops });
    } catch (err) {
      console.log(err);

      res.status(500).send({ message: "failure", error: err });
    }
  }
  async addcarousel(req: Request, res: Response) {
    try {
      const s3 = new aws.S3({});
      const image = req.body.image;
      let images: string = "";
      const post = req.body;
      aws.config.update({
        accessKeyId: "AKIAJRJB4MOKHBI6L4QQ",
        secretAccessKey: "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",
      });
      if (!fs.existsSync("data")) {
        fs.mkdirSync("data");
      }
      let temp: string = "jpeg";
      if (image.charAt(0) === "/") {
        temp = "jpg";
      } else if (image.charAt(0) === "i") {
        temp = "png";
      }
      fs.writeFileSync(
        `data/image-${new Date().getTime()}-${Math.floor(
          100000 + Math.random() * 900000
        )}.${temp}`,
        image,
        {
          encoding: "base64",
        }
      );
      const files = fs.readdirSync("data");
      console.log("files is ", files);

      files.forEach((element: any) => {
        console.log("dhdh", element);
        const signedUrl = `https://crystoapp.s3.amazonaws.com/${element}`;
        images = signedUrl;
      });
      files.forEach(async (element: any, i: any) => {
        const params = {
          ACL: "public-read",
          Bucket: "crystoapp",
          Body: fs.createReadStream(`data/${element}`),
          Key: `${element}`,
        };

        const result = await this.uploads3(params);

        fs.unlinkSync(`data/${element}`);
      });
      post.image = images;
      const product = await this.db.collection("carousel").insertOne(post);

      res.send({ message: "success", data: product.ops });
    } catch (err) {
      console.log(err);

      res.status(500).send({ message: "failure", error: err });
    }
  }
  async getcarousel(req: Request, res: Response) {
    try {
      const result = await this.db.collection("carousel").find({}).toArray();

      res.send({
        message: "success",
        data: result,
      });
    } catch (err) {
      res.status(500).send({
        message: "failure",
        error: err,
      });
    }
  }
  async deletecarousel(req: Request, res: Response) {
    try {
      const result = await this.db
        .collection("carousel")
        .deleteOne({ _id: new ObjectId(req.params.id) });

      res.send({
        message: "success",
      });
    } catch (err) {
      res.status(500).send({
        message: "failure",
        error: err,
      });
    }
  }
  async addslots(req: Request, res: Response) {
    try {
      const post = req.body;
      const product = await this.db.collection("slots").insertOne(post);
      res.send({ message: "success", data: product.ops });
    } catch (err) {
      console.log(err);

      res.status(500).send({ message: "failure", error: err });
    }
  }
  async getslots(req: Request, res: Response) {
    try {
      const result = await this.db.collection("slots").find({}).toArray();
      res.send({
        message: "success",
        data: result,
      });
    } catch (err) {
      res.status(500).send({
        message: "failure",
        error: err,
      });
    }
  }

  async editSlots(req: Request, res: Response) {
    let id;
    try {
      try {
        id = new ObjectId(req.params.id);
      } catch (err) {
        res.status(400).send({ message: "Bad object id provided", error: err });
      }

      const body = req.body;
      delete body._id;
      const result = await this.db
        .collection("slots")
        .updateOne({ _id: id }, { $set: body });

      if (result.matchedCount) {
        res.send({ status: true });
      } else {
        res.send({ status: false, message: "unknown id provided" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "failure", error: err });
    }
  }
  async deleteslots(req: Request, res: Response) {
    try {
      const result = await this.db
        .collection("slots")
        .deleteOne({ _id: new ObjectId(req.params.id) });

      res.send({
        message: "success",
      });
    } catch (err) {
      res.status(500).send({
        message: "failure",
        error: err,
      });
    }
  }
  async listproduct(req: Request, res: Response) {
    try {
      const query = { type: req.params.type };
      // console.log("query", query);
      const result = await this.db
        .collection(this.COLLECTION)
        .find({ type: req.params.type })
        .toArray();

      res.send({ message: "success", data: result });

      // console.log();
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }

  async editproduct(req: Request, res: Response) {
    try {
      req.body.name = req.body.name.toUpperCase();
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
      const deletefromfeatured = await this.db
        .collection("featured")
        .deleteOne({ _id: new ObjectId(req.params.id) });

      res.send({ message: "success" });
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }

  async searchproduct(req: Request, res: Response) {
    try {
      console.log("in here ");
      let search: string = req.params.text;

      const user = res.locals.user;
      console.log("user ", JSON.stringify(res.locals));

      await this.db
        .collection("searchlogs")
        .insertOne({ text: req.params.text, user });
      let array: any;
      if (req.params.text.length >= 3) {
        array = await update_fuzzy([]);

        console.log("are bhai", array);

        const fuzzy_set = FuzzySet(array, true);
        const firstresult = fuzzy_set.get(req.params.text);
        if (firstresult !== null) search = firstresult[0][1].toString();
      }
      console.log("search is ", search);
      const post = req.body;
      let query: { searchKey?: any; type?: string } = {};
      query =
        req.params.text === "all"
          ? {}
          : {
              searchKey: {
                $regex: ` ${search}|^${search}`,
                $options: "$i",
              },
            };
      if (req.query.category) {
        query.type = req.query.category as string;
      }
      // console.log("query", query);
      const result = await this.db
        .collection(this.COLLECTION)
        .find(query)
        .toArray();

      res.send({ message: "success", data: result, array: array });

      // console.log();
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }

  async homepage(req: Request, res: Response) {
    try {
      const result = await this.db.collection("featured").find({}).toArray();
      res.send({ message: "success", data: result });
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }
  async addcategory(req: Request, res: Response) {
    try {
      req.body.name = req.body.name.toUpperCase();
      const resultcategory = await this.db
        .collection("categories")
        .find({ name: req.body.name })
        .toArray();
      console.log("result vat", resultcategory);
      if (resultcategory.length !== 0) {
        res.send({ message: "category already exist" });
      } else {
        const result = await this.db
          .collection("categories")
          .insertOne(req.body);
        res.send({ message: "success", data: result.ops });
      }
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }

  async deletecategory(req: Request, res: Response) {
    try {
      const resultcategory = await this.db
        .collection("categories")
        .find({ name: req.body.name });
      if (resultcategory) {
        const result = await this.db
          .collection("categories")
          .deleteOne({ name: req.body.name });
        res.send({ message: "success" });
      } else {
        res.send({ message: "category does not exist" });
      }
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }
  async getcategories(req: Request, res: Response) {
    try {
      const result = await this.db.collection("categories").find({}).toArray();
      // const categorynumber = await this.db.collection("products").aggregate([
      //   {
      //     $group: {
      //       _id: "$type",
      //       count: {
      //         $sum: 1,
      //       },
      //     },
      //   },
      // ]);
      res.send({ message: "success", data: result });
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }
  async updatecategories(req: Request, res: Response) {
    // three params
    // 1. oldname
    // 2. newname
    // 3. id
    try {
      const updatecategory = await this.db.collection("categories").updateOne(
        { _id: new ObjectId(req.params.id) },
        {
          $set: {
            name: req.body.newname,
            description: req.body.description,
            deliveryMessage: req.body.deliveryMessage,
          },
        }
      );
      const updatecategoryforallfeatureditems = await this.db
        .collection("featured")
        .updateMany(
          { type: req.body.oldname },
          { $set: { type: req.body.newname } }
        );
      const updatecategoryforallproducts = await this.db
        .collection(this.COLLECTION)
        .updateMany(
          { type: req.body.oldname },
          { $set: { type: req.body.newname } }
        );

      res.send({ message: "success" });
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }

  async getfeatureditemsforacategory(req: Request, res: Response) {
    try {
      const result = await this.db
        .collection("featured")
        .find({ type: req.params.type })
        .toArray();
      res.send({ message: "success", data: result });
    } catch (err) {
      res.status(500).send({ message: "failure", error: err });
    }
  }
  async updatefeatureditemsforcategory(req: Request, res: Response) {
    try {
      const delete_items = await this.db
        .collection("featured")
        .deleteMany({ type: req.params.type });

      req.body.items.forEach((element: any) => {
        element._id = new ObjectId(element._id);
      });

      const result = await this.db
        .collection("featured")
        .insertMany(req.body.items);
      res.send({ message: "success", data: result });
    } catch (err) {
      console.log("error is ", err);
    }
  }
  async deleteallproductsforcategory(req: Request, res: Response) {
    try {
      const result = await this.db
        .collection("featured")
        .deleteMany({ type: req.params.type });

      const result2 = await this.db
        .collection("product")
        .deleteMany({ type: req.params.type });

      res.send({ message: "success" });
    } catch (err) {
      res.send({ message: err });
    }
  }
}
