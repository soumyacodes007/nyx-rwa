import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { AppConfig } from "../lib/env.js";
import { refreshMockOracle } from "../services/oracle-admin.js";

const refreshSchema = z.object({
  asset: z.string().min(1).optional(),
  priceE7: z.string().regex(/^[0-9]+$/).optional(),
  updatedLedger: z.number().int().positive().optional()
});

export const registerOracleRoutes = async (
  app: FastifyInstance,
  config: AppConfig
): Promise<void> => {
  app.post("/api/admin/oracle/refresh", async (request, reply) => {
    try {
      return await refreshMockOracle(config, refreshSchema.parse(request.body ?? {}));
    } catch (error) {
      return reply.code(422).send({ error: error instanceof Error ? error.message : String(error) });
    }
  });
};

