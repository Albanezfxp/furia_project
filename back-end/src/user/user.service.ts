import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreatedUserDto } from './dto/CreateUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class UserService {

    constructor(private readonly prisma: PrismaService) {}

    async getAll() {
        return this.prisma.user.findMany();
    }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findFirst(
            {
                where: {email: email}
            }
        ); 
    
        if (!user) {
          throw new UnauthorizedException('Usuário não encontrado');
        }
    
        const isPasswordValid = password === user.password

    
        if (!isPasswordValid) {
          throw new HttpException('Senha incorreta', 401);
        }
        return user
      }

      async Register(data: CreatedUserDto) {
        const existingUser = await this.prisma.user.findFirst({
          where: { email: data.email.trim() }, 
        });
        
        if (existingUser) {
          throw new HttpException('Email já cadastrado', HttpStatus.CONFLICT);
        }
      
        const newUser = await this.prisma.user.create({
          data: {
            email: data.email.trim(), 
            name: data.name.trim(),   
            password: data.password.trim(), 
          }
        });
        
        return newUser;
      }
    async updated(data: UpdateUserDto, id: number) {
        const user = await this.prisma.user.findFirst({
            where: {id: id}
        })
        if (!user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }

        const userUpdated = await this.prisma.user.update({
            where: {id: user.id},
            data: {
                email: data.email,
                name: data.name,
                password: data.password
            }
        })

        if (!userUpdated) {
            throw new HttpException("User not updated", HttpStatus.BAD_REQUEST)
        }

        return userUpdated
    }

    async delete(id: number) {
        const userDeleted = await this.prisma.user.delete({
            where: {id: id}
        })

        return userDeleted
    }

    async searchUsers(query: string) {
      if (!query || query.trim().length < 3) {
          throw new HttpException(
              'A busca deve conter pelo menos 3 caracteres',
              HttpStatus.BAD_REQUEST
          );
      }

      const users = await this.prisma.user.findMany({
          where: {
              OR: [
                  {
                      email: {
                          contains: query,
                          mode: 'insensitive'
                      }
                  },
                  {
                      name: {
                          contains: query,
                          mode: 'insensitive'
                      }
                  }
              ],
          }, 
          select: {
              id: true,
              name: true,
              email: true
            }
      });

      return users;
  }
 
  async getMessageHistory(userId: number, limit: number = 50, offset: number = 0) {
  return this.prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
    skip: offset,
    include: {
      sender: {
        select: {
          id: true,
          name: true
        }
      },
      receiver: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
}

}
