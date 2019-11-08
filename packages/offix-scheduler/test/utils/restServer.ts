// server.js
import jsonServer from "json-server";
import { db } from "./restServerDB";

const server = jsonServer.create();
const router = jsonServer.router(db);
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);

export { server };
