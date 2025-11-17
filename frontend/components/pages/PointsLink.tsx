import React from 'react';
import { QrCodeIcon, ClipboardDocumentIcon } from '../icons/Icons';

interface PointsLinkProps {
  shareLink: string;
  slug?: string;
  logoUrl: string;
}

const PointsLink: React.FC<PointsLinkProps> = ({ shareLink, slug, logoUrl }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(shareLink)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      alert('Link copiado!');
    } catch {
      alert('Não foi possível copiar agora.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Link Público de Pontos</h1>
        <p className="text-on-surface-secondary">Compartilhe com seus clientes para que consultem os pontos sozinhos.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-surface p-6 rounded-lg shadow-lg space-y-4">
          <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">
            <QrCodeIcon className="w-6 h-6 text-primary" />
            QR Code pronto para impressão
          </h2>
          <div className="bg-background/80 p-4 rounded-lg flex flex-col items-center gap-4">
            <img src={qrUrl} alt="QR Code para consulta de pontos" className="w-64 h-64 bg-white p-3 rounded-lg" />
            <p className="text-sm text-on-surface-secondary text-center">Baixe este QR Code e cole no balcão ou menu digital.</p>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-lg shadow-lg space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-on-surface mb-2">Link de Consulta Pública</h2>
            <div className="bg-background/60 p-4 rounded-lg border border-slate-700 space-y-3">
              <p className="text-sm text-on-surface-secondary">Compartilhe este link com seus clientes para que eles consultem seus pontos:</p>
              <div className="flex items-center gap-2">
                <input 
                  value={shareLink} 
                  readOnly 
                  className="flex-1 bg-background text-on-surface text-sm p-2 rounded-md border border-slate-700 font-mono" 
                />
                <button 
                  onClick={handleCopy} 
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary-focus transition"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  Copiar
                </button>
              </div>
              {slug && (
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-xs text-on-surface-secondary mb-1">Slug público:</p>
                  <p className="text-sm font-mono text-primary bg-background p-2 rounded border border-slate-700">{slug}</p>
                </div>
              )}
              <div className="pt-2 border-t border-slate-700">
                <p className="text-xs text-on-surface-secondary">
                  <strong className="text-on-surface">Como usar:</strong> Os clientes acessam este link, informam nome e telefone, e visualizam seus pontos e carimbos.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 space-y-3">
            <p className="text-sm text-on-surface-secondary">Dica: inclua esta chamada nas redes sociais</p>
            <div className="bg-background/50 p-4 rounded-lg text-sm text-on-surface-secondary leading-relaxed">
              <p>1. Abra o aplicativo AppFidelidade.</p>
              <p>2. Escaneie o QR Code ou acesse o link.</p>
              <p>3. Consulte seus pontos e acompanhe os carimbos.</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-on-surface-secondary pt-2 border-t border-slate-700">
              <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-slate-600" />
              <span>O logo cadastrado será usado como carimbo no cartão digital.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsLink;
