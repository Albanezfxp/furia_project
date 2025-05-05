import { FriendsModule } from '../friend/friend.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from '../user/user.controller';
import { FuriaAgentController } from '../furia-agent/furia-agent.controller';
import { UserService } from '../user/user.service';
import { FuriaAgentService } from '../furia-agent/furia-agent.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaController } from '../prisma/prisma.controller';
import { MessagesController } from '../messages/messages.controller';
import { ChatGateway } from '../chat/chat/chat.gateway';



@Module({
  imports: [UserModule, PrismaModule, FriendsModule],
  controllers: [
    AppController, 
    UserController, 
    FuriaAgentController, 
    PrismaController,
    MessagesController
  ],
  providers: [
    AppService, 
    UserService, 
    FuriaAgentService, 
    PrismaService, 
    ChatGateway
  ],
})
export class AppModule {}