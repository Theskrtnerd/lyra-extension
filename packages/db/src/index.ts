// Solution for prisma edge: @link https://github.com/prisma/prisma/issues/22050#issuecomment-1821208388
// import { PrismaClient } from "@prisma/client/edge";
// import { withAccelerate } from "@prisma/extension-accelerate";

import { PrismaClient } from "@prisma/client";

export * from "@prisma/client";

// Learn more about instantiating PrismaClient in Next.js here: https://www.prisma.io/docs/data-platform/accelerate/getting-started
const prismaClientSingleton = () => {
  console.log("Initializing Prisma client...");
  try {
    return new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  } catch (error) {
    console.error("Failed to initialize Prisma client:", error);
    throw new Error(`Prisma client initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
