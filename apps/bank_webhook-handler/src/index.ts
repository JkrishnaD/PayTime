import { atom } from "recoil";
import db from "@repo/db/client";
import express from "express";

const app = express();

app.post("/hdfcwebhook", async (req, res) => {
    
  const paymentInformation: { token: string; userId: string; amount: string } =
    {
      token: req.body.token,
      userId: req.body.userIdentifier,
      amount: req.body.amount,
    };

  try {
    await db.$transaction([
      db.balance.update({
        where: {
          userId: Number(paymentInformation.userId),
        },
        data: {
          amount: {
            increment: Number(paymentInformation.amount),
          },
        },
      }),

      db.onRampTransactions.update({
        where: {
          token: paymentInformation.token,
        },
        data: {
          status: "Success",
        },
      }),
    ]);
    res.json({
      message: "captured",
    });
  } catch (error) {
    res.status(411).json({
      message: "error while processing",
    });
  }
});

app.listen(3000);
