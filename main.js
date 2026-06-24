const API_URL = 'https://6a307332a7f8866418d60993.mockapi.io/prova';

const inputNome       = document.getElementById('input-nome');
const inputQuantidade = document.getElementById('input-quantidade');
const inputRetirada   = document.getElementById('input-retirada');
const btnCadastrar    = document.getElementById('btn-cadastrar');
const listaMateriais  = document.getElementById('lista-materiais');
const statusDiv       = document.getElementById('status');
const totalItens      = document.getElementById('total-itens');
const inputBusca      = document.getElementById('input-busca');

let todosMateriais = [];

// -------------------------------------------------------
// Sprint 2 - Função de validação de retirada
// -------------------------------------------------------
function validarRetirada(estoqueAtual, quantidadeRetirada) {
  if (quantidadeRetirada <= 0) return false;
  if (quantidadeRetirada > estoqueAtual) return false;
  return true;
}

// -------------------------------------------------------
// Renderiza a tabela com filtro e classes de estoque crítico
// -------------------------------------------------------
function renderizarTabela(filtro = '') {
  const termo = filtro.toLowerCase();
  const filtrados = todosMateriais.filter(item =>
    (item.nome ?? '').toLowerCase().includes(termo)
  );

  totalItens.textContent = todosMateriais.length;

  if (filtrados.length === 0) {
    listaMateriais.innerHTML = '<tr><td colspan="4" class="empty">Nenhum material encontrado.</td></tr>';
    return;
  }

  listaMateriais.innerHTML = filtrados.map((item, i) => {
    const qtd = Number(item.quantidade ?? 0);
    const critico = qtd < 10 ? 'estoque-critico' : '';
    return `
      <tr class="${critico}" data-id="${item.id}" data-quantidade="${qtd}">
        <td>${i + 1}</td>
        <td>${item.nome ?? '—'}</td>
        <td>${qtd}</td>
        <td>
          <button class="btn-baixar" data-id="${item.id}" data-quantidade="${qtd}">Baixar</button>
          <button class="btn-excluir" data-id="${item.id}">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');
}

// -------------------------------------------------------
// GET — carrega a lista ao abrir a página
// -------------------------------------------------------
async function carregarMateriais() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Erro ao buscar materiais');
    todosMateriais = await res.json();
    renderizarTabela(inputBusca.value);
  } catch (err) {
    listaMateriais.innerHTML = '<tr><td colspan="4" class="empty">Erro ao carregar materiais. Verifique sua conexão.</td></tr>';
    console.error(err);
  }
}

// -------------------------------------------------------
// POST — cadastra novo material
// -------------------------------------------------------
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

// -------------------------------------------------------
// Delegação de eventos para btn-baixar e btn-excluir
// -------------------------------------------------------
listaMateriais.addEventListener('click', async (e) => {

  // PUT — baixa de estoque
  if (e.target.classList.contains('btn-baixar')) {
    const id             = e.target.dataset.id;
    const estoqueAtual   = Number(e.target.dataset.quantidade);
    const qtdRetirar     = Number(inputRetirada.value);

    if (!validarRetirada(estoqueAtual, qtdRetirar)) {
      mostrarStatus('Quantidade inválida! Verifique o campo de retirada.', false);
      return;
    }

    try {
      const novaQtd = estoqueAtual - qtdRetirar;
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade: novaQtd })
      });

      if (!res.ok) throw new Error('Erro na baixa');

      inputRetirada.value = '';
      mostrarStatus('Baixa realizada com sucesso!', true);
      await carregarMateriais();

    } catch (err) {
      mostrarStatus('Erro ao realizar baixa. Tente novamente.', false);
      console.error(err);
    }
  }

  // DELETE — exclui material
  if (e.target.classList.contains('btn-excluir')) {
    const id = e.target.dataset.id;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

      if (!res.ok) throw new Error('Erro na exclusão');

      mostrarStatus('Material excluído com sucesso!', true);
      await carregarMateriais();

    } catch (err) {
      mostrarStatus('Erro ao excluir. Tente novamente.', false);
      console.error(err);
    }
  }
});

// -------------------------------------------------------
// Filtro de busca em tempo real
// -------------------------------------------------------
inputBusca.addEventListener('input', () => {
  renderizarTabela(inputBusca.value);
});

// -------------------------------------------------------
// Utilitário de status
// -------------------------------------------------------
function mostrarStatus(msg, sucesso) {
  statusDiv.textContent = msg;
  statusDiv.className   = sucesso === true  ? 'status-ok'
                        : sucesso === false ? 'status-err'
                        : '';
}

// Inicia carregando a lista
carregarMateriais();
