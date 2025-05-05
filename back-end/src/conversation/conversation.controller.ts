import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { FriendsService } from '@src/friend/friend.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post(':userId/start')
  startConversation(
    @Param('userId') userId: string,
    @Body('email') email: string
  ) {
    return this.friendsService.startConversation(parseInt(userId), email);
  }

  @Get(':userId/list')
  listConversations(@Param('userId') userId: string) {
    return this.friendsService.listUserConversations(parseInt(userId));
  }
}