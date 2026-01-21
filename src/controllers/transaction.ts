import { get, merge } from "lodash";
import client from "../client";
import express from "express";
import { Identity } from "types";
import { render } from "@react-email/render";
import { getUSDRate } from "../services/exchangeRate";

import { ThankYouTx } from "../emails/transaction";

export const newTx = async (req: express.Request, res: express.Response) => {
  try {
    const { currency, totalAmount, email } = req.body;
    const user: Identity = get(req, "identity");
    const todayUsage: number = get(req, "today_usage");

    if (!currency || !totalAmount) return res.sendStatus(400);

    const amountInUSD = await getUSDRate(currency, totalAmount);

    const { customerEmail, amountUSD, ...tx } =
      await client.prisma.transaction.create({
        data: {
          amountUSD: Number(amountInUSD.toFixed(2)),
          clientId: user.id,
          customerEmail: email,
        },
      });

    const sqmProtected = ((10000 / user.priceForHectare) * amountInUSD).toFixed(
      3
    );

    const remainingHectares = await client.prisma.client.update({
      where: {
        id: user.id,
      },
      data: {
        hectaresStock: user.hectaresStock - Number(sqmProtected) / 10000,
      },
    });

    const params = {
      mail: user.email,
      amount: Number(sqmProtected) / 10000,
    };

    // Fire-and-forget: don't block response
    fetch("https://ic-ledger.vercel.app/api/sqm/updt-stock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }).catch((error) => {
      console.error("Failed to update ledger:", error);
    });

    const response = merge(
      {
        protected_land: `${sqmProtected} sq.m.`,
        amountUSD,
        remaining_hectares: remainingHectares.hectaresStock,
        todayUsage,
        daily_limit: user.dailyLimit,
      },
      tx,
      !!customerEmail && customerEmail
    );

    // Send email asynchronously without blocking the response
    if (email) {
      client.resend.emails
        .send({
          from: "InvestConservation <thankyou@investconservation.com>",
          to: [email],
          subject: "Thank you from IC",
          html: render(
            ThankYouTx({ sqm: Number(sqmProtected), partnerName: user.name })
          ),
        })
        .catch((error) => {
          console.error("Failed to send transaction email:", error);
        });
    }

    return res.status(200).json(response).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const previewTx = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { currency, totalAmount } = req.body;
    const user: Identity = get(req, "identity");
    const todayUsage: number = get(req, "today_usage");

    const amountInUSD = await getUSDRate(currency, totalAmount);

    const sqmProtected = ((10000 / user.priceForHectare) * amountInUSD).toFixed(
      3
    );

    const response = {
      protected_land: `${sqmProtected} sq.m.`,
      amountUSD: Number(amountInUSD.toFixed(2)),
      todayUsage,
      daily_limit: user.dailyLimit,
    };

    return res.status(200).json(response).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
