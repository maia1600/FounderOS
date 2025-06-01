
import React from 'react';

export default function AtivarRegraButton({ ativa, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${
        ativa ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'
      } text-white font-bold py-1 px-3 rounded`}
    >
      {ativa ? 'Inativar' : 'Ativar'}
    </button>
  );
}
