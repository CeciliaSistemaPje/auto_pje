import React from 'react';

export const GuiaRapido: React.FC = () => {
  return (
    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-stack-md">
      <div className="flex gap-4">
        <span className="font-metric-xl text-metric-xl text-primary opacity-20">01</span>
        <div>
          <h4 className="font-label-sm text-label-sm text-on-surface mb-1">Copie do PJe</h4>
          <p className="text-on-surface-variant font-body-md text-body-md">Selecione o texto completo da tela de movimentações processuais.</p>
        </div>
      </div>
      <div className="flex gap-4">
        <span className="font-metric-xl text-metric-xl text-primary opacity-20">02</span>
        <div>
          <h4 className="font-label-sm text-label-sm text-on-surface mb-1">Cole aqui</h4>
          <p className="text-on-surface-variant font-body-md text-body-md">Utilize o campo de texto acima para inserir os dados brutos.</p>
        </div>
      </div>
      <div className="flex gap-4">
        <span className="font-metric-xl text-metric-xl text-primary opacity-20">03</span>
        <div>
          <h4 className="font-label-sm text-label-sm text-on-surface mb-1">Organizamos</h4>
          <p className="text-on-surface-variant font-body-md text-body-md">Nós vamos extrair datas, partes e prazos e atualizar a tabela automaticamente.</p>
        </div>
      </div>
    </div>
  );
};