import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

function formatZodErrors(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

// schemas: { body?, params?, query?, headers? } — cada um um schema Zod.
export function validateRequest(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) {
        // Express 5 expõe req.query como getter sem setter — atribuição
        // direta (`req.query = ...`) lança TypeError. Precisa redefinir a
        // própria propriedade para conseguir sobrescrever com os dados validados.
        const parsedQuery = schemas.query.parse(req.query);
        Object.defineProperty(req, "query", { value: parsedQuery, writable: true, configurable: true });
      }
      if (schemas.headers) schemas.headers.parse(req.headers);
      if (schemas.body) req.body = schemas.body.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError("Validation failed", 422, formatZodErrors(error)));
      }
      next(error);
    }
  };
}
