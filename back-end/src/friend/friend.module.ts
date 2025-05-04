import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {FriendsController } from './friend.controller';
import { FriendsService } from './friend.service';

@Module({
  controllers: [FriendsController],
  providers: [FriendsService, PrismaService],
  exports: [FriendsService] 
})
export class FriendsModule {}