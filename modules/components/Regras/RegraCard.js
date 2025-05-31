// /modules/components/Regras/RegraCard.js
import { useState } from 'react'

export default function RegraCard({ regra, onAtualizar }) {
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({ ...regra })
  const [erro, setErro] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const aprovar = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/regras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: regra.id })
      })
      if (!res.ok) throw new Error('Falha ao aprovar')
      onAtualizar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  const rejeitar = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/regras', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: regra.id })
      })
      if (!res.ok) throw new Error('Falha ao rejeitar')
      onAtualizar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  const editar = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/regras', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          categoria: form.categoria,
          condicao: form.condicao,
          acao: form.acao,
          exemplo: form.exemplo
        })
      })
      if (!res.ok) throw new Error('Falha ao editar')
      setEditando(false)
      onAtualizar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <li style={{ marginBottom: '2rem' }}>
      {editando ? (
        <div>
          <input name="categoria" value={form.categoria} onChange={handleChange} /> <br />
          <input name="condicao" value={form.condicao} onChange={handleChange} /> <br />
          <input name="acao" value={form.acao} onChange={handleChange} /> <br />
          <input name="exemplo" value={form.exemplo || ''} onChange={handleChange} /> <br />
          <button onClick={editar} disabled={loading}>Guardar</button>
          <button onClick={() => setEditando(false)}>Cancelar</button>
        </div>
      ) : (
        <div>
          <strong>Categoria:</strong> {regra.categoria} <br />
          <strong>Condição:</strong> {regra.condicao} <br />
          <strong>Ação:</strong> {regra.acao} <br />
          <strong>Exemplo:</strong> {regra.exemplo || '---'} <br />
          <button onClick={aprovar} disabled={loading}>Aprovar</button>
          <button onClick={rejeitar} disabled={loading}>Rejeitar</button>
          <button onClick={() => setEditando(true)}>Editar</button>
        </div>
      )}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </li>
  )
}

