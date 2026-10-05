# Agendamento de barbearia — Navalha & Cia

Página única em HTML, CSS e JavaScript puro. O cliente escolhe os serviços, o profissional, o dia e o horário, e toca em **Agendar pelo WhatsApp**, que abre a conversa com a barbearia com o pedido de horário já escrito.

Não precisa de servidor, banco de dados nem build.

```
index.html   estrutura da página
style.css    visual
script.js    serviços, barbeiros, agenda e envio para o WhatsApp
```

## Personalizar

Tudo que muda de uma barbearia para outra fica no topo do [script.js](script.js):

| O quê | Onde |
| --- | --- |
| Número do WhatsApp | `WHATSAPP_NUMERO` — só dígitos, com país e DDD. Ex.: `5511987654321` |
| Nome usado na mensagem | `NOME_LOJA` |
| Horário de funcionamento | `EXPEDIENTE` — abertura e fechamento por dia da semana (`0` = domingo). `null` = fechado |
| De quanto em quanto tempo aparecem os horários | `INTERVALO_MINUTOS` |
| Quantos dias aparecem na agenda | `DIAS_NA_AGENDA` |
| Barbeiros | `BARBEIROS` — mantenha o "Sem preferência" se quiser essa opção |
| Serviços, preços e duração | `SERVICOS` — `duracao` em minutos; `destaque: true` mostra "Favorito" |

No [index.html](index.html), troque o nome, o endereço e o horário exibidos no topo e no rodapé.

## Como a agenda funciona

- Os dias e horários vêm do `EXPEDIENTE`. Dias fechados não aparecem.
- Hoje só aparecem horários a partir de 30 minutos depois do momento atual.
- O último horário oferecido respeita a duração somada dos serviços escolhidos: um combo de 2 h não aparece às 19h30 se a barbearia fecha às 20h.
- A página **não** sabe quais horários já foram ocupados — não há banco de dados. Por isso a mensagem termina com "Pode confirmar?" e a barbearia confirma pela conversa.

## Como o pedido chega

```
Olá, Navalha & Cia! Gostaria de agendar:

• Degradê — R$ 45,00 (40 min)
• Barba completa — R$ 40,00 (30 min)

*Total: R$ 85,00 · 1h10*

Profissional: Rafa
Quando: Terça-feira, 06/10, às 14:30
Nome: Ana
Obs.: manter em cima

Pode confirmar?
```

## Rodar localmente e publicar

Abra o `index.html` no navegador ou use a extensão **Live Server** do VS Code. Para publicar no GitHub Pages, veja o passo a passo no [README do cardápio](../Cardapio-Exemplo/README.md#publicar-no-github-pages).
