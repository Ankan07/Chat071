import express from "express";
import { ProductFunctions } from "./productFunctions";
import { Db } from "mongodb";

export class ProductRoutes {
  private functions: ProductFunctions;
  constructor(private db: Db) {
    this.functions = new ProductFunctions(db);
  }

  getRoutes() {
    return express
      .Router()
      .post("", (req, res) => {
        this.functions.addproduct(req, res);
      })
      .post("/list/:type", (req, res) => {
        this.functions.listproduct(req, res);
      })
      .post("", (req, res) => {
        this.functions.editproduct(req, res);
      })
      .post("/delete/:id", (req, res) => {
        this.functions.deleteproduct(req, res);
      })
      .get("/search/:text", (req, res) => {
        this.functions.searchproduct(req, res);
      });
  }
}
