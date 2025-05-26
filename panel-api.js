/* panel-api.js */
const API = 'https://SEU_DOMINIO_N8N/webhook';   // ajuste aqui
const REFRESH_EVERY = 60_000;                    // 30 s

const columns = {
  'Fila':      document.getElementById('todo'),     // ajuste p/ ids do seu HTML
  'Em produção': document.getElementById('doing'),
  'Concluído':  document.getElementById('done')
};

initKanban();
loadBoard();                         // 1ª carga
setInterval(loadBoard, REFRESH_EVERY);

document.getElementById('refresh-btn').addEventListener('click', () => {
  loadBoard();
});


async function loadBoard () {
  const res   = await fetch(`${API}/list-orders`);
  const items = await res.json();                  // [{id,produto,qtd,status}, …]

  // limpa e repopula
  Object.values(columns).forEach(col => col.innerHTML = '');
  items.forEach(addCard);
}

function addCard (item) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = item.id;
  card.innerHTML  = `
      <strong>${item.produto}</strong><br>
      Qtd: ${item.qtd}
  `;
  columns[item.status].appendChild(card);
}

function initKanban () {
  Object.entries(columns).forEach(([status, el]) => {
    new Sortable(el, {
      group: 'production',
      animation: 150,
      onAdd: ({item}) => {
        const id = item.dataset.id;
        updateStatus(id, status);
      }
    });
  });
}

async function updateStatus (id, status) {
  await fetch(`${API}/update/${id}`, {
    method : 'PATCH',
    headers: {'Content-Type':'application/json'},
    body   : JSON.stringify({status})
  });
}
