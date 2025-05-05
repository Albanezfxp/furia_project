import { Controller, Get, Param} from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':userId/:friendId')
  async getMessages(
    @Param('userId') userId: string,
    @Param('friendId') friendId: string
  ) {
    try {
      const messages = await this.prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: parseInt(userId),
              receiverId: parseInt(friendId)
            },
            {
              senderId: parseInt(friendId),
              receiverId: parseInt(userId)
            }
          ]
        },
        orderBy: {
          createdAt: 'asc'
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return messages.map(msg => ({
        id: msg.id,
        senderId: msg.senderId.toString(),
        senderName: msg.sender.name,
        content: msg.content,
        timestamp: msg.createdAt,
        isDelivered: msg.isDelivered,
        readAt: msg.readAt
      }));
    } catch (error) {
      throw new Error('Erro ao carregar mensagens');
    }
  }
  
}