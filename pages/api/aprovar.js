
// /pages/api/regras/aprovar.js
import { pool } from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.body

  if (!id) {
    return res.status(400).json({ error: 'ID da regra não fornecido' })
  }

  try {
    const result = await pool.query(
      'UPDATE regras SET ativa = true WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Regra não encontrada' })
    }

    res.status(200).json({ success: true, regra: result.rows[0] })
  } catch (error) {
    console.error('Erro ao aprovar regra:', error)
    res.status(500).json({ error: 'Erro ao aprovar regra' })
  }
}

