import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../generated/prisma/client.ts";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. Add it to user/api/.env, e.g. postgresql://user:password@localhost:5432/trendly");

export const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

export type Tx = Prisma.TransactionClient;
