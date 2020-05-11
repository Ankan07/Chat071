import express from "express";
import { Db } from "mongodb";
import { UserFunctions } from "./userFunctions";

export class UserRoutes {

/*
 * User path has three endpoints
 * 1. GET - /user
 *          gives a list of all the users (should be changed, since it might be heavy on server)
 *
 * 2. GET - /user/:id
 *          gives the user object of a single user having _id as id
 *
 * 3. POST - /user
 *          if body contains _id it attempts to update the object
 *          if no _id is passed, it creates a new user object
 */

private functions: UserFunctions;

  constructor(private db: Db) {
    this.functions = new UserFunctions(db);
  }

  getRoutes() {
    return express
      .Router()
      .post("", (req, res) => {
        this.functions.createOrUpdateUser(req, res);
      })
      .get("", (req, res) => {
        this.functions.getuser(req, res);
      })
      .get("/:id", (req, res) => {
        this.functions.getuser(req, res);
      });
  }
}
