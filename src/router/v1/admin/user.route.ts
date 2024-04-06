import express from "express";
import { isAdmin, validateRequest } from "../../../middlewares";
import { trsansactionSchema } from "schemas";
import { newUser } from "../../../controllers/user";

export default (router: express.Router) => {
  router.post(
    "/user/new",
    // validateRequest(trsansactionSchema),
    isAdmin,
    newUser
  );
};
