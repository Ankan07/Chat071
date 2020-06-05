import express from "express";
import { ProductFunctions } from "./productFunctions";
import { Db } from "mongodb";
import { Auth } from "../../Auth/auth";

export class ProductRoutes {
  private functions: ProductFunctions;
  constructor(private db: Db) {
    this.functions = new ProductFunctions(db);
  }

  getRoutes() {
    var auth = new Auth().verifyToken;
    return express
      .Router()
      .post("", auth, (req, res) => {
        this.functions.addproduct(req, res);
      })
      .get("/list/:type", auth, (req, res) => {
        this.functions.listproduct(req, res);
      })
      .post("", auth, (req, res) => {
        this.functions.editproduct(req, res);
      })
      .post("/delete/:id", auth, (req, res) => {
        this.functions.deleteproduct(req, res);
      })
      .get("/search/:text", auth, (req, res) => {
        this.functions.searchproduct(req, res);
      });
  }
}
