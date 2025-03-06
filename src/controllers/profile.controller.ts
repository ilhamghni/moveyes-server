import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { bio, avatarUrl, name } = req.body;

    // Update user and profile in a transaction
    const updatedProfile = await prisma.$transaction(async (tx) => {
      // Update user if name is provided
      if (name !== undefined) {
        await tx.user.update({
          where: { id: userId },
          data: { name },
        });
      }

      // Update profile
      const profile = await tx.profile.update({
        where: { userId },
        data: {
          bio: bio !== undefined ? bio : undefined,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        },
        include: { user: { select: { id: true, email: true, name: true } } },
      });

      return profile;
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};