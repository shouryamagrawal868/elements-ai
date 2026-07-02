import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import routes from "./routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register Routes
app.use("/", routes);

export default app;