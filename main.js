const API_URL = 'https://6a307332a7f8866418d60993.mockapi.io/prova';

const inputNome       = document.getElementById('input-nome');
const inputQuantidade = document.getElementById('input-quantidade');
const btnCadastrar    = document.getElementById('btn-cadastrar');
const listaMateriais  = document.getElementById('lista-materiais');
const statusDiv       = document.getElementById('status');
const totalItens      = document.getElementById('total-itens');
const inputBusca      = document.getElementById('input-busca');

let todosMateriais = [];

// Renderiza a tabela aplicando filtro e classes de estoque crítico
function renderizarTabela(filtro = '') {
  const termo = filtro.toLowerCase();
  const filtrados = todosMateriais.filter(item =>
    (item.nome ?? '').toLowerCase().includes(termo)
  );

  totalItens.textContent = todosMateriais.length;

  if (filtrados.length === 0) {
    listaMateriais.innerHTML = '<tr><td colspan="3" class="empty">Nenhum material encontrado.</td></tr>';
    return;
  }

  listaMateriais.innerHTML = filtrados.map((item, i) => {
    const qtd = Number(item.quantidade ?? 0);
    const critico = qtd < 10 ? 'estoque-critico' : '';
    return `
      <tr class="${critico}">
        <td>${i + 1}</td>
        <td>${item.nome ?? '—'}</td>
        <td>${qtd}</td>
      </tr>
    `;
  }).join('');
}

// GET — carrega a lista ao abrir a página
async function carregarMateriais() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Erro ao buscar materiais');
    todosMateriais = await res.json();
    renderizarTabela(inputBusca.value);
  } catch (err) {
    listaMateriais.innerHTML = '<tr><td colspan="3" class="empty">Erro ao carregar materiais. Verifique sua conexão.</td></tr>';
    console.error(err);
  }
}

// Filtro de busca em tempo real
inputBusca.addEventListener('input', () => {
  renderizarTabela(inputBusca.value);
});

// POST — cadastra novo material
btnCadastrar.addEventListener('click', async () => {
  const nome       = inputNome.value.trim();
  const quantidade = inputQuantidade.value.trim();

  if (!nome || quantidade === '') {
    mostrarStatus('Preencha o nome e a quantidade antes de cadastrar.', false);
    return;
  }

  btnCadastrar.disabled = true;
  mostrarStatus('Cadastrando...', null);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, quantidade: Number(quantidade) })
    });

    if (!res.ok) throw new Error('Erro no cadastro');

    inputNome.value       = '';
    inputQuantidade.value = '';
    mostrarStatus('Material cadastrado com sucesso!', true);
    await carregarMateriais();

  } catch (err) {
    mostrarStatus('Erro ao cadastrar. Verifique sua conexão e tente novamente.', false);
    console.error(err);
  } finally {
    btnCadastrar.disabled = false;
  }
});

function mostrarStatus(msg, sucesso) {
  statusDiv.textContent = msg;
  statusDiv.className   = sucesso === true  ? 'status-ok'
                        : sucesso === false ? 'status-err'
                        : '';
}

// Inicia carregando a lista
carregarMateriais();
