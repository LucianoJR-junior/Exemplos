# Cardápio digital — Lanche Bom

Página única em HTML, CSS e JavaScript puro. O cliente escolhe lanches e bebidas, monta a comanda (carrinho) e toca em **Fazer pedido**, que abre o WhatsApp da lanchonete com o pedido já escrito.

Não precisa de servidor, banco de dados nem build: são só três arquivos.

```
index.html   estrutura da página
style.css    visual
script.js    cardápio, carrinho e envio para o WhatsApp
```

## Personalizar

Tudo que muda de uma lanchonete para outra fica no topo do [script.js](script.js):

| O quê | Onde |
| --- | --- |
| Número do WhatsApp | `WHATSAPP_NUMERO` — só dígitos, com país e DDD. Ex.: `5511987654321` |
| Nome usado na mensagem | `NOME_LOJA` |
| Itens, descrições e preços | `CARDAPIO` — copie uma linha de item e altere. `destaque: true` mostra o selo "Mais pedido" |
| Nova categoria (ex.: Porções) | adicione um bloco `{ id, titulo, nota, itens: [...] }` em `CARDAPIO` |

No [index.html](index.html), troque o nome no `<title>`, no título grande, o horário de funcionamento e o endereço do rodapé.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `cardapio`) e envie os arquivos:
   ```bash
   git init
   git add .
   git commit -m "Cardápio digital"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/cardapio.git
   git push -u origin main
   ```
   Ou, pelo site: **Add file → Upload files** e arraste os três arquivos.
2. No repositório, vá em **Settings → Pages**.
3. Em **Build and deployment → Source**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
4. Em um ou dois minutos o cardápio fica no ar em `https://SEU-USUARIO.github.io/cardapio/`.

## Como o pedido chega

```
Olá, Lanche Bom! Quero fazer um pedido:

• 2x X-Bacon — R$ 54,00
• 1x Milkshake — R$ 18,00

*Total: R$ 72,00*

Nome: Ana
Recebimento: Entrega
Endereço: Rua A, 1
Obs.: sem cebola
```

A comanda fica salva no navegador do cliente: se ele fechar a aba e voltar, os itens continuam lá.
