import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import HLTV from 'hltv';

interface MatchResult {
  team1?: {
    name?: string;
    score?: number;
  };
  team2?: {
    name?: string;
    score?: number;
  };
  date?: number | string;
  result?: string;
  score?: string;
}

@Injectable()
export class FuriaAgentService {
  private readonly genAI: GoogleGenerativeAI;
  
  constructor() {
    this.genAI = new GoogleGenerativeAI("AIzaSyCdgf66_XWVTLUjra7jS0z_T3Wc1MCG5oc");

  }

  

    private async getFuriaRoster(): Promise<string> {
    try {
      const team = await HLTV.getTeam({id: 8297}).catch(() => null);
      
      if (!team || !team.players) {
        return "KSCERATO, arT, yuurih, FalleN, chelo";
      }

      const players = team.players
        .filter(p => p?.name) 
        .map(p => p.name.toUpperCase());
        
      return players.length > 0 
        ? players.join(', ') 
        : "KSCERATO, arT, yuurih, FalleN, chelo";
    } catch (error) {
      console.error('Erro ao buscar elenco:', error);
      return "KSCERATO, arT, yuurih, FalleN, chelo";
    }
  }

  private async getNextGame(): Promise<string> {
    try {
      const matches = await HLTV.getMatches().catch(() => []);
      
      const furiaMatch = matches.find(match => {
        const team1Name = match?.team1?.name?.toLowerCase() || '';
        const team2Name = match?.team2?.name?.toLowerCase() || '';
        return team1Name.includes('furia') || team2Name.includes('furia');
      });

      if (!furiaMatch || !furiaMatch.team1 || !furiaMatch.team2) {
        return "NENHUM JOGO MARCADO - MAS FURIA SEMPRE PRONTA!";
      }

      const isFuriaTeam1 = furiaMatch.team1.name.toLowerCase().includes('furia');
      const opponent = isFuriaTeam1 
        ? furiaMatch.team2.name.toUpperCase() 
        : furiaMatch.team1.name.toUpperCase();

      const matchDate = furiaMatch.date ? new Date(furiaMatch.date) : null;
      
      if (!matchDate) {
        return `JOGO CONTRA ${opponent} - DATA A CONFIRMAR!`;
      }

      const formattedDate = matchDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `${formattedDate} CONTRA ${opponent}`;
    } catch (error) {
      console.error('Erro ao buscar próximo jogo:', error);
      return "ERRO AO BUSCAR JOGO - MAS FURIA TÁ ON FIRE!";
    }
}

private async getLastMatch(): Promise<string> {
  try {
    const results = await HLTV.getResults({}).catch(() => []) as MatchResult[];
    
    const furiaMatches = results.filter(match => {
      const team1Name = match.team1?.name?.toLowerCase() || '';
      const team2Name = match.team2?.name?.toLowerCase() || '';
      return team1Name.includes('furia') || team2Name.includes('furia');
    });

    if (!furiaMatches.length) {
      return "FURIA NÃO JOGOU RECENTEMENTE!";
    }

    const lastMatch = furiaMatches[0];
    
    const isTeam1Furia = lastMatch.team1?.name?.toLowerCase().includes('furia');
    const opponent = isTeam1Furia
      ? lastMatch.team2?.name?.toUpperCase() || 'ADVERSÁRIO DESCONHECIDO'
      : lastMatch.team1?.name?.toUpperCase() || 'ADVERSÁRIO DESCONHECIDO';

    const formatScore = (): string => {
      if (lastMatch.result) return lastMatch.result;
      if (lastMatch.score) return lastMatch.score;
      
      const team1Score = lastMatch.team1?.score ?? '?';
      const team2Score = lastMatch.team2?.score ?? '?';
      return `${team1Score}-${team2Score}`;
    };

    const score = formatScore();
    
    const matchDate = lastMatch.date ? new Date(lastMatch.date) : null;
    const formattedDate = matchDate?.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) || 'DATA DESCONHECIDA';

    return `ÚLTIMA PARTIDA: FURIA ${score} ${opponent} (${formattedDate})`;

  } catch (error) {
    console.error('Erro ao buscar última partida:', error);
    return "ERRO AO CONSULTAR ÚLTIMA PARTIDA";
  }
}

  
  async gerarResposta(mensagem: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      const nextGame = await this.getNextGame();
      const team = await this.getFuriaRoster();
      const lastMatch = await this.getLastMatch();

      const prompt = `Você é o FURIA BOT, o bot mais fanático do mundo! Responda como um torcedor extremamente apaixonado:
Pergunta: ${mensagem}

INFORMAÇÕES ATUAIS:
- PRÓXIMO JOGO: ${nextGame}
- ELENCO ATUAL: ${team}
- ÚLTIMO JOGO: ${lastMatch}

REGRAS DE RESPOSTA:
1. SEMPRE USE MUITAS CAPSLOCK E EMOJIS! 🔥💣
2. Seja extremamente fanático e agressivo (na medida certa)
3. Para perguntas sobre próximo jogo: "VAMO FURIA! PRÓXIMO JOGO: ${nextGame} - VAI SER TERROR!"
4. Para elenco: "TIME MONSTRO: ${team} - NINGUÉM SEGURA ESSES CARA!"
5. Respostas curtas (máximo 2 frases)
6. Ignore completamente perguntas sobre outros times
7. Se não souber, responda com "SOU APAIXONADO DEMAIS PRA PENSAR, PERGUNTA DE NOVO!"`;
      
      const result = await model.generateContent(prompt);
      console.log(result)
      const resposta = await result.response.text();
      console.log(resposta)
      
      return resposta || this.respostaFallback(mensagem);
    } catch (erro) {
      console.error('Erro no Gemini:', erro);
      return this.respostaFallback(mensagem);
    }
  }

  async lastTournament() {}

  private respostaFallback(mensagem: string): string {
    const mensagemLower = mensagem.toLowerCase();
    
    if (mensagemLower.includes('melhor') || mensagemLower.includes('jogador')) {
      return "KSCERATO É O CARA! 1.35 RATING EM 2024! 🔥";
    }
    
    if (mensagemLower.includes('próximo') || mensagemLower.includes('jogo')) {
      return "28/05 CONTRA FAZE - VAMO DESTRUIR! 💣";
    }
    

    
    return "PERGUNTE SOBRE: MELHOR JOGADOR, PRÓXIMO JOGO OU ELENCO DA FURIA!";
  }
}


