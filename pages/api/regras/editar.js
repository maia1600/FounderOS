// /pages/api/regras/editar.js
import { pool } from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { id, categoria, condicao, acao, exemplo, embedding } = req.body

  if (!id || !categoria || !condicao || !acao) {
    return res.status(400).json({ error: 'Dados obrigatórios em falta' })
  }

  try {
    const query = `
      UPDATE regras
      SET categoria = $1,
          condicao = $2,
          acao = $3,
          exemplo = $4,
          embedding = $5
      WHERE id = $6
      RETURNING *
    `

    const values = [categoria, condicao, acao, exemplo || null, embedding || null, id]
    const result = await pool.query(query, values)

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Regra não encontrada' })
    }

    res.status(200).json({ sucesso: true, regra: result.rows[0] })
  } catch (error) {
    console.error('Erro ao editar regra:', error)
    res.status(500).json({ error: 'Erro interno ao editar regra', detalhe: error.message })
  }
}
