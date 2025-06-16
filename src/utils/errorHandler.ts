import { Request, Response, NextFunction } from "express";

interface ErrorWithStatus extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";

  console.error("Error:", err);

  res.status(statusCode).json({
    status,
    message: err.message || "Something went wrong",
  });
};

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(async (error: any) => {
      if (
        error.code === "P2024" ||
        error.message?.includes("prepared statement") ||
        error.message?.includes("ConnectorError")
      ) {
        console.log("Prisma connection error, attempting to reconnect...");
        const { prisma } = await import("../lib/prisma");
        await prisma.$disconnect();
        await prisma.$connect();

        try {
          return await fn(req, res, next);
        } catch (retryError) {
          next(retryError);
        }
      } else {
        next(error);
      }
    });
  };
};

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
