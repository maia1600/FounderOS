import { Client } from 'pg';

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // necessário para Neon
  });

  await client.connect();

  if (req.method === 'GET') {
    try {
      const result = await client.query('SELECT * FROM regras ORDER BY id DESC');
      await client.end();
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Erro no GET:', error);
      await client.end();
      return res.status(500).json({ error: 'Erro ao obter regras.' });
    }
  }

  if (req.method === 'POST') {
    const { id } = req.body;
    if (!id) {
      await client.end();
      return res.status(400).json({ error: 'ID não fornecido.' });
    }

    try {
      await client.query('UPDATE regras SET aprovada = true WHERE id = $1', [id]);
      await client.end();
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      await client.end();
      return res.status(500).json({ error: 'Erro ao aprovar regra.' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) {
      await client.end();
      return res.status(400).json({ error: 'ID não fornecido.' });
    }

    try {
      await client.query('DELETE FROM regras WHERE id = $1', [id]);
      await client.end();
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erro ao eliminar:', error);
      await client.end();
      return res.status(500).json({ error: 'Erro ao eliminar regra.' });
    }
  }

  if (req.method === 'PUT') {
    const { id, categoria, condicao, acao, exemplo } = req.body;

    if (!id || !categoria || !condicao || !acao) {
      await client.end();
      return res.status(400).json({ error: 'Dados obrigatórios em falta.' });
    }

    try {
      await client.query(
        `UPDATE regras
         SET categoria = $1, condicao = $2, acao = $3, exemplo = $4
         WHERE id = $5`,
        [categoria, condicao, acao, exemplo || '', id]
      );

      await client.end();
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erro ao editar:', error);
      await client.end();
      return res.status(500).json({ error: 'Erro ao editar regra.' });
    }
  }

  await client.end();
  return res.status(405).end();
}


