/* =========================================================
   CONFIGURAÇÃO — edite aqui
   ========================================================= */

// Número do WhatsApp da lanchonete: código do país + DDD + número, só dígitos.
const WHATSAPP_NUMERO = "5518991113395";

const NOME_LOJA = "Lanche Brabo";

// Cardápio. Para adicionar um item, copie uma linha e troque id, nome, descrição e preço.
// O "id" precisa ser único.
const CARDAPIO = [
  {
    id: "lanches",
    titulo: "Lanches",
    nota: "Pão de brioche tostado na manteiga. Todos acompanham batata palha.",
    itens: [
      { id: "x-burger", nome: "X-Burger", descricao: "Hambúrguer 150 g, queijo prato, maionese da casa.", preco: 22.0, destaque: false },
      { id: "x-salada", nome: "X-Salada", descricao: "Hambúrguer 150 g, queijo, alface, tomate e cebola roxa.", preco: 24.0, destaque: false },
      { id: "x-bacon", nome: "X-Bacon", descricao: "Hambúrguer 150 g, queijo e muito bacon crocante.", preco: 27.0, destaque: true },
      { id: "x-egg", nome: "X-Egg", descricao: "Hambúrguer 150 g, queijo e ovo com gema mole.", preco: 25.0, destaque: false },
      { id: "x-tudo", nome: "X-Tudo", descricao: "Dois hambúrgueres, bacon, ovo, presunto, queijo, salada e calabresa.", preco: 36.0, destaque: true },
      { id: "frango", nome: "Frango Crispy", descricao: "Sobrecoxa empanada, queijo, alface e molho de mostarda e mel.", preco: 26.0, destaque: false },
      { id: "veggie", nome: "Veggie da Casa", descricao: "Hambúrguer de grão-de-bico, queijo, rúcula e tomate seco.", preco: 25.0, destaque: false },
      { id: "misto", nome: "Misto Quente", descricao: "Presunto e queijo na chapa, no pão de forma.", preco: 12.0, destaque: false },
    ],
  },
  {
    id: "bebidas",
    titulo: "Bebidas",
    nota: "Geladas de verdade.",
    itens: [
      { id: "refri-lata", nome: "Refrigerante lata", descricao: "Coca-Cola, Guaraná ou Soda · 350 ml.", preco: 6.0, destaque: false },
      { id: "refri-2l", nome: "Refrigerante 2 L", descricao: "Coca-Cola ou Guaraná.", preco: 14.0, destaque: false },
      { id: "suco", nome: "Suco natural", descricao: "Laranja, limão ou maracujá · 500 ml.", preco: 10.0, destaque: false },
      { id: "milkshake", nome: "Milkshake", descricao: "Chocolate, morango ou ovomaltine · 400 ml.", preco: 18.0, destaque: true },
      { id: "cha", nome: "Chá gelado", descricao: "Mate com limão da casa · 500 ml.", preco: 8.0, destaque: false },
      { id: "agua", nome: "Água mineral", descricao: "Com ou sem gás · 500 ml.", preco: 4.0, destaque: false },
    ],
  },
];

/* =========================================================
   A partir daqui não é preciso editar
   ========================================================= */

const STORAGE_KEY = "cardapio-comanda-v1";
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const itensPorId = new Map(CARDAPIO.flatMap((cat) => cat.itens.map((item) => [item.id, item])));

/** @type {Map<string, number>} id do item → quantidade */
const carrinho = carregarCarrinho();

const $ = (sel) => document.querySelector(sel);
const el = {
  tabs: $("#tabs"),
  menu: $("#cardapio"),
  ticket: $("#ticket"),
  ticketClose: $("#ticket-close"),
  empty: $("#ticket-empty"),
  lines: $("#ticket-lines"),
  totalRow: $("#ticket-total-row"),
  total: $("#ticket-total"),
  form: $("#order-form"),
  addressWrap: $("#address-wrap"),
  address: $("#customer-address"),
  clear: $("#clear-cart"),
  cartbar: $("#cartbar"),
  cartbarCount: $("#cartbar-count"),
  cartbarTotal: $("#cartbar-total"),
  scrim: $("#scrim"),
  toast: $("#toast"),
};

/* ---------- Persistência ---------- */

function carregarCarrinho() {
  try {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return new Map(salvo.filter(([id, qtd]) => itensPorId.has(id) && qtd > 0));
  } catch {
    return new Map();
  }
}

function salvarCarrinho() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...carrinho]));
  } catch {
    /* armazenamento indisponível: o carrinho segue funcionando só nesta visita */
  }
}

/* ---------- Helpers de DOM ---------- */

function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("data-") || k === "role") node.setAttribute(k, v);
    else if (k.startsWith("aria")) node.setAttribute(`aria-${k.slice(4).toLowerCase()}`, v);
    else node[k] = v;
  }
  node.append(...children.filter(Boolean));
  return node;
}

/* ---------- Cardápio ---------- */

function renderCardapio() {
  CARDAPIO.forEach((cat, i) => {
    el.tabs.append(h("a", { href: `#${cat.id}`, class: "tabs__link", text: cat.titulo }));

    const lista = h("ol", { class: "dishes" });
    cat.itens.forEach((item, j) => {
      const li = h(
        "li",
        { class: "dish", "data-id": item.id },
        h(
          "div",
          { class: "dish__line" },
          h("h3", { class: "dish__name", text: item.nome }),
          item.destaque ? h("span", { class: "dish__badge", text: "Mais pedido" }) : null,
          h("span", { class: "dish__leader", ariaHidden: "true" }),
          h("span", { class: "dish__price", text: brl.format(item.preco) })
        ),
        h("p", { class: "dish__desc", text: item.descricao }),
        h("div", { class: "dish__actions" })
      );
      li.style.setProperty("--i", j);
      lista.append(li);
    });

    const secao = h(
      "section",
      { class: "category", id: cat.id, ariaLabelledBy: `${cat.id}-title` },
      h(
        "header",
        { class: "category__head" },
        h("span", { class: "category__num", text: String(i + 1).padStart(2, "0"), ariaHidden: "true" }),
        h("h2", { class: "category__title", id: `${cat.id}-title`, text: cat.titulo }),
        cat.nota ? h("p", { class: "category__note", text: cat.nota }) : null
      ),
      lista
    );
    el.menu.append(secao);
  });

  el.menu.querySelectorAll(".dish").forEach(renderAcoes);
}

function renderAcoes(li) {
  const id = li.dataset.id;
  const item = itensPorId.get(id);
  const qtd = carrinho.get(id) || 0;
  const box = li.querySelector(".dish__actions");
  li.classList.toggle("is-in-cart", qtd > 0);

  if (qtd === 0) {
    box.replaceChildren(
      h("button", { type: "button", class: "btn-add", "data-action": "add", "data-id": id, ariaLabel: `Adicionar ${item.nome}`, text: "Adicionar" })
    );
    return;
  }

  box.replaceChildren(
    h(
      "div",
      { class: "stepper", role: "group", ariaLabel: `Quantidade de ${item.nome}` },
      h("button", { type: "button", "data-action": "dec", "data-id": id, ariaLabel: `Remover um ${item.nome}`, text: "−" }),
      h("output", { class: "stepper__qty", ariaLive: "polite", text: String(qtd) }),
      h("button", { type: "button", "data-action": "inc", "data-id": id, ariaLabel: `Adicionar mais um ${item.nome}`, text: "+" })
    )
  );
}

/* ---------- Comanda ---------- */

function totais() {
  let qtd = 0;
  let valor = 0;
  for (const [id, n] of carrinho) {
    qtd += n;
    valor += itensPorId.get(id).preco * n;
  }
  return { qtd, valor };
}

function renderComanda() {
  const { qtd, valor } = totais();
  const vazio = qtd === 0;

  el.empty.hidden = !vazio;
  el.totalRow.hidden = vazio;
  el.form.hidden = vazio;

  el.lines.replaceChildren(
    ...[...carrinho].map(([id, n]) => {
      const item = itensPorId.get(id);
      return h(
        "li",
        { class: "line" },
        h("span", { class: "line__qty", text: `${n}×` }),
        h("span", { class: "line__name", text: item.nome }),
        h("span", { class: "line__price", text: brl.format(item.preco * n) }),
        h("button", { type: "button", class: "line__remove", "data-action": "remove", "data-id": id, ariaLabel: `Tirar ${item.nome} da comanda`, text: "×" })
      );
    })
  );

  el.total.textContent = brl.format(valor);
  el.cartbar.hidden = vazio;
  el.cartbarCount.textContent = String(qtd);
  el.cartbarTotal.textContent = brl.format(valor);

  if (vazio) fecharComanda();
}

function alterar(id, delta) {
  const atual = carrinho.get(id) || 0;
  const novo = Math.max(0, Math.min(99, atual + delta));
  if (novo === 0) carrinho.delete(id);
  else carrinho.set(id, novo);

  salvarCarrinho();
  const li = el.menu.querySelector(`.dish[data-id="${CSS.escape(id)}"]`);
  if (li) renderAcoes(li);
  renderComanda();
  pulsarBarra();
}

function pulsarBarra() {
  el.cartbar.classList.remove("is-bump");
  void el.cartbar.offsetWidth; // reinicia a animação
  el.cartbar.classList.add("is-bump");
}

/* ---------- Gaveta (mobile) ---------- */

const mqDesktop = window.matchMedia("(min-width: 960px)");

function abrirComanda() {
  if (mqDesktop.matches) {
    el.ticket.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  el.ticket.classList.add("is-open");
  el.scrim.hidden = false;
  el.cartbar.setAttribute("aria-expanded", "true");
  document.body.classList.add("no-scroll");
  el.ticketClose.focus({ preventScroll: true });
}

function fecharComanda() {
  if (!el.ticket.classList.contains("is-open")) return;
  el.ticket.classList.remove("is-open");
  el.scrim.hidden = true;
  el.cartbar.setAttribute("aria-expanded", "false");
  document.body.classList.remove("no-scroll");
}

/* ---------- Pedido via WhatsApp ---------- */

function montarMensagem(dados) {
  const { valor } = totais();
  const linhas = [...carrinho].map(([id, n]) => {
    const item = itensPorId.get(id);
    return `• ${n}x ${item.nome} — ${brl.format(item.preco * n)}`;
  });

  const partes = [
    `Olá, ${NOME_LOJA}! Quero fazer um pedido:`,
    "",
    ...linhas,
    "",
    `*Total: ${brl.format(valor)}*`,
    "",
    `Nome: ${dados.nome}`,
    `Recebimento: ${dados.entrega}`,
  ];
  if (dados.entrega === "Entrega") partes.push(`Endereço: ${dados.endereco}`);
  if (dados.obs) partes.push(`Obs.: ${dados.obs}`);
  return partes.join("\n").replace(/ /g, " ");
}

function enviarPedido(evento) {
  evento.preventDefault();
  if (carrinho.size === 0) return;

  const fd = new FormData(el.form);
  const dados = {
    nome: String(fd.get("nome") || "").trim(),
    entrega: String(fd.get("entrega") || "Retirar no balcão"),
    endereco: String(fd.get("endereco") || "").trim(),
    obs: String(fd.get("obs") || "").trim(),
  };

  if (!dados.nome) {
    el.form.querySelector("#customer-name").focus();
    mostrarToast("Diga seu nome para a gente chamar 🙂");
    return;
  }
  if (dados.entrega === "Entrega" && !dados.endereco) {
    el.address.focus();
    mostrarToast("Falta o endereço de entrega.");
    return;
  }

  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(montarMensagem(dados))}`;
  window.open(url, "_blank", "noopener");
}

/* ---------- Toast ---------- */

let toastTimer;
function mostrarToast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove("is-visible"), 2400);
}

/* ---------- Abas ativas conforme rolagem ---------- */

function observarCategorias() {
  const links = new Map([...el.tabs.querySelectorAll("a")].map((a) => [a.hash.slice(1), a]));
  el.tabs.querySelector("a")?.setAttribute("aria-current", "true");
  const obs = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.removeAttribute("aria-current"));
        links.get(e.target.id)?.setAttribute("aria-current", "true");
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  el.menu.querySelectorAll(".category").forEach((s) => obs.observe(s));
}

/* ---------- Eventos ---------- */

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === "add" || action === "inc") {
    alterar(id, 1);
    if (action === "add") {
      mostrarToast(`${itensPorId.get(id).nome} na comanda`);
      // mantém o foco no controle recém-criado
      el.menu.querySelector(`.dish[data-id="${CSS.escape(id)}"] [data-action="inc"]`)?.focus();
    }
  } else if (action === "dec") {
    alterar(id, -1);
    if (!carrinho.has(id)) el.menu.querySelector(`.dish[data-id="${CSS.escape(id)}"] [data-action="add"]`)?.focus();
  } else if (action === "remove") {
    carrinho.delete(id);
    alterar(id, 0);
  }
});

el.cartbar.addEventListener("click", abrirComanda);
el.ticketClose.addEventListener("click", fecharComanda);
el.scrim.addEventListener("click", fecharComanda);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharComanda();
});
mqDesktop.addEventListener("change", fecharComanda);

el.form.addEventListener("change", (e) => {
  if (e.target.name !== "entrega") return;
  const entrega = e.target.value === "Entrega";
  el.addressWrap.hidden = !entrega;
  el.address.required = entrega;
});
el.form.addEventListener("submit", enviarPedido);

el.clear.addEventListener("click", () => {
  carrinho.clear();
  salvarCarrinho();
  el.menu.querySelectorAll(".dish").forEach(renderAcoes);
  renderComanda();
  mostrarToast("Comanda limpa.");
});

/* ---------- Início ---------- */

renderCardapio();
renderComanda();
observarCategorias();
