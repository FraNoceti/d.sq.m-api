import express from "express";

import { isAuthenticated } from "../../middlewares";
import { checkUsage } from "../../controllers/usage";

export default (router: express.Router) => {
  router.get("/usage", isAuthenticated, checkUsage);
};
