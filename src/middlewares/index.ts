import express from "express";
import Joi from "joi";
import { merge } from "lodash";

import client from "../client";

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const apiKeyHeader = req.headers["x-api-key"];

    if (!apiKeyHeader) return res.sendStatus(403);

    if (typeof apiKeyHeader !== "string") return res.sendStatus(403);

    const existingUser = await client.prisma.client.findFirst({
      where: {
        apiKey: {
          equals: apiKeyHeader as string,
        },
      },
      include: {
        usages: true,
      },
    });

    if (!existingUser) return res.sendStatus(403);

    let today = new Date().toLocaleDateString();

    const todayUsage = existingUser.usages.find(
      (usage) => usage.date === today
    );

    if (todayUsage) {
      if (todayUsage.usageCount >= existingUser.dailyLimit)
        return res.sendStatus(429);
      await client.prisma.usage.update({
        where: {
          id: todayUsage.id,
        },
        data: {
          usageCount: (todayUsage.usageCount += 1),
        },
      });
    } else {
      await client.prisma.usage.create({
        data: {
          date: today,
          usageCount: 1,
          clientId: existingUser.id,
        },
      });
    }

    merge(req, {
      identity: existingUser,
      today_usage: !!todayUsage ? (todayUsage.usageCount += 1) : 1,
    });

    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const isAdmin = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const apiKeyHeader = req.headers["x-api-key"];

    if (!apiKeyHeader) res.sendStatus(403);

    if (typeof apiKeyHeader !== "string") res.sendStatus(403);

    const checkAdmin = apiKeyHeader == process.env.ADMIN_KEY;

    if (checkAdmin === false) res.sendStatus(403);

    merge(req, { admin: checkAdmin });

    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const validateRequest = (schema: Joi.AnySchema) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { value, error } = schema.validate(req.body);
    console.log(value, error);
    if (error) {
      return res
        .status(400)
        .json({
          error: error.details[0].message,
        })
        .end();
    }

    req.body = value;
    next();
  };
};
