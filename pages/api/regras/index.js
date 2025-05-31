// /pages/api/regras/index.js
import { pool } from '/lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
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
  } else if (req.method === 'PUT') {
    const { id, categoria, condicao, acao, exemplo } = req.body

    if (!id || !categoria || !condicao || !acao) {
      return res.status(400).json({ error: 'Dados incompletos para editar a regra' })
    }

    try {
      const query = `
        UPDATE regras SET
          categoria = $1,
          condicao = $2,
          acao = $3,
          exemplo = $4
        WHERE id = $5
      `
      const values = [categoria, condicao, acao, exemplo || null, id]

      await pool.query(query, values)
      res.status(200).json({ mensagem: 'Regra atualizada com sucesso' })
    } catch (error) {
      console.error('Erro ao editar regra:', error)
      res.status(500).json({ error: 'Erro ao editar regra', detalhe: error.message })
    }
  } else if (req.method === 'POST') {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({ error: 'ID da regra ausente para aprovação' })
    }

    try {
      await pool.query('UPDATE regras SET ativa = true WHERE id = $1', [id])
      res.status(200).json({ mensagem: 'Regra aprovada com sucesso' })
    } catch (error) {
      console.error('Erro ao aprovar regra:', error)
      res.status(500).json({ error: 'Erro ao aprovar regra', detalhe: error.message })
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({ error: 'ID da regra ausente para rejeição' })
    }

    try {
      await pool.query('DELETE FROM regras WHERE id = $1', [id])
      res.status(200).json({ mensagem: 'Regra rejeitada com sucesso' })
    } catch (error) {
      console.error('Erro ao rejeitar regra:', error)
      res.status(500).json({ error: 'Erro ao rejeitar regra', detalhe: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'POST', 'DELETE'])
    res.status(405).end(`Método ${req.method} não permitido`)
  }
}

