import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationsController } from './conversation.controller';
import { FriendsService } from 'src/friend/friend.service';

@Module({
  controllers: [ConversationsController],
  providers: [FriendsService, PrismaService]
})
export class ConversationsModule {}