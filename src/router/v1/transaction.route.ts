import express from "express";
import { isAuthenticated, validateRequest } from "../../middlewares";
import { previewSchema, trsansactionSchema } from "../../schemas";
import { newTx, previewTx } from "../../controllers/transaction";

export default (router: express.Router) => {
  router.post(
    "/tx/new",
    validateRequest(trsansactionSchema),
    isAuthenticated,
    newTx
  );
  router.post(
    "/tx/preview",
    validateRequest(previewSchema),
    isAuthenticated,
    previewTx
  );
};
