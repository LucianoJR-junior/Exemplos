# Landing page de prestação de serviços — Prumo Reparos

Página única em HTML, CSS e JavaScript puro para uma empresa de manutenção residencial (elétrica, hidráulica, pintura, montagem, instalações e pequenas reformas). Todo contato termina no WhatsApp: pelos botões "Chamar no WhatsApp" ou pelo formulário de orçamento, que abre a conversa com o pedido já escrito.

Não precisa de servidor, banco de dados nem build.

```
index.html   textos e seções da página
style.css    visual
script.js    serviços, bairros, formulário e links do WhatsApp
```

## Seções

1. **Topo** — chamada principal, dois botões e três garantias.
2. **Serviços** — cada um com exemplos, preço de referência e botão "Orçar este", que já marca o serviço no formulário.
3. **Como funciona** — três passos.
4. **Por que a Prumo** — diferenciais.
5. **Depoimentos** — ⚠️ são de exemplo; troque pelos reais dos seus clientes.
6. **Área de atendimento** — bairros.
7. **Dúvidas** — perguntas frequentes que abrem e fecham.
8. **Orçamento** — formulário que envia para o WhatsApp.

O botão verde flutuante aparece depois do topo e some quando o formulário está na tela.

## Personalizar

No topo do [script.js](script.js):

| O quê | Onde |
| --- | --- |
| Número do WhatsApp | `WHATSAPP_NUMERO` — só dígitos, com país e DDD. Ex.: `5511987654321` |
| Nome usado na mensagem | `NOME_EMPRESA` |
| Mensagem dos botões rápidos | `MENSAGEM_RAPIDA` |
| Serviços, exemplos e preço | `SERVICOS` — `aPartirDe: null` mostra "Sob orçamento" |
| Bairros atendidos | `BAIRROS` — também viram sugestões no campo "Bairro" |

No [index.html](index.html) ficam os textos: chamada principal, passos, diferenciais, depoimentos, perguntas frequentes, horário, endereço, CNPJ e e-mail.

Para trocar de ramo (jardinagem, limpeza, dedetização, assistência técnica…), basta mudar `SERVICOS`, `BAIRROS` e os textos do `index.html` — a estrutura serve para qualquer prestador de serviço.

## Como o pedido chega

```
Olá, Prumo Reparos! Gostaria de um orçamento.

*Serviço:* Elétrica
*O que precisa:* Tomada da cozinha não funciona
*Para quando:* É urgente
*Melhor período:* Manhã
*Bairro:* Moema

Meu nome é Ana.
```

## Rodar localmente e publicar

Abra o `index.html` no navegador ou use a extensão **Live Server** do VS Code. Para publicar no GitHub Pages, veja o passo a passo no [README do cardápio](../Cardapio-Exemplo/README.md#publicar-no-github-pages).
