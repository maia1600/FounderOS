
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id } = req.body;

  const filePath = path.join(process.cwd(), 'modules', 'data', 'rules.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const regras = JSON.parse(raw);

  const novasRegras = regras.filter((r) => r.id !== id);

  fs.writeFileSync(filePath, JSON.stringify(novasRegras, null, 2));
  return res.status(200).json({ success: true });
}
