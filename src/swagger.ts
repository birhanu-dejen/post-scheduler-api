// src/swagger.ts  (or whatever file you named)
import path from "path";
import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const router = express.Router();
const swaggerDoc = YAML.load(path.join(__dirname, "../docs/swagger.yaml"));

router.get("/json", (_: Request, res: Response) => {
  res.type("application/json").send(swaggerDoc);
});

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

export default router;
