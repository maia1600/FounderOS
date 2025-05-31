
// Endpoint GET /api/regras para listar regras (ativas, sugestões, todas)
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export default async function handler(req, res) {
  const { filtro } = req.query
  let query = 'SELECT * FROM regras'

  if (filtro === 'ativas') {
    query += ' WHERE ativa = true'
  } else if (filtro === 'sugestoes') {
    query += ' WHERE ativa = false'
  }

  try {
    const result = await pool.query(query)
    res.status(200).json(result.rows)
  } catch (err) {
    console.error('Erro ao buscar regras:', err)
    res.status(500).json({ erro: 'Erro ao buscar regras' })
  }
}
