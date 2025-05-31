
// /pages/api/regras/editar.js
import { pool } from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { id, categoria, condicao, acao, exemplo } = req.body

  if (!id || !categoria || !condicao || !acao) {
    return res.status(400).json({ error: 'Campos obrigatórios em falta' })
  }

  try {
    const updateQuery = `
      UPDATE regras
      SET categoria = $1,
          condicao = $2,
          acao = $3,
          exemplo = $4
      WHERE id = $5
    `

    await pool.query(updateQuery, [categoria, condicao, acao, exemplo || null, id])

    res.status(200).json({ sucesso: true, mensagem: 'Regra atualizada com sucesso' })
  } catch (error) {
    console.error('Erro ao editar regra:', error)
    res.status(500).json({ error: 'Erro ao editar regra', detalhe: error.message })
  }
}
