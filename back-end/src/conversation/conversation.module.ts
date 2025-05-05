import { Module } from '@nestjs/common';
import { ConversationsController } from './conversation.controller';
import { PrismaService } from '@src/prisma/prisma.service';
import { FriendsService } from '@src/friend/friend.service';

@Module({
  controllers: [ConversationsController],
  providers: [FriendsService, PrismaService]
})
export class ConversationsModule {}