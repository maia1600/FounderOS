// /pages/api/regras/aprovar.js
import fs from 'fs'
import path from 'path'
import { regras } from '/modules/data/rules-embeddings.mjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { id } = req.body
  if (!id) {
    return res.status(400).json({ error: 'ID da regra é obrigatório' })
  }

  const index = regras.findIndex(r => r.id === id && r.sugerida_por_ia)
  if (index === -1) {
    return res.status(404).json({ error: 'Regra não encontrada ou já aprovada' })
  }

  regras[index].ativa = true
  regras[index].sugerida_por_ia = false

  const filePath = path.join(process.cwd(), 'modules', 'data', 'rules-embeddings.mjs')
  const conteudo = `export const regras = ${JSON.stringify(regras, null, 2)};\n`
  fs.writeFileSync(filePath, conteudo, 'utf-8')

  return res.status(200).json({ success: true })
}

