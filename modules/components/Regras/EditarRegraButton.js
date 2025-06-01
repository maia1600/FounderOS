
import React from 'react';

export default function EditarRegraButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded"
    >
      Editar
    </button>
  );
}
