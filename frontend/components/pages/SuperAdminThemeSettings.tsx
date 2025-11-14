import React from 'react';
import { Theme } from '../../types';

interface SuperAdminThemeSettingsProps {
  currentTheme: Theme;
  onThemeChange: (newTheme: Theme) => void;
}

const fonts = [
  { name: 'Inter', value: "'Inter', sans-serif" },
  { name: 'Roboto', value: "'Roboto', sans-serif" },
  { name: 'Lato', value: "'Lato', sans-serif" },
  { name: 'Open Sans', value: "'Open Sans', sans-serif" },
];

const SuperAdminThemeSettings: React.FC<SuperAdminThemeSettingsProps> = ({ currentTheme, onThemeChange }) => {

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onThemeChange({ ...currentTheme, [name]: value });
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onThemeChange({ ...currentTheme, fontFamily: e.target.value });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Aparência do App</h1>
        <p className="text-on-surface-secondary">Personalize as cores e a fonte da plataforma.</p>
      </div>

      <div className="max-w-2xl mx-auto bg-surface p-6 rounded-lg shadow-lg space-y-6">
        {/* Color Settings */}
        <div>
          <h2 className="text-xl font-semibold text-on-surface mb-4">Paleta de Cores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ColorInput label="Primária" name="primary" value={currentTheme.primary} onChange={handleColorChange} />
            <ColorInput label="Primária (Foco)" name="primaryFocus" value={currentTheme.primaryFocus} onChange={handleColorChange} />
            <ColorInput label="Secundária" name="secondary" value={currentTheme.secondary} onChange={handleColorChange} />
            <ColorInput label="Fundo Principal" name="background" value={currentTheme.background} onChange={handleColorChange} />
            <ColorInput label="Fundo (Superfície)" name="surface" value={currentTheme.surface} onChange={handleColorChange} />
          </div>
        </div>
        
        <div className="border-t border-background pt-6">
            <h2 className="text-xl font-semibold text-on-surface mb-4">Tipografia</h2>
             <div>
                <label htmlFor="font-family" className="block text-sm font-medium text-on-surface-secondary mb-2">
                    Fonte do Aplicativo
                </label>
                <select
                    id="font-family"
                    value={currentTheme.fontFamily}
                    onChange={handleFontChange}
                    className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-secondary focus:outline-none transition"
                >
                    {fonts.map(font => (
                        <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                            {font.name}
                        </option>
                    ))}
                </select>
             </div>
        </div>

      </div>
    </div>
  );
};

const ColorInput: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, value, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-on-surface-secondary mb-2">{label}</label>
    <div className="flex items-center gap-2 bg-background p-2 rounded-md border border-slate-600">
      <input
        id={name}
        name={name}
        type="color"
        value={value}
        onChange={onChange}
        className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-transparent"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full bg-transparent text-on-surface focus:outline-none"
      />
    </div>
  </div>
);

export default SuperAdminThemeSettings;