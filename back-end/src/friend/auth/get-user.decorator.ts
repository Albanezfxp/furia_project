import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Simulando um usuário logado (você pode ajustar conforme sua lógica)
    return {
      id: 1, // ID do usuário mockado
      name: 'Usuário Teste',
      email: 'teste@example.com'
    };
  },
);