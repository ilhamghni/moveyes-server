import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { withPrismaErrorHandling } from "../utils/prismaHandler";

export const getProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const profile = await withPrismaErrorHandling(async () => {
      return await prisma.profile.findFirst({
        where: { userId },
        include: { user: { select: { id: true, email: true, name: true } } },
      });
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res
      .status(500)
      .json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { bio, avatarUrl, name, nickname, hobbies, socialMedia } = req.body;

    const updatedProfile = await withPrismaErrorHandling(async () => {
      return await prisma.$transaction(async (tx) => {
        if (name !== undefined) {
          await tx.user.update({
            where: { id: userId },
            data: { name },
          });
        }

        const profile = await tx.profile.update({
          where: { userId },
          data: {
            bio: bio !== undefined ? bio : undefined,
            avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
            nickname: nickname !== undefined ? nickname : undefined,
            hobbies: hobbies !== undefined ? hobbies : undefined,
            socialMedia: socialMedia !== undefined ? socialMedia : undefined,
          },
          include: { user: { select: { id: true, email: true, name: true } } },
        });

        return profile;
      });
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      });
  }
};
