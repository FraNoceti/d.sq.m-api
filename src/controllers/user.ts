import express from "express";
import crypto from "crypto";

import client from "../client";
import { render } from "@react-email/render";
import NewUser from "../emails/user";

export const newUser = async (req: express.Request, res: express.Response) => {
  try {
    const {
      name,
      email,
      collection,
      hectaresBought,
      priceForHectare,
      dailyLimit,
    } = req.body;

    const user = await client.prisma.client.create({
      data: {
        name,
        email,
        hectaresBought,
        hectaresStock: hectaresBought,
        dailyLimit,
        priceForHectare,
        apiKey: crypto.randomUUID(),
      },
    });

    const params = {
      owner: name,
      ownerMail: email,
      collection,
      hectaresBought,
      priceForHectare,
    };

    const ledgerPost = await fetch(
      "https://ic-ledger.vercel.app/api/sqm/new-client",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      }
    );

    // Send email asynchronously without blocking the response
    client.resend.emails
      .send({
        from: "InvestConservation <success@investconservation.com>",
        to: [email],
        subject: "Thank you from IC",
        html: render(NewUser({ partnerName: name, apiKey: user.apiKey })),
      })
      .catch((error) => {
        console.error("Failed to send new user email:", error);
      });

    return res.status(200).json({ user }).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
