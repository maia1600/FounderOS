
// /modules/components/Regras/EditarRegraForm.js
import { useState } from 'react'

export default function EditarRegraForm({ regra, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    categoria: regra.categoria,
    condicao: regra.condicao,
    acao: regra.acao,
    exemplo: regra.exemplo || ''
  })

  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErro(null)
    try {
      const res = await fetch('/api/regras/editar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: regra.id, ...formData })
      })
      if (!res.ok) throw new Error('Erro ao guardar alterações')
      onSave()
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-4 border rounded">
      <div>
        <label>Categoria:</label>
        <input name="categoria" value={formData.categoria} onChange={handleChange} className="border px-2 py-1 w-full" />
      </div>
      <div>
        <label>Condição:</label>
        <input name="condicao" value={formData.condicao} onChange={handleChange} className="border px-2 py-1 w-full" />
      </div>
      <div>
        <label>Ação:</label>
        <input name="acao" value={formData.acao} onChange={handleChange} className="border px-2 py-1 w-full" />
      </div>
      <div>
        <label>Exemplo (opcional):</label>
        <input name="exemplo" value={formData.exemplo} onChange={handleChange} className="border px-2 py-1 w-full" />
      </div>
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="bg-green-600 text-white px-3 py-1 rounded">
          {loading ? 'A guardar...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-300 px-3 py-1 rounded">Cancelar</button>
      </div>
    </form>
  )
}
