import Head from 'next/head';
import GestorDeRegras from '/modules/components/Regras/GestorDeRegras';

export default function PaginaRegras() {
  return (
    <>
      <Head>
        <title>Gestor de Regras | TAMAI.OS</title>
      </Head>
      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <GestorDeRegras />
      </main>
    </>
  );
}


