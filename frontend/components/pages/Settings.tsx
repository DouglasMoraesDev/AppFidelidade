
import React from 'react';
import { LockClosedIcon, DocumentDownloadIcon, DocumentTextIcon, LogoutIcon, PhotoIcon } from '../icons/Icons';

interface SettingsProps {
  logoUrl: string;
  onLogoUrlChange: (newUrl: string) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ logoUrl, onLogoUrlChange, onLogout }) => {
  const settingsOptions = [
    { title: 'Trocar Senha', action: () => {}, icon: <LockClosedIcon className="h-6 w-6 text-primary" /> },
    { title: 'Fazer Backup', action: () => {}, icon: <DocumentDownloadIcon className="h-6 w-6 text-primary" /> },
    { title: 'Termos do App', action: () => {}, icon: <DocumentTextIcon className="h-6 w-6 text-primary" /> },
    { title: 'Sair', action: onLogout, icon: <LogoutIcon className="h-6 w-6 text-red-400" />, special: true },
  ];

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoUrlChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Configurações</h1>
        <p className="text-on-surface-secondary">Gerencie as configurações da sua conta e do aplicativo.</p>
      </div>

      <div className="max-w-lg mx-auto bg-surface p-6 rounded-lg shadow-lg space-y-6">
        <div>
           <h2 className="text-lg font-semibold text-on-surface mb-4">Logo do Estabelecimento</h2>
           <div className="flex items-center gap-4">
             <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-full bg-background object-cover" />
             <label htmlFor="logo-upload" className="cursor-pointer bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-focus transition-colors">
                Trocar Logo
             </label>
             <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoChange}/>
           </div>
           <p className="text-xs text-on-surface-secondary mt-2">Faça o upload da imagem que será usada como carimbo no cartão fidelidade.</p>
        </div>

        <div className="border-t border-background pt-6">
          <h2 className="text-lg font-semibold text-on-surface mb-4">Outras Configurações</h2>
          <ul className="divide-y divide-background">
            {settingsOptions.map((option, index) => (
              <li key={index}>
                <button onClick={option.action} className={`w-full text-left p-4 flex items-center gap-4 transition-colors ${option.special ? 'hover:bg-red-500/10' : 'hover:bg-background/50'}`}>
                  {option.icon}
                  <span className={`flex-1 font-medium ${option.special ? 'text-red-400' : 'text-on-surface'}`}>
                    {option.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Settings;
