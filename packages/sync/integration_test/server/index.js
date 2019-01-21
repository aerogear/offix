const express = require('express');
const cors = require('cors');

const graphqlStart = require('./graphql');

const app = express();
app.use(cors());

const PORT = 4001;

let graphqlServer;

app.post('/start', async (_, res) => {
  graphqlServer = await graphqlStart();
  res.sendStatus(200);
});
app.post('/stop', (_, res) => {
  graphqlServer.close();
  res.sendStatus(200)
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
