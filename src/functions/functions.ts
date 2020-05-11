import { ObjectId } from "mongodb";

export const requiredparams = async (params: any, required: any) => {
  let result = false;
  let x;
  let y;
  for (x of required) {
    for (y of params) {
      if (x === y) result = true;
    }
    if (result === false) break;
  }

  return result;
};

export const addproduct = async (req: any, res: any, db: any) => {
  try {
    const post = req.body;
    const searchKey = post.name;
    post.searchKey = searchKey;

    const result = await db.collection("products").insertOne(post);
    db.collection("products").createIndex({ searchKey: "text" });
    res.send({ message: "success" });
  } catch (err) {
    res.status(500).send({ message: "failure", error: err });
  }
};
export const listproduct = async (req: any, res: any, db: any) => {
  try {
    const post = req.body;

    const result = await db
      .collection("products")
      .find({ type: req.params.type });

    res.send({ message: "success", data: result });
  } catch (err) {
    res.status(500).send({ message: "failure", error: err });
  }
};

export const editproduct = async (req: any, res: any, db: any) => {
  try {
    const post = req.body;

    const result = await db
      .collection("products")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: post });

    res.send({ message: "success" });
  } catch (err) {
    res.status(500).send({ message: "failure", error: err });
  }
};

export const deleteproduct = async (req: any, res: any, db: any) => {
  try {
    const result = await db
      .collection("products")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    res.send({ message: "success" });
  } catch (err) {
    res.status(500).send({ message: "failure", error: err });
  }
};

export const searchproduct = async (req: any, res: any, db: any) => {
  try {
    let result;
    if (req.params) {
      result = await db
        .collection("products")
        .find({ $text: { $search: req.params.text } });
    }

    res.send({ message: "success", data: result });
  } catch (err) {
    res.status(500).send({ message: "failure", error: err });
  }
};

// orders

export const createorder = async (req: any, res: any, db: any) => {
  try {
    const post = req.body;
    const result = await db.collection("orders").insertOne(post);

    res.send({ message: "success" });
  } catch (err) {
    res.status(500).send({ message: "failure", error: err });
  }
};

export const listorder = async (req: any, res: any, db: any) => {
  try {
    const result = await db
      .collection("orders")
      .find({ orderStatus: req.params.where });

    res.send({ message: "success", data: result });
  } catch (err) {
    res.status(500).send({ message: "failure", error: err });
  }
};

export const updateorder = async (req: any, res: any, db: any) => {
  try {
    const post = req.body;

    const result = await db
      .collection("orders")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: post });

    res.send({ message: "success" });
  } catch (err) {
    res.status(500).send({ message: "failure", error: err });
  }
};
export const orderbyuser = async (req: any, res: any, db: any) => {
  try {
    const result = await db
      .collection("orders")
      .find({ orderedBy: req.params.id });

    res.send({ message: "success", data: result });
  } catch (err) {
    res.status(500).send({ message: "failure", error: err });
  }
};
export const getorderbyid = async (req: any, res: any, db: any) => {
  try {
    const result = await db
      .collection("orders")
      .find({ _id: new ObjectId(req.params.id) });

    res.send({ message: "success", data: result });
  } catch (err) {
    res.status(500).send({ message: "failure", error: err });
  }
};

// user

export const createuser = async (req: any, res: any, db: any) => {
  try {
    const post = req.body;
    const result = await db.collection("users").insertOne(post);

    res.send({ message: "success" });
  } catch (err) {
    res.status(500).send({ message: "failure", error: err });
  }
};
export const getuser = async (req: any, res: any, db: any) => {
  try {
    const post = req.body;
    const result = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.query.id) });

    res.send({ message: "success", data: result });
  } catch (err) {
    res.status(500).send({ message: "failure", error: err });
  }
};
export const updateuser = async (req: any, res: any, db: any) => {
  try {
    const post = req.body;
    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(req.query.id) }, { $set: post });

    res.send({ message: "success" });
  } catch (err) {
    res.status(500).send({ message: "failure", error: err });
  }
};
