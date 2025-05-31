
// Endpoint: /pages/api/regras/aprovar.js
// Objetivo: Aprovar sugestões da IA e torná-las regras ativas

import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { id } = req.body

  try {
    const filePath = path.join(process.cwd(), 'modules', 'data', 'rules-embeddings.mjs')
    let file = fs.readFileSync(filePath, 'utf-8')

    // Extrair apenas o JSON do export
    const match = file.match(/export const regras = (.*);/s)
    if (!match) return res.status(500).json({ error: 'Formato inválido no ficheiro de regras' })

    let regras = JSON.parse(match[1])

    if (!regras[id]) return res.status(404).json({ error: 'Regra não encontrada' })

    regras[id].ativa = true

    const novoConteudo = `export const regras = ${JSON.stringify(regras, null, 2)};\n`
    fs.writeFileSync(filePath, novoConteudo, 'utf-8')

    return res.status(200).json({ message: 'Regra aprovada com sucesso' })
  } catch (error) {
    console.error('Erro ao aprovar regra:', error)
    return res.status(500).json({ error: 'Erro interno ao aprovar regra' })
  }
}
