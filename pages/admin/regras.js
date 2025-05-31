// /pages/admin/regras.js
import { useEffect, useState } from 'react'
import AprovarRegraButton from '@/modules/components/Regras/AprovarRegraButton'

export default function PainelRegras() {
  const [regras, setRegras] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRegras = async () => {
    setLoading(true)
    const res = await fetch('/api/regras?sugestoes')
    const data = await res.json()
    setRegras(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchRegras()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Sugestões da IA</h1>
      {loading ? (
        <p>A carregar...</p>
      ) : regras.length === 0 ? (
        <p>Sem sugestões de momento.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Categoria</th>
              <th className="p-2 text-left">Condição</th>
              <th className="p-2 text-left">Ação</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {regras.map((r, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{r.categoria}</td>
                <td className="p-2">{r.condicao}</td>
                <td className="p-2">{r.acao}</td>
                <td className="p-2">
                  <AprovarRegraButton regraId={r.id} onSuccess={fetchRegras} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

