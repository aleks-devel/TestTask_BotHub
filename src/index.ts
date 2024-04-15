import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { ModelsController } from "./controllers/models";
import { ModelsProvider } from "./providers/models.provider";
import { getPool } from "./providers/db";
import { ValidationError } from "joi";
import { CronApiProvider } from "./providers/cron-api.provider";
import schedule from "node-schedule";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const pool = getPool();
const provider = new ModelsProvider(pool);
ModelsController.init(app, provider);

CronApiProvider.init("0 1 * * *", pool);

app.all("*", (req: Request, res: Response) => {
  res.status(404).json({
    message: "not found"
  });
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      messages: err.details.map((d) => d.message)
    });
  } else {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

process.on('SIGINT', function () {
  schedule.gracefulShutdown()
    .then(() => process.exit(0))
});