import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { FriendsService } from './friend.service';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post(':userId/start-conversation')
  startConversation(
    @Param('userId') userId: string,
    @Body('email') email: string
  ) {
    return this.friendsService.startConversation(parseInt(userId), email);
  }

  @Get(':userId/conversations')
  listUserConversations(@Param('userId') userId: string) {
    return this.friendsService.listUserConversations(parseInt(userId));
  }
}