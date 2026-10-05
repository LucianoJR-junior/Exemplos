/* =========================================================
   CONFIGURAÇÃO — edite aqui
   ========================================================= */

// Número do WhatsApp da empresa: código do país + DDD + número, só dígitos.
const WHATSAPP_NUMERO = "5518991113395";

const NOME_EMPRESA = "Prumo Reparos";

// Mensagem dos botões "Chamar no WhatsApp" (os que não passam pelo formulário).
const MENSAGEM_RAPIDA = "Olá! Vim pelo site e gostaria de um orçamento.";

// Serviços. "aPartirDe" é o valor de referência exibido; use null para não mostrar preço.
const SERVICOS = [
  {
    id: "eletrica",
    nome: "Elétrica",
    descricao: "Tomadas, disjuntores, chuveiro, iluminação e quadro de distribuição.",
    exemplos: ["Troca de tomada ou interruptor", "Instalação de chuveiro", "Luminárias e lustres"],
    aPartirDe: 90,
  },
  {
    id: "hidraulica",
    nome: "Hidráulica",
    descricao: "Vazamentos, torneiras, descargas, sifões e caixa d'água.",
    exemplos: ["Vazamento em pia ou vaso", "Troca de torneira ou registro", "Limpeza de caixa d'água"],
    aPartirDe: 110,
  },
  {
    id: "pintura",
    nome: "Pintura",
    descricao: "Paredes, tetos, portas e retoques, com proteção de móveis e piso.",
    exemplos: ["Um cômodo completo", "Retoque e massa corrida", "Portas e rodapés"],
    aPartirDe: 450,
  },
  {
    id: "montagem",
    nome: "Montagem de móveis",
    descricao: "Guarda-roupas, cozinhas, estantes e móveis de escritório.",
    exemplos: ["Guarda-roupa", "Rack e painel de TV", "Cama, cômoda e escrivaninha"],
    aPartirDe: 120,
  },
  {
    id: "instalacoes",
    nome: "Instalações",
    descricao: "Suporte de TV, cortinas, prateleiras, varal e espelhos.",
    exemplos: ["Suporte de TV na parede", "Varão e persiana", "Prateleiras e nichos"],
    aPartirDe: 80,
  },
  {
    id: "reformas",
    nome: "Pequenas reformas",
    descricao: "Drywall, rejunte, troca de piso pontual e acabamentos.",
    exemplos: ["Parede ou forro de drywall", "Rejunte de banheiro", "Troca de revestimento"],
    aPartirDe: null,
  },
];

// Bairros onde a visita técnica é grátis (também aparecem como sugestão no formulário).
const BAIRROS = [
  "Centro", "Bela Vista", "Liberdade", "Aclimação", "Cambuci", "Vila Mariana",
  "Ipiranga", "Saúde", "Moema", "Vila Clementino", "Jabaquara", "Campo Belo",
];

/* =========================================================
   A partir daqui não é preciso editar
   ========================================================= */

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const servicoPorId = new Map(SERVICOS.map((s) => [s.id, s]));
const linkWhatsApp = (texto) => `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;

const $ = (sel) => document.querySelector(sel);
const el = {
  lista: $("#lista-servicos"),
  chips: $("#chips-servicos"),
  bairros: $("#lista-bairros"),
  datalist: $("#bairros"),
  form: $("#form-orcamento"),
  descricao: $("#f-descricao"),
  nome: $("#f-nome"),
  bairro: $("#f-bairro"),
  erro: $("#form-erro"),
  fab: $(".fab"),
  hero: $(".hero"),
  orcamento: $("#orcamento"),
};

function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("data-") || k === "role" || k === "for") node.setAttribute(k, v);
    else if (k.startsWith("aria")) node.setAttribute(`aria-${k.slice(4).toLowerCase()}`, v);
    else node[k] = v;
  }
  node.append(...children.filter(Boolean));
  return node;
}

/* ---------- Conteúdo ---------- */

function renderServicos() {
  SERVICOS.forEach((s, i) => {
    el.lista.append(
      h(
        "li",
        { class: "service" },
        h("span", { class: "service__num", ariaHidden: "true", text: String(i + 1).padStart(2, "0") }),
        h("h3", { class: "service__name", text: s.nome }),
        h("p", { class: "service__desc", text: s.descricao }),
        h("ul", { class: "service__examples" }, ...s.exemplos.map((x) => h("li", { text: x }))),
        h(
          "div",
          { class: "service__foot" },
          h(
            "p",
            { class: "service__price" },
            s.aPartirDe == null ? "Sob orçamento" : h("span", {}, "a partir de ", h("strong", { text: brl.format(s.aPartirDe) }))
          ),
          h("button", { type: "button", class: "service__cta", "data-orcar": s.id, text: "Orçar este" })
        )
      )
    );

    el.chips.append(
      h(
        "label",
        { class: "chip" },
        h("input", { type: "checkbox", name: "servico", value: s.id }),
        h("span", { text: s.nome })
      )
    );
  });
}

function renderBairros() {
  BAIRROS.forEach((b) => {
    el.bairros.append(h("li", { text: b }));
    el.datalist.append(h("option", { value: b }));
  });
}

function ligarWhatsApp() {
  document.querySelectorAll("[data-whatsapp]").forEach((a) => {
    a.href = linkWhatsApp(MENSAGEM_RAPIDA);
    a.target = "_blank";
    a.rel = "noopener";
  });
}

/* ---------- "Orçar este" → marca o serviço no formulário ---------- */

el.lista.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-orcar]");
  if (!btn) return;
  const chip = el.chips.querySelector(`input[value="${CSS.escape(btn.dataset.orcar)}"]`);
  if (chip) chip.checked = true;
  el.orcamento.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => el.descricao.focus({ preventScroll: true }), 500);
});

/* ---------- Formulário → WhatsApp ---------- */

function montarMensagem(d) {
  const partes = [
    `Olá, ${NOME_EMPRESA}! Gostaria de um orçamento.`,
    "",
    `*Serviço:* ${d.servicos.length ? d.servicos.join(", ") : "A definir"}`,
  ];
  if (d.descricao) partes.push(`*O que precisa:* ${d.descricao}`);
  partes.push(
    `*Para quando:* ${d.urgencia}`,
    `*Melhor período:* ${d.periodo}`,
    `*Bairro:* ${d.bairro}`,
    "",
    `Meu nome é ${d.nome}.`
  );
  return partes.join("\n");
}

function mostrarErro(msg, campo) {
  el.erro.textContent = msg;
  campo?.focus();
  campo?.setAttribute("aria-invalid", "true");
}

el.form.addEventListener("input", (e) => {
  e.target.removeAttribute?.("aria-invalid");
  el.erro.textContent = "";
});

el.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(el.form);
  const dados = {
    servicos: fd.getAll("servico").map((id) => servicoPorId.get(id)?.nome).filter(Boolean),
    descricao: String(fd.get("descricao") || "").trim(),
    urgencia: String(fd.get("urgencia") || "Esta semana"),
    periodo: String(fd.get("periodo") || "Tanto faz"),
    nome: String(fd.get("nome") || "").trim(),
    bairro: String(fd.get("bairro") || "").trim(),
  };

  if (!dados.servicos.length && !dados.descricao) {
    return mostrarErro("Marque um serviço ou descreva o que precisa.", el.descricao);
  }
  if (!dados.nome) return mostrarErro("Falta o seu nome.", el.nome);
  if (!dados.bairro) return mostrarErro("Em qual bairro é o serviço?", el.bairro);

  window.open(linkWhatsApp(montarMensagem(dados)), "_blank", "noopener");
});

/* ---------- Botão flutuante: aparece depois do topo, some no formulário ---------- */

function observarFab() {
  const visivel = { hero: true, form: false };
  const atualizar = () => (el.fab.hidden = visivel.hero || visivel.form);
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => {
      if (en.target === el.hero) visivel.hero = en.isIntersecting;
      if (en.target === el.orcamento) visivel.form = en.isIntersecting;
    });
    atualizar();
  });
  obs.observe(el.hero);
  obs.observe(el.orcamento);
}

/* ---------- Revelar seções ao rolar ---------- */

function revelarAoRolar() {
  const alvos = document.querySelectorAll(".section__head, .service, .step, .quote, .why__list li");
  if (!("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("js-reveal");
  const obs = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        obs.unobserve(en.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  alvos.forEach((a) => obs.observe(a));
}

/* ---------- Início ---------- */

renderServicos();
renderBairros();
ligarWhatsApp();
observarFab();
revelarAoRolar();
