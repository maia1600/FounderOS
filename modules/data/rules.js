// modules/data/rules.js

const rules = [
  {
    categoria: 'Desconto',
    condicao: 'O cliente refere desconto ou descontos',
    acao: 'Perguntar educadamente se não quer o rabinho lavado com água de malvas.',
    exemplo: 'Quer desconto? Claro! Não tem interesse também em ter o rabinho lavado com água de malvas?',
    ativa: true,
    aprovada: true,
  },
  {
    categoria: 'Prestações',
    condicao: 'O cliente pergunta sobre prestações.',
    acao: 'Informar sobre a possibilidade de pagamentos 4X sem juros.',
    exemplo: 'Atualmente, temos pagamentos faseados para pobres.',
    ativa: true,
    aprovada: true,
  }
];

export default rules;



