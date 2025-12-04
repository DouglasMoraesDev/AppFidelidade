import React, { useState } from 'react';
import SuccessModal from '../SuccessModal';
import { InputField } from '../InputField';
import { UserIcon, PhoneIcon, StarIcon } from '../icons/Icons';
import { validatePhone, unmask, ERROR_MESSAGES, PLACEHOLDERS } from '../../src/utils/validations';

interface AddClientProps {
  onAddClient: (client: { name: string; phone: string; points: number }) => void;
}

const AddClient: React.FC<AddClientProps> = ({ onAddClient }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [points, setPoints] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [clientName, setClientName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Validação de nome
    if (!name.trim()) {
      newErrors.name = ERROR_MESSAGES.REQUIRED_FIELD;
    }
    
    // Validação de telefone
    if (!phone.trim()) {
      newErrors.phone = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!validatePhone(phone)) {
      newErrors.phone = ERROR_MESSAGES.PHONE_INVALID;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setClientName(name);
    // Remove máscara antes de enviar
    onAddClient({ name, phone: unmask(phone), points });
    setName('');
    setPhone('');
    setPoints(0);
    setShowSuccess(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Cadastrar Novo Cliente</h1>
        <p className="text-on-surface-secondary">Preencha os dados para adicionar um cliente.</p>
      </div>
      <div className="max-w-lg mx-auto bg-surface p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            id="name"
            label="Nome"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            icon={<UserIcon className="h-5 w-5 text-on-surface-secondary" />}
            placeholder={PLACEHOLDERS.NAME}
            required
            error={errors.name}
          />
          <InputField
            id="phone"
            label="Telefone"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            icon={<PhoneIcon className="h-5 w-5 text-on-surface-secondary" />}
            placeholder={PLACEHOLDERS.PHONE}
            mask="phone"
            required
            error={errors.phone}
          />
          <InputField
            id="points"
            label="Pontos Iniciais"
            type="number"
            value={points}
            onChange={e => setPoints(parseInt(e.target.value, 10) || 0)}
            icon={<StarIcon className="h-5 w-5 text-on-surface-secondary" />}
            min={0}
          />
          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all duration-300"
          >
            Cadastrar Cliente
          </button>
        </form>
      </div>

      {showSuccess && (
        <SuccessModal
          title="Cliente Cadastrado!"
          message={`O cliente ${clientName} foi cadastrado com sucesso.`}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default AddClient;