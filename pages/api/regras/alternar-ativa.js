
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id, ativa } = req.body;

  const filePath = path.join(process.cwd(), 'modules', 'data', 'rules.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const regras = JSON.parse(raw);

  const index = regras.findIndex((r) => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Regra não encontrada' });

  regras[index].ativa = ativa;

  fs.writeFileSync(filePath, JSON.stringify(regras, null, 2));
  return res.status(200).json({ success: true });
}
