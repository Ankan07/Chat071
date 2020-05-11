import express from "express";
import { Db } from "mongodb";
import { OrderFunctions } from "./orderFunctions";
export class OrderRoutes {

/*
 * Order path has three endpoints
 * 1. GET - /order
 *          gives a list of all orders based on criteria
 *          criteria is established using 2 query parameters
 *           a. where - the key which should be matched
 *           b. is - the value for the key specified in where
 *      example: /order?where=status&is=active
 *          this can be also be used for making time based range queries
 *          for making a time based range query, start and end query parameters are used
 *      example: /order?start=123567938&end=1428542034
 *
 *      PS: start, end, where and is can be used simultaneously for better querying
 * 2. GET - /order/:id
 *          gives the order object of a single order having _id as id
 *
 * 3. POST - /order
 *          if body contains _id it attempts to update the object
 *          if no _id is passed, it creates a new user object
 */

  private functions: OrderFunctions;
  constructor(private db: Db) {
    this.functions = new OrderFunctions(db);
  }

  getRoutes() {
    return express
      .Router()
      .post("", (req, res) => {
        this.functions.insertOrUpdateOrder(req, res);
      })
      .get("", (req, res) => {
        this.functions.getOrderByCriteria(req, res);
      })
      .get("/:id", (req, res) => {
        this.functions.getorderbyid(req, res);
      });
  }
}
