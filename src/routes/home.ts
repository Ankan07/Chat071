import express from "express";
const route = express.Router();
import * as functions from "../functions/functions";

const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");


// Connection URL
const url = "mongodb://localhost:27017";

const dbName = "essentials";

MongoClient.connect(url, function (err: any, client: any) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  route.post("/v1/product/add", (req, res) => {
    functions.addproduct(req, res, db);
  });

  route.post("/v1/product/list/:type", (req, res) => {
    functions.listproduct(req, res, db);
  });

  route.post("/v1/product/edit/:id", (req, res) => {
    functions.editproduct(req, res, db);
  });

  route.post("/v1/product/delete/:id", (req, res) => {
    functions.deleteproduct(req, res, db);
  });

  route.post("/v1/product/search/:text", (req, res) => {
    functions.searchproduct(req, res, db);
  });


  //orders
  route.post("/v1/order/create", (req, res) => {
    functions.createorder(req, res, db);
  });

  route.get("/v1/order/list", (req, res) => {
    functions.listorder(req, res, db);
  });

  route.post("/v1/order/update", (req, res) => {
    functions.updateorder(req, res, db);
  });
  route.get("/v1/order/byUser/:id", (req, res) => {
    functions.orderbyuser(req, res, db);
  });
  route.get("/v1/order/:id", (req, res) => {
    functions.getorderbyid(req, res, db);
  });

  //users
  route.post("/v1/user/create", (req, res) => {
    functions.createuser(req, res, db);
  });

  route.get("/v1/user", (req, res) => {
    functions.getuser(req, res, db);
  });
  route.post("/v1/user", (req, res) => {
    functions.updateuser(req, res, db);
  });






});

export { route as home };
