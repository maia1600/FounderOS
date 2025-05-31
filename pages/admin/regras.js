// pages/admin/regras.js
import { useEffect, useState } from 'react'
import AprovarRegraButton from '/modules/components/Regras/AprovarRegraButton'

export default function PainelRegras() {
  const [regras, setRegras] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchRegras = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/regras?sugestoes')
      const data = await res.json()
      setRegras(data)
    } catch (e) {
      console.error('Erro ao buscar regras:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegras()
  }, [])

  const handleAprovada = (id) => {
    setRegras((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Sugestões de Regras pela IA</h1>
      {loading ? (
        <p>A carregar...</p>
      ) : regras.length === 0 ? (
        <p className="text-gray-500">Nenhuma sugestão de regra pendente.</p>
      ) : (
        <ul className="space-y-4">
          {regras.map((regra) => (
            <li key={regra.id} className="p-4 border rounded bg-white shadow">
              <p><strong>Categoria:</strong> {regra.categoria}</p>
              <p><strong>Condição:</strong> {regra.condicao}</p>
              <p><strong>Ação:</strong> {regra.acao}</p>
              <div className="mt-2">
                <AprovarRegraButton regraId={regra.id} onSuccess={() => handleAprovada(regra.id)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}


