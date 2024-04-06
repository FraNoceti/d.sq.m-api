import express from "express";
import transaction from "./transaction.route";
import user from "./admin/user.route";
import usage from "./usage.route";

const routerV1 = express.Router();

export default (): express.Router => {
  transaction(routerV1);
  user(routerV1);
  usage(routerV1);
  return routerV1;
};
