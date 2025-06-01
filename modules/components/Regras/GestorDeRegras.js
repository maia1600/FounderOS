import { useEffect, useState } from 'react';
import NovaRegraForm from './NovaRegraForm';
import RegraCard from './RegraCard';

export default function GestorDeRegras() {
  const [regras, setRegras] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarRegras = async () => {
    setCarregando(true);
    try {
      const res = await fetch('/api/regras');
      const data = await res.json();
      setRegras(data);
    } catch (err) {
      console.error('Erro ao carregar regras:', err);
      setRegras([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarRegras();
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Gestor de Regras</h2>
      <NovaRegraForm onCriar={carregarRegras} />
      {carregando ? (
        <p>A carregar regras...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {regras.length === 0 ? (
            <p>Nenhuma regra encontrada.</p>
          ) : (
            regras.map((regra) => (
              <RegraCard key={regra.id} regra={regra} onAtualizar={carregarRegras} />
            ))
          )}
        </ul>
      )}
    </div>
  );
}


