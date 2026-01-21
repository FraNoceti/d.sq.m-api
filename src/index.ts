import express from "express";
import http from "http";
import cors from "cors";
import compression from "compression";
import routerV1 from "./router/v1";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import { initExchangeRates } from "./services/exchangeRate";

// Initialize exchange rates cache on startup
initExchangeRates();

const app = express();

app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());
app.use(bodyParser.json());

// const server = http.createServer(app);

// server.listen(8080, () => {
//   console.log("server running at http://localhost:8080/");
// });

const port = process.env.PORT || 8080;
app.listen(port as number, "0.0.0.0");

app.get("/", (_req, res) =>
  res.send(
    "<div>Welcome to InvestConservation APIs! Visit <a href=`https://api.investconservation.com/docs/`>api.investconservation.com/docs</a> for further details.</div>"
  )
);

var options = {
  customCss: ".swagger-ui .topbar { display: none } body {padding: 0 10%;} ",
  // customCssUrl:
  //   "https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-newspaper.css",
  customSiteTitle: "InvestConservation API",
  customfavIcon: "./favicon.ico",
};

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

app.use("/v1", routerV1());
