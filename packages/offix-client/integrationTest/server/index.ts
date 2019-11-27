import express from "express";
import cors from "cors";

import { startServer } from "./graphql";
import { resetData } from "./schema";

const app = express();
app.use(cors());

const PORT = 4001;

let graphqlServer;

app.post("/start", async (_, res) => {
  graphqlServer = await startServer();
  res.sendStatus(200);
});
app.post("/stop", (_, res) => {
  if (graphqlServer) {
    graphqlServer.close();
  }
  res.sendStatus(200);
});
app.post("/reset", (_, res) => {
  resetData();
  res.sendStatus(200);
});

app.listen(PORT, () => console.info(`Server listening on port ${PORT}!`));
