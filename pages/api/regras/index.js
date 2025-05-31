// /pages/api/regras/index.js
import { pool } from '/lib/db'

export default async function handler(req, res) {
  const { filtro } = req.query

  let query = 'SELECT * FROM regras'
  if (filtro === 'ativas') {
    query += ' WHERE ativa = true'
  } else if (filtro === 'sugestoes') {
    query += ' WHERE ativa = false AND sugerida_por_ia = true'
  }

  try {
    const { rows } = await pool.query(query)

    if (!Array.isArray(rows)) {
      throw new Error('Resultado inesperado da base de dados')
    }

    res.status(200).json(rows)
  } catch (error) {
    console.error('Erro ao buscar regras:', error)
    res.status(500).json({ error: 'Erro ao buscar regras', detalhe: error.message })
  }
}

