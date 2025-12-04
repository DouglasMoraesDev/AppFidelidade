import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from './icons/Icons';

interface InputFieldProps {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'password' | 'number';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  required?: boolean;
  error?: string;
  min?: number;
  autoComplete?: string;
  mask?: 'phone' | 'cpf' | 'cnpj' | 'cpfcnpj' | 'none';
}

/**
 * Componente de input reutilizável com suporte a:
 * - Toggle de visibilidade para senha (olhinho)
 * - Máscaras automáticas (telefone, CPF, CNPJ)
 * - Mensagens de erro
 * - Ícones personalizados
 */
export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  icon,
  placeholder,
  required = false,
  error,
  min,
  autoComplete,
  mask = 'none'
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Aplica máscaras se necessário
    if (mask === 'phone') {
      newValue = maskPhone(newValue);
    } else if (mask === 'cpf') {
      newValue = maskCPF(newValue);
    } else if (mask === 'cnpj') {
      newValue = maskCNPJ(newValue);
    } else if (mask === 'cpfcnpj') {
      newValue = maskCPForCNPJ(newValue);
    }

    // Cria evento sintético com valor mascarado
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: newValue,
        id: e.target.id
      }
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-on-surface-secondary mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          name={id}
          type={inputType}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          min={min}
          autoComplete={autoComplete}
          className={`w-full bg-background text-on-surface p-3 ${icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''} rounded-md border ${
            error ? 'border-red-400' : 'border-slate-600'
          } focus:ring-2 focus:ring-primary focus:outline-none transition`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-secondary hover:text-on-surface transition"
            title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

// ========== Funções de Máscara (duplicadas aqui para o componente ser independente) ==========

function maskPhone(value: string): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  }
}

function maskCPF(value: string): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

function maskCNPJ(value: string): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    .slice(0, 18);
}

function maskCPForCNPJ(value: string): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 11) {
    return maskCPF(value);
  } else {
    return maskCNPJ(value);
  }
}
