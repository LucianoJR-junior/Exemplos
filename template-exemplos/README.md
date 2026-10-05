# Modelos de sites para pequenos negócios

Três exemplos em HTML, CSS e JavaScript puro, todos terminando em uma mensagem de WhatsApp para o negócio. A página inicial ([index.html](index.html)) mostra um print de cada um, com um botão para abrir o exemplo.

```
index.html              página inicial com os três exemplos
assets/                 prints usados na página inicial
Cardapio-Exemplo/       lanchonete — cardápio com carrinho
Barbearia-Exemplo/      barbearia — agendamento de horário
Servicos-Exemplo/       prestação de serviços — landing page com orçamento
```

Cada pasta tem o próprio `README.md` explicando o que personalizar.

## Rodar localmente

Abra o `index.html` da raiz no navegador, ou use a extensão **Live Server** do VS Code (botão direito no arquivo → *Open with Live Server*).

## Publicar no GitHub Pages

1. Envie esta pasta inteira para um repositório no GitHub.
2. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
3. Em um ou dois minutos o site fica no ar:
   - Página inicial: `https://SEU-USUARIO.github.io/REPOSITORIO/`
   - Cada exemplo: `https://SEU-USUARIO.github.io/REPOSITORIO/Cardapio-Exemplo/` (e assim por diante)

## Atualizar os prints

Os prints em `assets/` são capturas de 1280 × 800 do topo de cada página. Se você mudar o visual de um exemplo, tire um novo print nesse tamanho e substitua o arquivo com o mesmo nome (`preview-cardapio.png`, `preview-barbearia.png` ou `preview-servicos.png`).

## Adicionar um novo exemplo

1. Crie uma pasta `NomeDoExemplo-Exemplo/` com `index.html`, `style.css`, `script.js` e `README.md`.
2. Salve um print em `assets/preview-nome.png`.
3. No `index.html` da raiz, copie um bloco `<li class="example …">`, troque textos, links e imagem, e adicione uma cor de destaque em `.example--nome`.
