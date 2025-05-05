import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async startConversation(currentUserId: number, targetEmail: string) {
    const cleanEmail = targetEmail.toLowerCase().trim();
    if (!this.validateEmail(cleanEmail)) {
      throw new HttpException('Email inválido', HttpStatus.BAD_REQUEST);
    }

    const [currentUser, targetUser] = await Promise.all([
      this.prisma.user.findUnique({ 
        where: { id: currentUserId },
        select: { id: true, name: true, email: true }
      }),
      this.prisma.user.findFirst({
        where: { email: { equals: cleanEmail, mode: 'insensitive' } },
        select: { id: true, name: true, email: true }
      })
    ]);

    if (!currentUser) {
      throw new HttpException('Usuário atual não encontrado', HttpStatus.NOT_FOUND);
    }

    if (!targetUser) {
      throw new HttpException('Usuário com este email não encontrado', HttpStatus.NOT_FOUND);
    }

    if (currentUser.id === targetUser.id) {
      throw new HttpException('Você não pode conversar consigo mesmo', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.$transaction(async (prisma) => {
      const existingConnection = await prisma.userConnection.findFirst({
        where: {
          OR: [
            { userId: currentUser.id, friendId: targetUser.id },
            { userId: targetUser.id, friendId: currentUser.id }
          ]
        }
      });

      if (!existingConnection) {
        await prisma.userConnection.createMany({
          data: [
            { userId: currentUser.id, friendId: targetUser.id },
            { userId: targetUser.id, friendId: currentUser.id }
          ]
        });
      }
    });

    return {
      success: true,
      friend: {
        id: targetUser.id.toString(),
        name: targetUser.name,
        email: targetUser.email,
        online: false
      }
    };
  }

  async listUserConversations(userId: number) {
    const connections = await this.prisma.userConnection.findMany({
      where: { userId },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            online: true,
            lastSeen: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return connections.map(conn => ({
      id: conn.friend.id.toString(),
      name: conn.friend.name,
      email: conn.friend.email,
      avatar: '', 
      online: conn.friend.online,
      lastSeen: conn.friend.lastSeen?.toISOString()
    }));
  }

  async searchUsers(query: string, currentUserId: number) {
    if (!query || query.trim().length < 3) {
      throw new HttpException(
        'A busca deve conter pelo menos 3 caracteres',
        HttpStatus.BAD_REQUEST
      );
    }

    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } }
            ]
          },
          {
            NOT: {
              OR: [
                { id: currentUserId }, 
                { 
                  friendsInitiated: { 
                    some: { 
                      friendId: currentUserId 
                    } 
                  } 
                }, 
                { 
                  friendsReceived: { 
                    some: { 
                      userId: currentUserId 
                    } 
                  } 
                }
              ]
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        online: true,
        lastSeen: true
      },
      take: 10 
    });

    return users.map(user => ({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      online: user.online,
      lastSeen: user.lastSeen?.toISOString() || null
    }));
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}