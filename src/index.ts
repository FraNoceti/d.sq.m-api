import express from "express";
import http from "http";
import cors from "cors";
import compression from "compression";
import routerV1 from "./router/v1";
import bodyParser from "body-parser";

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

const port = process.env.PORT || 3000;
app.listen(port as number, "0.0.0.0");

app.use("/v1", routerV1());
