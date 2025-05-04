import { Body, Controller, Delete, Get, Param, Post, Put, Query, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreatedUserDto } from './dto/CreateUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';

@Controller('user')
export class UserController {
    constructor(private readonly user: UserService){}

    @Get() 
    getAll() {
        return this.user.getAll()
    }
    @Get('search')
    async searchUsers(@Query('email') email: string) {
        return this.user.searchUsers(email);
    }
    

    @Post('login')
    async login(@Body() credentials: { email: string; password: string }) {
        const user = await this.user.validateUser(
            credentials.email,
            credentials.password
        );
        if (!user) {
            throw new UnauthorizedException('Email ou senha inválidos');
        }
        return user; 
    }

    @Post()
    async createUser(@Body() userData: CreatedUserDto) {
      console.log('Received data:', userData);
      return this.user.Register(userData);
    }

    @Put(":id")
    updateUser(@Body() UpdatedUserDto: UpdateUserDto, @Param("id") id:number) {
        return this.user.updated(UpdatedUserDto, id)
    }

    @Delete("id")
    deletedUser(@Param("id") id: number) {
        return this.user.delete(id)
    }
}
