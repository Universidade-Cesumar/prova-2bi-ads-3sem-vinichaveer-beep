const API_URL = 'https://6a307332a7f8866418d60993.mockapi.io/prova';

const inputNome       = document.getElementById('input-nome');
const inputQuantidade = document.getElementById('input-quantidade');
const btnCadastrar    = document.getElementById('btn-cadastrar');
const listaMateriais  = document.getElementById('lista-materiais');
const statusDiv       = document.getElementById('status');

// GET — carrega a lista ao abrir a página
async function carregarMateriais() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Erro ao buscar materiais');
    const dados = await res.json();

    if (dados.length === 0) {
      listaMateriais.innerHTML = '<tr><td colspan="3" class="empty">Nenhum material cadastrado ainda.</td></tr>';
      return;
    }

    listaMateriais.innerHTML = dados.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.nome ?? item.name ?? '—'}</td>
        <td>${item.quantidade ?? item.quantity ?? '—'}</td>
      </tr>
    `).join('');

  } catch (err) {
    listaMateriais.innerHTML = '<tr><td colspan="3" class="empty">Erro ao carregar materiais.</td></tr>';
    console.error(err);
  }
}

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
    mostrarStatus('Erro ao cadastrar. Tente novamente.', false);
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
