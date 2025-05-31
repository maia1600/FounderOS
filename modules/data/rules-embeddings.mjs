export const regras = [
  {
    categoria: "objeções",
    condicao: "cliente menciona preço alto",
    acao: "responder com empatia e reforçar o valor e durabilidade do serviço",
    embedding: [
      0.023, -0.012, 0.141, 0.055, ..., -0.017 // <- deve conter uns 1500 valores
    ]
  },
  ...
]

