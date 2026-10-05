/* =========================================================
   CONFIGURAÇÃO — edite aqui
   ========================================================= */

// Número do WhatsApp da barbearia: código do país + DDD + número, só dígitos.
const WHATSAPP_NUMERO = "5511999999999";

const NOME_LOJA = "Navalha & Cia";

// Horário de funcionamento por dia da semana (0 = domingo … 6 = sábado).
// null = fechado.
const EXPEDIENTE = {
  0: null,
  1: ["09:00", "20:00"],
  2: ["09:00", "20:00"],
  3: ["09:00", "20:00"],
  4: ["09:00", "20:00"],
  5: ["09:00", "20:00"],
  6: ["08:00", "18:00"],
};

const INTERVALO_MINUTOS = 30; // de quanto em quanto tempo aparecem os horários
const DIAS_NA_AGENDA = 8;     // quantos dias abertos mostrar a partir de hoje

const BARBEIROS = [
  { id: "qualquer", nome: "Sem preferência", especialidade: "Quem estiver livre primeiro" },
  { id: "joao",     nome: "João",            especialidade: "Clássicos e navalha" },
  { id: "rafa",     nome: "Rafa",            especialidade: "Degradê e desenhos" },
  { id: "leo",      nome: "Léo",             especialidade: "Barba e visagismo" },
];

// Serviços. "duracao" em minutos. O "id" precisa ser único.
const SERVICOS = [
  {
    id: "cabelo",
    titulo: "Cabelo",
    itens: [
      { id: "social",   nome: "Corte social",         descricao: "Tesoura e máquina, acabamento na navalha.", duracao: 30, preco: 35, destaque: false },
      { id: "degrade",  nome: "Degradê",              descricao: "Fade baixo, médio ou alto.",                duracao: 40, preco: 45, destaque: true },
      { id: "tesoura",  nome: "Corte na tesoura",     descricao: "Para quem quer manter comprimento.",        duracao: 45, preco: 50, destaque: false },
      { id: "maquina",  nome: "Máquina, um pente",    descricao: "Rápido e uniforme.",                        duracao: 20, preco: 30, destaque: false },
      { id: "infantil", nome: "Infantil",             descricao: "Até 10 anos.",                              duracao: 30, preco: 35, destaque: false },
    ],
  },
  {
    id: "barba",
    titulo: "Barba",
    itens: [
      { id: "barba-completa", nome: "Barba completa",      descricao: "Toalha quente, navalha e balm.", duracao: 30, preco: 40, destaque: true },
      { id: "barba-maquina",  nome: "Barba na máquina",    descricao: "Alinhamento e contorno.",        duracao: 15, preco: 25, destaque: false },
      { id: "pigmentacao",    nome: "Pigmentação de barba", descricao: "Preenche falhas.",              duracao: 20, preco: 35, destaque: false },
    ],
  },
  {
    id: "combos",
    titulo: "Combos",
    itens: [
      { id: "corte-barba",   nome: "Corte + barba",    descricao: "Corte social e barba completa.",                      duracao: 60, preco: 70,  destaque: true },
      { id: "degrade-barba", nome: "Degradê + barba",  descricao: "Degradê e barba completa.",                           duracao: 70, preco: 80,  destaque: false },
      { id: "noivo",         nome: "Dia do noivo",     descricao: "Corte, barba, sobrancelha, hidratação e uma cerveja.", duracao: 120, preco: 180, destaque: false },
    ],
  },
  {
    id: "extras",
    titulo: "Extras",
    itens: [
      { id: "sobrancelha", nome: "Sobrancelha",  descricao: "Na navalha ou pinça.",         duracao: 10, preco: 15, destaque: false },
      { id: "hidratacao",  nome: "Hidratação",   descricao: "Cabelo ou barba.",             duracao: 20, preco: 30, destaque: false },
      { id: "pezinho",     nome: "Pezinho",      descricao: "Só o acabamento entre cortes.", duracao: 10, preco: 15, destaque: false },
    ],
  },
];

/* =========================================================
   A partir daqui não é preciso editar
   ========================================================= */

const STORAGE_KEY = "barbearia-agendamento-v1";
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const fmtDiaSemana = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const fmtDiaLongo = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });

const servicoPorId = new Map(SERVICOS.flatMap((g) => g.itens.map((s) => [s.id, s])));
const barbeiroPorId = new Map(BARBEIROS.map((b) => [b.id, b]));

const estado = carregarEstado();

const $ = (sel) => document.querySelector(sel);
const el = {
  servicos: $("#servicos"),
  barbeiros: $("#barbeiros"),
  dias: $("#dias"),
  horariosGrid: $("#horarios-grid"),
  horariosLegenda: $("#horarios-legenda"),
  statusServicos: $("#status-servicos"),
  statusBarbeiro: $("#status-barbeiro"),
  statusQuando: $("#status-quando"),
  summary: $("#summary"),
  summaryClose: $("#summary-close"),
  empty: $("#summary-empty"),
  lines: $("#summary-lines"),
  totals: $("#summary-totals"),
  totalDuracao: $("#total-duracao"),
  totalPreco: $("#total-preco"),
  when: $("#summary-when"),
  resumoBarbeiro: $("#resumo-barbeiro"),
  resumoQuando: $("#resumo-quando"),
  form: $("#booking-form"),
  nome: $("#client-name"),
  clear: $("#clear-booking"),
  bookbar: $("#bookbar"),
  bookbarCount: $("#bookbar-count"),
  bookbarMeta: $("#bookbar-meta"),
  scrim: $("#scrim"),
  toast: $("#toast"),
};

/* ---------- Persistência (serviços e profissional; dia/hora não) ---------- */

function carregarEstado() {
  const base = { servicos: new Set(), barbeiro: "qualquer", data: null, hora: null };
  try {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (Array.isArray(salvo.servicos)) base.servicos = new Set(salvo.servicos.filter((id) => servicoPorId.has(id)));
    if (barbeiroPorId.has(salvo.barbeiro)) base.barbeiro = salvo.barbeiro;
  } catch {
    /* sem armazenamento: começa vazio */
  }
  return base;
}

function salvarEstado() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ servicos: [...estado.servicos], barbeiro: estado.barbeiro }));
  } catch {
    /* armazenamento indisponível */
  }
}

/* ---------- Helpers ---------- */

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

const paraMinutos = (hhmm) => {
  const [hh, mm] = hhmm.split(":").map(Number);
  return hh * 60 + mm;
};
const paraHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

function formatarDuracao(min) {
  if (min < 60) return `${min} min`;
  const hh = Math.floor(min / 60);
  const mm = min % 60;
  return mm ? `${hh}h${String(mm).padStart(2, "0")}` : `${hh}h`;
}

function isoLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function deIso(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d);
}

function totais() {
  let duracao = 0;
  let preco = 0;
  for (const id of estado.servicos) {
    const s = servicoPorId.get(id);
    duracao += s.duracao;
    preco += s.preco;
  }
  return { qtd: estado.servicos.size, duracao, preco };
}

/* ---------- I. Serviços ---------- */

function renderServicos() {
  SERVICOS.forEach((grupo) => {
    const lista = h("ul", { class: "services" });
    grupo.itens.forEach((s, i) => {
      const btn = h(
        "button",
        { type: "button", class: "service", "data-servico": s.id, ariaPressed: "false" },
        h("span", { class: "service__check", ariaHidden: "true" }),
        h(
          "span",
          { class: "service__body" },
          h(
            "span",
            { class: "service__name" },
            s.nome,
            s.destaque ? h("span", { class: "service__badge", text: "Favorito" }) : null
          ),
          h("span", { class: "service__desc", text: s.descricao })
        ),
        h(
          "span",
          { class: "service__meta" },
          h("span", { class: "service__price", text: brl.format(s.preco) }),
          h("span", { class: "service__time", text: formatarDuracao(s.duracao) })
        )
      );
      const li = h("li", {}, btn);
      li.style.setProperty("--i", i);
      lista.append(li);
    });
    el.servicos.append(h("div", { class: "group" }, h("h3", { class: "group__title", text: grupo.titulo }), lista));
  });
}

function atualizarServicos() {
  el.servicos.querySelectorAll(".service").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(estado.servicos.has(btn.dataset.servico)));
  });
  const { qtd, duracao } = totais();
  el.statusServicos.textContent = qtd ? `${qtd} ${qtd === 1 ? "escolhido" : "escolhidos"} · ${formatarDuracao(duracao)}` : "Escolha um ou mais";
  el.statusServicos.classList.toggle("is-done", qtd > 0);
}

/* ---------- II. Profissional ---------- */

function iniciais(nome) {
  return nome === "Sem preferência" ? "?" : nome.slice(0, 1).toUpperCase();
}

function renderBarbeiros() {
  BARBEIROS.forEach((b) => {
    el.barbeiros.append(
      h(
        "label",
        { class: "barber" },
        h("input", { type: "radio", name: "barbeiro", value: b.id, checked: b.id === estado.barbeiro }),
        h("span", { class: "barber__mono", ariaHidden: "true", text: iniciais(b.nome) }),
        h("span", { class: "barber__name", text: b.nome }),
        h("span", { class: "barber__spec", text: b.especialidade })
      )
    );
  });
}

/* ---------- III. Dia e horário ---------- */

function proximosDias() {
  const dias = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let tentativas = 0; dias.length < DIAS_NA_AGENDA && tentativas < 60; tentativas++) {
    if (horariosDoDia(d, 0).some((x) => x.disponivel)) dias.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dias;
}

function horariosDoDia(dia, duracao) {
  const exp = EXPEDIENTE[dia.getDay()];
  if (!exp) return [];
  const abre = paraMinutos(exp[0]);
  const fecha = paraMinutos(exp[1]);
  const ultimoInicio = fecha - Math.max(duracao, INTERVALO_MINUTOS);

  let minimo = abre;
  const agora = new Date();
  if (isoLocal(dia) === isoLocal(agora)) {
    // hoje: só a partir de 30 min daqui pra frente
    const daquiAPouco = agora.getHours() * 60 + agora.getMinutes() + 30;
    minimo = Math.max(abre, Math.ceil(daquiAPouco / INTERVALO_MINUTOS) * INTERVALO_MINUTOS);
  }

  const lista = [];
  for (let m = abre; m <= ultimoInicio; m += INTERVALO_MINUTOS) {
    lista.push({ hora: paraHHMM(m), disponivel: m >= minimo });
  }
  return lista;
}

function rotuloDia(d) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const diff = Math.round((d - hoje) / 86400000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  return fmtDiaSemana.format(d).replace(".", "");
}

function renderDias() {
  const dias = proximosDias();
  el.dias.querySelectorAll(".day").forEach((n) => n.remove());
  dias.forEach((d) => {
    const iso = isoLocal(d);
    el.dias.append(
      h(
        "label",
        { class: "day" },
        h("input", { type: "radio", name: "dia", value: iso, checked: iso === estado.data }),
        h("span", { class: "day__week", text: rotuloDia(d) }),
        h("span", { class: "day__num", text: String(d.getDate()).padStart(2, "0") }),
        h("span", { class: "day__month", text: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "") })
      )
    );
  });
}

function renderHorarios() {
  el.horariosGrid.replaceChildren();
  if (!estado.data) {
    el.horariosLegenda.textContent = "Horários";
    el.horariosGrid.append(h("p", { class: "slots__hint", text: "Escolha um dia acima para ver os horários." }));
    return;
  }

  const { duracao } = totais();
  const horarios = horariosDoDia(deIso(estado.data), duracao);
  const livres = horarios.filter((x) => x.disponivel);

  if (estado.hora && !livres.some((x) => x.hora === estado.hora)) estado.hora = null;

  el.horariosLegenda.textContent = duracao
    ? `Horários para ${formatarDuracao(duracao)} de atendimento`
    : "Horários";

  if (!livres.length) {
    el.horariosGrid.append(h("p", { class: "slots__hint", text: "Sem horários livres neste dia. Tente o próximo." }));
    return;
  }

  horarios.forEach((x) => {
    el.horariosGrid.append(
      h(
        "label",
        { class: "slot" },
        h("input", { type: "radio", name: "hora", value: x.hora, disabled: !x.disponivel, checked: x.hora === estado.hora }),
        h("span", { text: x.hora })
      )
    );
  });
}

function atualizarQuando() {
  if (estado.data && estado.hora) {
    el.statusQuando.textContent = `${rotuloDia(deIso(estado.data))}, ${estado.hora}`;
  } else if (estado.data) {
    el.statusQuando.textContent = "Escolha o horário";
  } else {
    el.statusQuando.textContent = "Escolha o dia";
  }
  el.statusQuando.classList.toggle("is-done", Boolean(estado.data && estado.hora));
  el.statusBarbeiro.textContent = barbeiroPorId.get(estado.barbeiro).nome;
  el.statusBarbeiro.classList.add("is-done");
}

/* ---------- Resumo ---------- */

function textoQuando() {
  if (!estado.data || !estado.hora) return null;
  const d = deIso(estado.data);
  const longo = fmtDiaLongo.format(d); // "sexta-feira, 10/10"
  return `${longo.charAt(0).toUpperCase()}${longo.slice(1)}, às ${estado.hora}`;
}

function renderResumo() {
  const { qtd, duracao, preco } = totais();
  const vazio = qtd === 0;

  el.empty.hidden = !vazio;
  el.totals.hidden = vazio;
  el.when.hidden = vazio;
  el.form.hidden = vazio;

  el.lines.replaceChildren(
    ...[...estado.servicos].map((id) => {
      const s = servicoPorId.get(id);
      return h(
        "li",
        { class: "line" },
        h("span", { class: "line__name", text: s.nome }),
        h("span", { class: "line__price", text: brl.format(s.preco) }),
        h("button", { type: "button", class: "line__remove", "data-remover": id, ariaLabel: `Tirar ${s.nome}`, text: "×" })
      );
    })
  );

  el.totalDuracao.textContent = formatarDuracao(duracao);
  el.totalPreco.textContent = brl.format(preco);
  el.resumoBarbeiro.textContent = barbeiroPorId.get(estado.barbeiro).nome;
  const quando = textoQuando();
  el.resumoQuando.textContent = quando || "Escolha dia e horário";
  el.resumoQuando.classList.toggle("is-missing", !quando);

  el.bookbar.hidden = vazio;
  el.bookbarCount.textContent = `${qtd} ${qtd === 1 ? "serviço" : "serviços"} · ${brl.format(preco)}`;
  el.bookbarMeta.textContent = quando ? `${rotuloDia(deIso(estado.data))}, ${estado.hora} · ${barbeiroPorId.get(estado.barbeiro).nome}` : formatarDuracao(duracao);

  if (vazio) fecharResumo();
}

function atualizarTudo() {
  atualizarServicos();
  renderHorarios();
  atualizarQuando();
  renderResumo();
  salvarEstado();
}

/* ---------- Gaveta (mobile) ---------- */

const mqDesktop = window.matchMedia("(min-width: 960px)");

function abrirResumo() {
  if (mqDesktop.matches) return;
  el.summary.classList.add("is-open");
  el.scrim.hidden = false;
  el.bookbar.setAttribute("aria-expanded", "true");
  document.body.classList.add("no-scroll");
  el.summaryClose.focus({ preventScroll: true });
}

function fecharResumo() {
  if (!el.summary.classList.contains("is-open")) return;
  el.summary.classList.remove("is-open");
  el.scrim.hidden = true;
  el.bookbar.setAttribute("aria-expanded", "false");
  document.body.classList.remove("no-scroll");
}

/* ---------- Agendar via WhatsApp ---------- */

function montarMensagem(nome, obs) {
  const { duracao, preco } = totais();
  const linhas = [...estado.servicos].map((id) => {
    const s = servicoPorId.get(id);
    return `• ${s.nome} — ${brl.format(s.preco)} (${formatarDuracao(s.duracao)})`;
  });

  const partes = [
    `Olá, ${NOME_LOJA}! Gostaria de agendar:`,
    "",
    ...linhas,
    "",
    `*Total: ${brl.format(preco)} · ${formatarDuracao(duracao)}*`,
    "",
    `Profissional: ${barbeiroPorId.get(estado.barbeiro).nome}`,
    `Quando: ${textoQuando()}`,
    `Nome: ${nome}`,
  ];
  if (obs) partes.push(`Obs.: ${obs}`);
  partes.push("", "Pode confirmar?");
  return partes.join("\n").replace(/ /g, " ");
}

function irPara(seletor) {
  const alvo = document.querySelector(seletor);
  fecharResumo();
  alvo?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function agendar(evento) {
  evento.preventDefault();
  if (!estado.servicos.size) return;

  if (!estado.data) {
    mostrarToast("Falta escolher o dia.");
    irPara("#dias");
    return;
  }
  if (!estado.hora) {
    mostrarToast("Falta escolher o horário.");
    irPara("#horarios");
    return;
  }

  const nome = el.nome.value.trim();
  if (!nome) {
    el.nome.focus();
    mostrarToast("Diga seu nome para a gente te chamar.");
    return;
  }

  const obs = String(new FormData(el.form).get("obs") || "").trim();
  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(montarMensagem(nome, obs))}`;
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

/* ---------- Eventos ---------- */

el.servicos.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-servico]");
  if (!btn) return;
  const id = btn.dataset.servico;
  if (estado.servicos.has(id)) estado.servicos.delete(id);
  else estado.servicos.add(id);
  atualizarTudo();
});

el.lines.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-remover]");
  if (!btn) return;
  estado.servicos.delete(btn.dataset.remover);
  atualizarTudo();
});

el.barbeiros.addEventListener("change", (e) => {
  estado.barbeiro = e.target.value;
  atualizarTudo();
});

el.dias.addEventListener("change", (e) => {
  estado.data = e.target.value;
  atualizarTudo();
});

el.horariosGrid.addEventListener("change", (e) => {
  estado.hora = e.target.value;
  atualizarTudo();
  if (!estado.servicos.size) mostrarToast("Agora escolha os serviços lá em cima.");
});

el.bookbar.addEventListener("click", abrirResumo);
el.summaryClose.addEventListener("click", fecharResumo);
el.scrim.addEventListener("click", fecharResumo);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharResumo();
});
mqDesktop.addEventListener("change", fecharResumo);

el.form.addEventListener("submit", agendar);

el.clear.addEventListener("click", () => {
  estado.servicos.clear();
  estado.barbeiro = "qualquer";
  estado.data = null;
  estado.hora = null;
  el.barbeiros.querySelector('input[value="qualquer"]').checked = true;
  el.dias.querySelectorAll("input").forEach((i) => (i.checked = false));
  atualizarTudo();
  mostrarToast("Tudo limpo. Vamos de novo?");
});

/* ---------- Início ---------- */

renderServicos();
renderBarbeiros();
renderDias();
atualizarTudo();
