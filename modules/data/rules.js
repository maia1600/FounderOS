// /modules/data/rules.js

const rules = [
  {
    categoria: 'upsell',
    exemplo: '💡 Oferecemos carro de substituição gratuito para orçamentos acima de 300€.'
  },
  {
    categoria: 'urgencia',
    regras: [
      {
        condicao: 'cliente menciona pressa, urgência ou prazo apertado',
        acao: 'responder com prioridade e sugerir marcação imediata'
      }
    ]
  },
  {
    categoria: 'objeções',
    regras: [
      {
        condicao: 'cliente menciona preço alto',
        acao: 'responder com empatia e reforçar o valor e durabilidade do serviço'
      },
      {
        condicao: 'cliente menciona falta de tempo',
        acao: 'sugerir carro de substituição ou recolha gratuita'
      }
    ]
  }
];

export default rules;


