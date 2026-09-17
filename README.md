# ChessJS

Jogo de xadrez para dois jogadores feito em JavaScript puro, sem nenhuma
dependência externa. Basta abrir `Chess/index.html` no navegador.

**Status:** Jogável — todas as regras oficiais de movimento estão implementadas.

## Regras implementadas

- Movimento de todas as peças
- Roque grande e roque pequeno (com todas as restrições: peças que nunca se
  moveram, caminho livre, rei fora de xeque e sem passar por casa atacada)
- Captura _en passant_
- Promoção do peão, com escolha entre Dama, Torre, Bispo e Cavalo
- Xeque: só aparecem os lances que tiram o rei do xeque (peças cravadas ficam
  presas)
- Fim de jogo: xeque-mate, afogamento, material insuficiente, regra dos 50
  lances e tripla repetição de posição

## Como está organizado

| Arquivo      | Responsabilidade                                                                   |
| ------------ | ---------------------------------------------------------------------------------- |
| `motion.js`  | Regras do xadrez — geração de lances, xeque e fim de jogo. Não mexe no DOM.         |
| `script.js`  | Tabuleiro, estado da partida, cliques e interface.                                  |
| `index.html` | Estrutura da página.                                                                |
| `style.css`  | Estilo do tabuleiro, marcações dos lances e diálogo de promoção.                    |

O tabuleiro é representado por um `Map` onde a chave é a posição
(`coluna * 10 + linha`) e o valor é o nome da peça (`"Pawn White"`).
A coluna 0 é a esquerda e a linha 0 é o topo, então as brancas começam
nas linhas 6 e 7.
