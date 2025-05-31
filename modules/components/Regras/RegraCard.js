// /modules/components/Regras/RegraCard.js
import { useState } from 'react'

export default function RegraCard({ regra, onAtualizar }) {
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({
    categoria: regra.categoria,
    condicao: regra.condicao,
    acao: regra.acao,
    exemplo: regra.exemplo || ''
  })
  const [mensagem, setMensagem] = useState('')

  const aprovar = async () => {
    const res = await fetch('/api/regras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: regra.id })
    })
    if (res.ok) onAtualizar()
    else setMensagem('Falha ao aprovar')
  }

  const rejeitar = async () => {
    const res = await fetch('/api/regras', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: regra.id })
    })
    if (res.ok) onAtualizar()
    else setMensagem('Falha ao rejeitar')
  }

  const editar = async () => {
    const res = await fetch('/api/regras', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: regra.id, ...form })
    })
    if (res.ok) {
      setEditando(false)
      onAtualizar()
    } else {
      setMensagem('Falha ao editar')
    }
  }

  return (
    <li style={{ marginBottom: '1.5rem' }}>
      {editando ? (
        <div>
          <input
            placeholder="Categoria"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          /><br />
          <input
            placeholder="Condição"
            value={form.condicao}
            onChange={(e) => setForm({ ...form, condicao: e.target.value })}
          /><br />
          <input
            placeholder="Ação"
            value={form.acao}
            onChange={(e) => setForm({ ...form, acao: e.target.value })}
          /><br />
          <input
            placeholder="Exemplo"
            value={form.exemplo}
            onChange={(e) => setForm({ ...form, exemplo: e.target.value })}
          /><br />
          <button onClick={editar}>Guardar</button>
          <button onClick={() => setEditando(false)}>Cancelar</button>
        </div>
      ) : (
        <div>
          <strong>Categoria:</strong> {regra.categoria}<br />
          <strong>Condição:</strong> {regra.condicao}<br />
          <strong>Ação:</strong> {regra.acao}<br />
          {regra.exemplo && (
            <><strong>Exemplo:</strong> {regra.exemplo}<br /></>
          )}
        </div>
      )}
      {!editando && (
        <div style={{ marginTop: '0.5rem' }}>
          <button onClick={aprovar}>Aprovar</button>{' '}
          <button onClick={rejeitar}>Rejeitar</button>{' '}
          <button onClick={() => setEditando(true)}>Editar</button>
        </div>
      )}
      {mensagem && <div style={{ color: 'red' }}>{mensagem}</div>}
    </li>
  )
}


