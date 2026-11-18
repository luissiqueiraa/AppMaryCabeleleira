import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
// O stream de eventos (SSE) não pode passar pela compressão: ela segura os
// bytes até juntar um bloco, e o aviso só chegaria minutos depois.
app.use(
  compression({
    filter: (req, res) =>
      req.originalUrl.startsWith("/api/v1/appointments/events") ? false : compression.filter(req, res),
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

// helmet() aplica Cross-Origin-Resource-Policy: same-origin por padrão, o que
// faz o Chrome bloquear o carregamento de <img> vindo do frontend (origem
// diferente, ex. localhost:5173 -> localhost:3000). Sobrescrevemos só aqui.
app.use(
  "/uploads",
  (req, res, next) => {
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(process.cwd(), "uploads"))
);
app.use("/api/v1", routes);

app.use(errorHandler);

export default app;
