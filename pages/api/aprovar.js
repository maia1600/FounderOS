// /pages/api/regras/aprovar.js
import fs from 'fs'
import path from 'path'
import { regras } from '@/modules/data/rules-embeddings.mjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { condicao } = req.body

  if (!condicao) {
    return res.status(400).json({ error: 'Condição é obrigatória' })
  }

  try {
    const index = regras.findIndex(r => r.condicao === condicao && r.sugerida_por_ia)
    if (index === -1) {
      return res.status(404).json({ error: 'Regra sugerida não encontrada' })
    }

    regras[index].ativa = true
    delete regras[index].sugerida_por_ia

    const outputPath = path.join(process.cwd(), 'modules', 'data', 'rules-embeddings.mjs')
    const fileContent = `export const regras = ${JSON.stringify(regras, null, 2)}\n`

    fs.writeFileSync(outputPath, fileContent, 'utf-8')

    return res.status(200).json({ message: 'Regra aprovada com sucesso' })
  } catch (error) {
    console.error('Erro ao aprovar regra:', error)
    return res.status(500).json({ error: 'Erro ao aprovar regra' })
  }
}


