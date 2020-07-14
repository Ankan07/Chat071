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
    const auth = new Auth().verifyToken;
    return express
      .Router()
      .post("", auth, (req, res) => {
        this.functions.addproduct(req, res);
      })
      .get("/list/:type", auth, (req, res) => {
        this.functions.listproduct(req, res);
      })
      .put("", auth, (req, res) => {
        this.functions.editproduct(req, res);
      })
      .post("/delete/:id", auth, (req, res) => {
        this.functions.deleteproduct(req, res);
      })
      .get("/search/:text", auth, (req, res) => {
        this.functions.searchproduct(req, res);
      })
      .get("/homepage", auth, (req, res) => {
        this.functions.homepage(req, res);
      })
      .post("/category", (req, res) => {
        this.functions.addcategory(req, res);
      })
      .post("/category/delete", (req, res) => {
        this.functions.deletecategory(req, res);
      })
      .get("/category", (req, res) => {
        this.functions.getcategories(req, res);
      })
      .post("/category/:id", (req, res) => {
        this.functions.updatecategories(req, res);
      })
      .get("/category/items/:type", (req, res) => {
        this.functions.getfeatureditemsforacategory(req, res);
      })
      .post("/category/items/:type", (req, res) => {
        this.functions.updatefeatureditemsforcategory(req, res);
      })
      .post("/category/items/delete/:type", (req, res) => {
        this.functions.deleteallproductsforcategory(req, res);
      });
  }
}
