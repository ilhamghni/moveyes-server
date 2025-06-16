import { prisma } from "../lib/prisma";

export const withPrismaErrorHandling = async <T>(
  operation: () => Promise<T>
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    if (
      error.code === "P2024" ||
      error.message?.includes("prepared statement") ||
      error.message?.includes("ConnectorError")
    ) {
      console.log("Reconnecting to database due to connection error");
      await prisma.$disconnect();
      await prisma.$connect();
      
      return await operation();
    }
    throw error;
  }
};
