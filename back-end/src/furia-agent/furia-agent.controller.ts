import { Body, Controller, Post } from '@nestjs/common';
import { FuriaAgentService } from './furia-agent.service';

@Controller('furia')
export class FuriaAgentController {
  constructor(private readonly furiaService: FuriaAgentService) {}

  @Post('quest')
  async quest(@Body() body: { mensagem: string }) {
    if (!body?.mensagem?.trim()) {
      return { error: "MANDA A PERGUNTA DIREITO!", status: 400 };
    }

    try {
      const resposta = await this.furiaService.gerarResposta(body.mensagem);
      return { resposta, status: "SUCESSO" };
    } catch (erro) {
      return { 
        error: "FURIA BOT TÁ OFFLINE! TENTA MAIS TARDE!",
        detalhes: erro.message,
        status: 500
      };
    }
  }
}