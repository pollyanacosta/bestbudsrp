export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      erro: 'Método não permitido'
    });
  }
  try {
    const {
      nomeFuncionario,
      nomeCliente,
      produtos,
      valorBruto,
      desconto,
      valorDesconto,
      valorFinal,
      valorCaixa,
      valorFuncionario
    } = req.body;
    if (!produtos || produtos.length === 0) {
      return res.status(400).json({
        erro: 'Nenhum produto informado'
      });
    }
    if (!nomeFuncionario || !nomeCliente) {
      return res.status(400).json({
        erro: 'Nome do funcionário e nome do cliente são obrigatórios'
      });
    }
    const webhook = process.env.DISCORD_WEBHOOK;
    if (!webhook) {
      return res.status(500).json({
        erro: 'DISCORD_WEBHOOK não configurado na Vercel'
      });
    }
    let listaProdutos = '';
    produtos.forEach(produto => {
      listaProdutos +=
        `**${produto.nome}**\n` +
        `Quantidade: ${produto.quantidade}\n` +
        `Valor unitário: $${produto.preco.toLocaleString('pt-BR')}\n` +
        `Subtotal: $${produto.subtotal.toLocaleString('pt-BR')}\n\n`;
    });
    const mensagem = {
      username: 'Best Buds',
      embeds: [
        {
          title: '🛒 NOVA VENDA',
          description:
            'Uma nova venda foi finalizada no sistema Best Buds.',
          fields: [
            {
              name: '🧑‍💼 Funcionário',
              value: nomeFuncionario,
              inline: true
            },
            {
              name: '🙋 Cliente',
              value: nomeCliente,
              inline: true
            },
            {
              name: '📦 Produtos vendidos',
              value: listaProdutos || 'Nenhum produto'
            },
            {
              name: '💵 Valor Bruto',
              value: `$${valorBruto.toLocaleString('pt-BR')}`,
              inline: true
            },
            {
              name: '🏷️ Desconto',
              value:
                `${desconto}% — $${valorDesconto.toLocaleString('pt-BR')}`,
              inline: true
            },
            {
              name: '💰 Valor Final',
              value:
                `$${valorFinal.toLocaleString('pt-BR')}`,
              inline: true
            },
            {
              name: '🏦 Valor Caixa',
              value:
                `$${valorCaixa.toLocaleString('pt-BR')}`,
              inline: true
            },
            {
              name: '👤 Valor Funcionário',
              value:
                `$${valorFuncionario.toLocaleString('pt-BR')}`,
              inline: true
            }
          ],
          footer: {
            text: 'Best Buds • Sistema de Vendas'
          },
          timestamp: new Date().toISOString()
        }
      ]
    };
    const resposta = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mensagem)
    });
    if (!resposta.ok) {
      const erroDiscord = await resposta.text();
      console.error(
        'Erro Discord:',
        erroDiscord
      );
      return res.status(500).json({
        erro: 'O Discord recusou o envio da venda.'
      });
    }
    return res.status(200).json({
      sucesso: true,
      mensagem: 'Venda enviada para o Discord.'
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({
      erro: 'Erro interno ao processar a venda.'
    });
  }
}
