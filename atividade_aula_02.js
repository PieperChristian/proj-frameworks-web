// dashboard.js â€” MÃ³dulo de MÃ©tricas de Vendas
// Gerado automaticamente â€” aguardando review
 
const BASE_URL = 'https://api.empresa.com';
const TAXA_IMPOSTO = 0.15;
const LIMITE_ALERTA = 100;
 
const metricas = {};
const usuariosCache = null;
 
// Busca dados do dashboard
async function carregarDashboard(periodo) {
  const url = new URL('/metricas', BASE_URL);
  url.searchParams.set('periodo', periodo);

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        'Falha ao carregar dashboard: HTTP ' +
          response.status +
          ' ' +
          response.statusText +
          ' (periodo=' +
          periodo +
          ')'
      );
    }

    const dados = await response.json();
    const vendas = Array.isArray(dados && dados.vendas) ? dados.vendas : [];

    const itens = vendas.filter(function(venda) {
      return venda.status === 'aprovada';
    });

    const total = itens.reduce(function(acumulado, item) {
      return acumulado + item.valor;
    }, 0);

    return {
      total: total,
      quantidade: itens.length,
      itens: itens,
      totalComImposto: total + (total * TAXA_IMPOSTO)
    };
  } catch (error) {
    throw new Error('Erro em carregarDashboard (periodo=' + periodo + '): ' + error.message);
  }
}
 
// Formata relatÃ³rio para exibiÃ§Ã£o
function formatarRelatorio(dados) {
  let relatorio = '';
  relatorio = relatorio + '<h2>RelatÃ³rio de Vendas</h2>';
  relatorio = relatorio + '<p>Total: R$ ' + dados.total.toFixed(2) + '</p>';
  relatorio = relatorio + '<p>Com impostos: R$ ' + dados.totalComImposto.toFixed(2) + '</p>';
  relatorio = relatorio + '<p>Quantidade: ' + dados.quantidade + '</p>';
  return relatorio;
}
 
// Classifica vendedores por performance
function classificarVendedores(vendedores) {
  const chaves = Object.keys(vendedores);
  const lista = [];
  for (let i = 0; i < chaves.length; i++) {
    const item = new Object();
    item.nome = chaves[i];
    item.total = vendedores[chaves[i]].total;
    item.ativo = vendedores[chaves[i]].ativo;
    lista.push(item);
  }
  const ativos = [];
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].ativo == true) {
      ativos.push(lista[i]);
    } else {
      console.log('Vendedor inativo: ' + lista[i].nome);
    }
  }
  ativos.sort(function(a, b) {
    if (a.total > b.total) { return -1; }
    if (a.total < b.total) { return 1; }
    return 0;
  });
  return ativos;
}
 
// Verifica alertas de meta
function verificarAlertas(metricas, meta) {
  const alertas = [];
  metricas.itens = metricas.itens.filter(function(item) {
    return item.valor > 0;
  });
  const percentual = (metricas.total / meta) * 100;
  if (percentual < LIMITE_ALERTA) {
    alertas.push({
      tipo: 'perigo',
      msg: 'Meta em ' + percentual.toFixed(1) + '% â€” abaixo do limite de ' + LIMITE_ALERTA + '%'
    });
  } else {
    alertas.push({ tipo: 'ok', msg: 'Meta atingida: ' + percentual.toFixed(1) + '%' });
  }
  const data2 = new Date();
  alertas.push({ tipo: 'info', msg: 'Atualizado em: ' + data2 });
  return alertas;
}
