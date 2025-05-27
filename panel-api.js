
const API_LIST   = 'https://auto.pfklabs.online/webhook/80485644-4cf1-4c68-b8f5-a54b8af3fe01';
const API_UPDATE = 'https://auto.pfklabs.online/webhook/update-status';
const REFRESH_MS = 30_000;

const etapaToCol = { 10: 'todo', 70: 'aproduzir', 80: 'doing', 90: 'done' };
const colToEtapa = { todo: 10, aproduzir: 70, doing: 80, done: 90 };

const cols = {
  todo: document.getElementById('todo'),
  aproduzir: document.getElementById('aproduzir'),
  doing: document.getElementById('doing'),
  done: document.getElementById('done')
};

document.getElementById('refresh-btn').addEventListener('click', loadBoard);
initDnD();
loadBoard();
setInterval(loadBoard, REFRESH_MS);

async function loadBoard() {
  try {
    const pedidos = await fetch(API_LIST).then(r => r.json());
    Object.values(cols).forEach(c => c.innerHTML = '');
    pedidos.forEach(p => {
      const colId = etapaToCol[p.infAdicionais?.cEtapa] || 'todo';
      cols[colId].appendChild(makeCard(p));
    });
  } catch (e) {
    console.error('Erro ao carregar painel', e);
  }
}

function makeCard(p) {
  const div = document.createElement('div');
  div.className = 'card';
  div.dataset.id = p.idProduto;
  div.innerHTML = `
    <span class="card-title">${p.nomeProduto}</span>
    <span class="card-op">OP: ${p.infAdicionais?.cNumOP || '-'}</span>
    <span class="card-prev">Prev.: ${p.infAdicionais?.DtPrevisao || '-'}</span>
  `;
  div.addEventListener('click', () => showModal(p));
  return div;
}

function initDnD() {
  Object.entries(cols).forEach(([colId, el]) => {
    new Sortable(el, {
      group: 'kanban',
      animation: 150,
      onAdd: ({ item, to }) => {
        const id = item.dataset.id;
        const etapa = colToEtapa[to.id] ?? 10;
        atualizarEtapa(id, etapa);
      }
    });
  });
}

async function atualizarEtapa(id, etapa) {
  try {
    const url = `${API_UPDATE}?id=${encodeURIComponent(id)}&etapa=${etapa}`;
    await fetch(url);
  } catch (e) {
    console.error('Falha ao atualizar etapa', e);
  }
}

const modal = document.getElementById('pedidoModal');
const modalInfo = document.getElementById('modalInfo');
const materialUl = document.getElementById('materialList');

function showModal(p) {
  modalInfo.innerHTML = `
    <h3>Detalhes do Pedido</h3>
    <strong>${p.nomeProduto}</strong><br>
    Código: ${p.CodProduto}<br>
    OP: ${p.infAdicionais?.cNumOP}<br>
    Previsão: ${p.infAdicionais?.DtPrevisao}
    <h4>Materiais Necessários</h4>
  `;
  materialUl.innerHTML = `
    <table>
      <thead><tr><th>Descrição</th><th>Qtd</th></tr></thead>
      <tbody>
        ${p.componentes.map(c => `<tr><td>${c.nome}</td><td>${c.quantidade} ${c.unidade}</td></tr>`).join('')}
      </tbody>
    </table>
  `;
  modal.classList.remove('hidden');
}

window.fecharModal = () => modal.classList.add('hidden');
