document.addEventListener('DOMContentLoaded', () => {

    
    const API_URL = 'http://localhost:8000/produto'; 
    let paginaAtual = 1; 
    let termoBuscaAtual = '';
    let idParaExcluir = null; 

   
    const debounce = (func, delay) => {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    
    const corpoTabela = document.getElementById('corpo-tabela');
    const btnNovoProduto = document.getElementById('btn-novo-produto');
    const modal = document.getElementById('modal-produto');
    const modalTitulo = document.getElementById('modal-titulo');
    const formProduto = document.getElementById('form-produto');
    const btnCancelar = document.getElementById('btn-cancelar');
    const produtoIdInput = document.getElementById('produto-id');
    const notificationContainer = document.getElementById('notification-container');
    const paginacaoContainer = document.getElementById('paginacao-container'); 
    
    
    const inputBusca = document.getElementById('input-busca');
    const btnLimparBusca = document.getElementById('btn-limpar-busca');

    
    const modalConfirmacao = document.getElementById('modal-confirmacao');
    const btnConfirmarNao = document.getElementById('btn-confirmar-nao');
    const btnConfirmarSim = document.getElementById('btn-confirmar-sim');


    
    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;
        notificationContainer.appendChild(notification);
        void notification.offsetWidth; 
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => { notification.remove(); }, 500); 
        }, 4000); 
    };

    
    const renderPaginacao = (meta) => {
        paginacaoContainer.innerHTML = '';
        const { currentPage, totalPages, totalItems } = meta;

        if (totalPages === 0) {
            paginacaoContainer.innerHTML = '';
            return;
        }

        const btnAnterior = document.createElement('button');
        btnAnterior.textContent = 'Anterior';
        btnAnterior.disabled = currentPage === 1;
        btnAnterior.addEventListener('click', () => {
            if (currentPage > 1) {
                fetchProdutos(currentPage - 1, termoBuscaAtual);
            }
        });
        paginacaoContainer.appendChild(btnAnterior);

        const maxButtons = 5; 
        
       
        const currentBlock = Math.ceil(currentPage / maxButtons);
        let startPage = (currentBlock - 1) * maxButtons + 1;
        let endPage = Math.min(currentBlock * maxButtons, totalPages);
       

        for (let i = startPage; i <= endPage; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.classList.toggle('active', i === currentPage);
            btn.addEventListener('click', () => fetchProdutos(i, termoBuscaAtual));
            paginacaoContainer.appendChild(btn);
        }

        const btnProximo = document.createElement('button');
        btnProximo.textContent = 'Próximo';
        btnProximo.disabled = currentPage === totalPages;
        btnProximo.addEventListener('click', () => {
            if (currentPage < totalPages) {
                fetchProdutos(currentPage + 1, termoBuscaAtual);
            }
        });
        paginacaoContainer.appendChild(btnProximo);
        
        const resumoTexto = termoBuscaAtual 
            ? ` (Resultado para "${termoBuscaAtual}": ${totalItems} itens)`
            : ` (Página ${currentPage} de ${totalPages} - Total: ${totalItems} itens)`;
            
        const resumo = document.createElement('span');
        resumo.textContent = resumoTexto;
        paginacaoContainer.appendChild(resumo);
    };


    

    const fetchProdutos = async (page = 1, search = '') => {
        paginaAtual = page; 
        termoBuscaAtual = search.trim(); 

        let url = `${API_URL}?page=${page}`;
        if (termoBuscaAtual) {
            url += `&search=${encodeURIComponent(termoBuscaAtual)}`;
        }
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Erro ao buscar produtos');
            
            const { data: produtos, pagination } = await response.json(); 

            corpoTabela.innerHTML = '';
            
            if (produtos.length === 0) {
                const message = termoBuscaAtual 
                    ? `Nenhum produto encontrado para o termo: "${termoBuscaAtual}"`
                    : 'Nenhum produto cadastrado.';
                corpoTabela.innerHTML = `<tr><td colspan="5" style="text-align: center;">${message}</td></tr>`;
            } else {
                 produtos.forEach(produto => {
                    renderizarProdutoNaTabela(produto);
                });
            }

            renderPaginacao(pagination);

        } catch (error) {
            console.error(error.message);
            showNotification('Não foi possível carregar os produtos. Verifique se o servidor está rodando na porta 8000.', 'error');
        }
    };

    const salvarProduto = async (produto) => {
        const id = produtoIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL; 
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(produto),
            });

            if (!response.ok) {
                const erro = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
                throw new Error(erro.message || 'Erro ao salvar produto');
            }

            showNotification(`Produto ${id ? 'atualizado' : 'criado'} com sucesso!`, 'success');
            
            fecharModal();
            fetchProdutos(paginaAtual, termoBuscaAtual); 
            
        } catch (error) {
            console.error(error.message);
            showNotification(`Falha ao salvar produto: ${error.message}`, 'error');
        }
    };

    const excluirProduto = async (id) => {
        
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const erro = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
                throw new Error(erro.message || 'Erro ao excluir produto');
            }

            showNotification('Produto excluído com sucesso.', 'success');
            
            fetchProdutos(paginaAtual, termoBuscaAtual);

        } catch (error) {
            console.error(error.message);
            showNotification(`Falha ao excluir produto: ${error.message}`, 'error');
        }
    };


   
    
    const renderizarProdutoNaTabela = (produto) => {
        const tr = document.createElement('tr');
        tr.id = `produto-${produto.id}`; 
        
        const precoFormatado = parseFloat(produto.preco).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        tr.innerHTML = `
            <td data-label="Nome">${produto.nome}</td>
            <td data-label="Descrição">${produto.descricao}</td>
            <td data-label="Qtd.">${produto.quantidade}</td>
            <td data-label="Preço">${precoFormatado}</td>
            <td data-label="Ações">
                <button class="btn btn-editar" data-id="${produto.id}"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn btn-excluir" data-id="${produto.id}"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        corpoTabela.appendChild(tr);
    };

    const abrirModalCriar = () => {
        modalTitulo.textContent = 'Novo Produto';
        formProduto.reset(); 
        produtoIdInput.value = ''; 
        modal.classList.add('visivel');
    };

    const abrirModalEditar = (tr) => {
        console.log('Tentativa de abrir modal de edição.');
        
        modalTitulo.textContent = 'Editar Produto';
        
        const btnEditar = tr.querySelector('.btn-editar');
        if (!btnEditar) {
            console.error("Botão 'Editar' não encontrado dentro da linha (tr).");
            return;
        }
        
        const id = btnEditar.dataset.id;
        const colunas = tr.querySelectorAll('td');

        if (colunas.length < 4) {
            console.error("Número insuficiente de colunas na linha da tabela.");
            return;
        }
        
        const nome = colunas[0].textContent;
        const descricao = colunas[1].textContent;
        const quantidade = colunas[2].textContent;
        
        const precoTexto = colunas[3].textContent;
        const preco = precoTexto.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();

        console.log(`Dados extraídos: ID=${id}, Nome=${nome}, Preço=${preco}`);

        produtoIdInput.value = id;
        document.getElementById('nome_produto').value = nome;
        document.getElementById('descricao').value = descricao;
        document.getElementById('quantidade').value = quantidade;
        document.getElementById('preco').value = preco;
        
        modal.classList.add('visivel');
    };

    const fecharModal = () => {
        modal.classList.remove('visivel');
        formProduto.reset();
    };

   
    const abrirModalConfirmacao = (id) => {
        idParaExcluir = id;
        modalConfirmacao.classList.add('visivel');
    };

    const fecharModalConfirmacao = () => {
        idParaExcluir = null;
        modalConfirmacao.classList.remove('visivel');
    };


    
    
    const liveSearch = (e) => {
        const novoTermo = e.target.value;
        fetchProdutos(1, novoTermo); 
    };
    
    const debouncedSearch = debounce(liveSearch, 300);

    inputBusca.addEventListener('input', debouncedSearch);

    
    btnLimparBusca.addEventListener('click', () => {
        inputBusca.value = ''; 
        fetchProdutos(1, ''); 
    });


    btnNovoProduto.addEventListener('click', abrirModalCriar);
    btnCancelar.addEventListener('click', fecharModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            fecharModal();
        }
    });

    formProduto.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const produto = {
            nome_produto: document.getElementById('nome_produto').value,
            descricao: document.getElementById('descricao').value,
            quantidade: document.getElementById('quantidade').value,
            preco: document.getElementById('preco').value,
        };
        salvarProduto(produto);
    });

    corpoTabela.addEventListener('click', (e) => {
        
        const targetEditar = e.target.closest('.btn-editar');
        const targetExcluir = e.target.closest('.btn-excluir');

        if (targetEditar) {
            const linha = targetEditar.closest('tr');
            if (linha) {
                abrirModalEditar(linha);
            } else {
                console.error("Linha da tabela (tr) não encontrada.");
            }
        }

        if (targetExcluir) {
            const id = targetExcluir.dataset.id;
            abrirModalConfirmacao(id); 
        }
    });

   
    btnConfirmarNao.addEventListener('click', fecharModalConfirmacao);

    btnConfirmarSim.addEventListener('click', () => {
        if (idParaExcluir) {
            excluirProduto(idParaExcluir);
        }
        fecharModalConfirmacao();
    });

    modalConfirmacao.addEventListener('click', (e) => {
        if (e.target === modalConfirmacao) {
            fecharModalConfirmacao();
        }
    });

    
    fetchProdutos(paginaAtual); 
});