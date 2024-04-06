import express from "express";
import { get, merge } from "lodash";

import { Identity } from "types";

export const checkUsage = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const user: Identity = get(req, "identity");
    const todayUsage: number = get(req, "today_usage");

    const response = {
      todayUsage,
      daily_limit: user.dailyLimit,
      remaining_hectares: user.hectaresStock,
    };

    return res.status(200).json(response).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
