import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket']
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  constructor(private readonly prisma: PrismaService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway inicializado');
  }

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (!userId) {
      client.disconnect();
      return;
    }

    this.logger.log(`Cliente conectado: ${client.id} (User ID: ${userId})`);
    client.join(`user_${userId}`);

    try {
      await this.prisma.user.update({
        where: { id: parseInt(userId.toString()) },
        data: { 
          online: true,
          lastSeen: null 
        }
      });

      const connections = await this.prisma.userConnection.findMany({
        where: { userId: parseInt(userId.toString()) },
        select: { friendId: true }
      });

      connections.forEach(conn => {
        this.server.to(`user_${conn.friendId}`).emit('friendStatusChanged', {
          userId: userId,
          online: true,
          lastSeen: null
        });
      });
    } catch (error) {
      this.logger.error('Erro ao atualizar status de conexão:', error);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId;
    if (!userId) return;

    this.logger.log(`Cliente desconectado: ${client.id} (User ID: ${userId})`);

    try {
      await this.prisma.user.update({
        where: { id: parseInt(userId.toString()) },
        data: { 
          online: false,
          lastSeen: new Date()
        }
      });

      const connections = await this.prisma.userConnection.findMany({
        where: { userId: parseInt(userId.toString()) },
        select: { friendId: true }
      });

      connections.forEach(conn => {
        this.server.to(`user_${conn.friendId}`).emit('friendStatusChanged', {
          userId: userId,
          online: false,
          lastSeen: new Date()
        });
      });
    } catch (error) {
      this.logger.error('Erro ao atualizar status de desconexão:', error);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { senderId: string, receiverId: string, content: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      if (!data.content?.trim()) {
        return { success: false, error: 'Mensagem vazia' };
      }

      const message = await this.prisma.message.create({
        data: {
          senderId: parseInt(data.senderId),
          receiverId: parseInt(data.receiverId),
          content: data.content,
          isDelivered: true
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

      this.server.to(`user_${data.receiverId}`).emit('newMessage', {
        id: message.id,
        senderId: data.senderId,
        senderName: message.sender.name,
        content: data.content,
        timestamp: message.createdAt
      });

      return { 
        success: true, 
        messageId: message.id,
        timestamp: message.createdAt
      };
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem:', error);
      return { success: false, error: 'Erro ao enviar mensagem' };
    }
  }
}