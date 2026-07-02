import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { AppDatabase } from "../db/sqlite.js";
import type { AppConfig } from "../lib/env.js";
import { getSep12Customer, putSep12Customer, putSep12CustomerCallback } from "../services/sep12.js";

const customerQuerySchema = z.object({
  id: z.string().min(1).optional(),
  account: z.string().min(1).optional(),
  type: z.string().min(1).optional()
});

const putCustomerSchema = z.object({
  id: z.string().min(1).optional(),
  account: z.string().min(1),
  memo: z.string().nullable().optional(),
  type: z.string().min(1).optional(),
  status: z.string().optional(),
  fields: z.record(z.unknown()).optional(),
  callback_url: z.string().url().nullable().optional(),
  reason: z.string().nullable().optional()
});

const callbackSchema = z.object({
  id: z.string().min(1),
  account: z.string().min(1),
  callback_url: z.string().url()
});

const path = (prefix: string, suffix: string) => `${prefix}${suffix}`;

export const registerSep12Routes = async (
  app: FastifyInstance,
  config: AppConfig,
  db: AppDatabase,
  prefix = "/api/sep12"
): Promise<void> => {
  app.get(path(prefix, "/customer"), async (request) => {
    const query = customerQuerySchema.parse(request.query);
    return getSep12Customer(db, query);
  });

  app.put(path(prefix, "/customer"), async (request) => {
    const body = putCustomerSchema.parse(request.body);
    return putSep12Customer(config, db, body);
  });

  app.put(path(prefix, "/customer/callback"), async (request) => {
    const body = callbackSchema.parse(request.body);
    return putSep12CustomerCallback(db, body);
  });
};
