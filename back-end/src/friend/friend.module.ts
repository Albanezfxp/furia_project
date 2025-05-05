import { Module } from '@nestjs/common';
import { FriendsController } from './friend.controller';
import { PrismaService } from '@src/prisma/prisma.service';
import { FriendsService } from './friend.service';


@Module({
  controllers: [FriendsController],
  providers: [FriendsService, PrismaService],
  exports: [FriendsService] 
})
export class FriendsModule {}