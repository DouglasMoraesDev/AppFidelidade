// frontend/src/components/pages/RegisterPage.tsx
import React, { useState } from 'react';
import {
  GiftIcon,
  BuildingOfficeIcon,
  UserIcon,
  LockClosedIcon,
  MapPinIcon,
  IdentificationIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  PhotoIcon
} from '../icons/Icons';
import { postEstabelecimento, login as apiLogin } from '../../src/utils/api';
import { InputField } from '../InputField';
import { 
  validateEmail, 
  validateCPForCNPJ, 
  validatePhone, 
  unmask, 
  ERROR_MESSAGES,
  PLACEHOLDERS 
} from '../../src/utils/validations';

type RegisterData = {
  name: string;
  address?: string;
  cpfCnpj?: string;
  phone?: string;
  email?: string;
  voucherMessage?: string;
  pointsForVoucher: number;
  username: string;
  password: string;
};

interface RegisterPageProps {
  onRegister: (establishment: RegisterData) => void;
  onNavigateToLogin?: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    cpfCnpj: '',
    phone: '',
    email: '',
    voucherMessage: 'Parabéns, {cliente}! Você ganhou um brinde especial!',
    pointsForVoucher: 10,
    username: '',
    password: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Nome obrigatório
    if (!formData.name.trim()) {
      newErrors.name = ERROR_MESSAGES.REQUIRED_FIELD;
    }
    
    // Email opcional, mas se preenchido deve ser válido
    if (formData.email && formData.email.trim() && !validateEmail(formData.email)) {
      newErrors.email = ERROR_MESSAGES.EMAIL_INVALID;
    }
    
    // CPF/CNPJ opcional, mas se preenchido deve ser válido
    if (formData.cpfCnpj && formData.cpfCnpj.trim() && !validateCPForCNPJ(formData.cpfCnpj)) {
      newErrors.cpfCnpj = ERROR_MESSAGES.CPFCNPJ_INVALID;
    }
    
    // Telefone opcional, mas se preenchido deve ser válido
    if (formData.phone && formData.phone.trim() && !validatePhone(formData.phone)) {
      newErrors.phone = ERROR_MESSAGES.PHONE_INVALID;
    }
    
    // Usuário obrigatório
    if (!formData.username.trim()) {
      newErrors.username = ERROR_MESSAGES.REQUIRED_FIELD;
    }
    
    // Senha obrigatória e mínimo 6 caracteres
    if (!formData.password) {
      newErrors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.password.length < 6) {
      newErrors.password = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    }
    
    // Confirmar senha
    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem.';
    }
    
    // Pontos para voucher
    if (Number(formData.pointsForVoucher) <= 0) {
      newErrors.pointsForVoucher = 'Pontos para voucher deve ser maior que zero.';
    }
    
    // Logo obrigatório
    if (!logoFile) {
      newErrors.logo = 'O logo é obrigatório.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, pointsForVoucher: parseInt(e.target.value, 10) || 0 }));
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setLogoFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(String(reader.result));
      reader.readAsDataURL(f);
    } else {
      setLogoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!validate()) {
      setShowErrorModal(true);
      return;
    }

    if (!logoFile) return;

    setLoading(true);
    try {
      // monta FormData com os nomes que o backend espera
      const fd = new FormData();
      fd.append('nome', formData.name);
      fd.append('endereco', formData.address || '');
      // Remove máscaras antes de enviar
      fd.append('cpf_cnpj', formData.cpfCnpj ? unmask(formData.cpfCnpj) : '');
      fd.append('telefone', formData.phone ? unmask(formData.phone) : '');
      fd.append('email', formData.email || '');
      fd.append('mensagem_voucher', formData.voucherMessage || '');
      fd.append('nomeUsuario', formData.username);
      fd.append('senha', formData.password);
      fd.append('pontos_para_voucher', String(formData.pointsForVoucher));

      fd.append('logo', logoFile as File);

      // envia para backend
      const res = await postEstabelecimento(fd);

      // res esperado: { estabelecimento: {...}, usuario: {...} } conforme seu backend
      const createdEstab = res && res.estabelecimento ? res.estabelecimento : null;
      if (!createdEstab) {
        setStatusMsg('Cadastro concluído, mas resposta inesperada do servidor.');
      } else {
        setStatusMsg('Estabelecimento criado com sucesso.');

        // tenta login automático (opcional)
        try {
          const loginResp = await apiLogin(formData.username, formData.password);
          if (loginResp && loginResp.token) {
            localStorage.setItem('token', loginResp.token);
          }
        } catch (err) {
          // não bloqueia fluxo caso login automático falhe
          console.warn('Login automático falhou após cadastro:', err);
        }

        // monta payload local (frontend) e chama callback para integrar à UI local
        const payload: RegisterData = {
          name: createdEstab.nome || formData.name,
          address: createdEstab.endereco || formData.address,
          cpfCnpj: createdEstab.cpf_cnpj || formData.cpfCnpj,
          phone: createdEstab.telefone || formData.phone,
          email: createdEstab.email || formData.email,
          voucherMessage: createdEstab.mensagem_voucher || formData.voucherMessage,
          pointsForVoucher: formData.pointsForVoucher,
          username: formData.username,
          password: formData.password,
        };

        onRegister(payload);
      }
    } catch (err: any) {
      console.error('Erro ao cadastrar no backend:', err);
      // tenta extrair mensagem estruturada
      const message =
        (err && (err.error || err.message || (err?.error?.message))) ||
        'Erro desconhecido ao cadastrar. Veja console / network.';
      setStatusMsg(String(message));
    } finally {
      setLoading(false);
    }
  };

  const getFieldLabel = (fieldKey: string): string => {
    const labels: Record<string, string> = {
      name: 'Nome do Estabelecimento',
      email: 'E-mail',
      cpfCnpj: 'CPF/CNPJ',
      phone: 'Telefone',
      username: 'Usuário de Acesso',
      password: 'Senha',
      confirmPassword: 'Confirmar Senha',
      pointsForVoucher: 'Pontos para Voucher',
      logo: 'Logo do Estabelecimento'
    };
    return labels[fieldKey] || fieldKey;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Modal de Erros */}
      {showErrorModal && Object.keys(errors).length > 0 && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Atenção!</h3>
            </div>
            
            <p className="text-on-surface-secondary mb-4">
              Corrija os seguintes campos antes de continuar:
            </p>
            
            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {Object.entries(errors).map(([field, message]) => (
                <div key={field} className="flex items-start gap-2 p-2 bg-red-500/10 rounded border border-red-500/30">
                  <span className="text-red-500 font-bold">•</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">{getFieldLabel(field)}</p>
                    <p className="text-xs text-on-surface-secondary">{message}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-focus transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <GiftIcon className="h-16 w-16 text-primary mx-auto" />
          <h1 className="text-3xl font-bold text-on-surface mt-4">Crie sua Conta</h1>
          <p className="text-on-surface-secondary">Cadastre seu estabelecimento para começar.</p>
        </div>

        <div className="bg-surface p-8 rounded-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                id="name" 
                label="Nome do Estabelecimento" 
                type="text" 
                value={formData.name} 
                onChange={handleChange} 
                icon={<BuildingOfficeIcon className="h-5 w-5 text-on-surface-secondary" />}
                placeholder={PLACEHOLDERS.ESTABLISHMENT_NAME}
                required
                error={errors.name}
              />
              <InputField 
                id="cpfCnpj" 
                label="CPF / CNPJ" 
                type="text" 
                value={formData.cpfCnpj} 
                onChange={handleChange} 
                icon={<IdentificationIcon className="h-5 w-5 text-on-surface-secondary" />}
                placeholder={PLACEHOLDERS.CPFCNPJ}
                mask="cpfcnpj"
                error={errors.cpfCnpj}
              />
            </div>

            <InputField 
              id="address" 
              label="Endereço" 
              type="text" 
              value={formData.address} 
              onChange={handleChange} 
              icon={<MapPinIcon className="h-5 w-5 text-on-surface-secondary" />}
              placeholder={PLACEHOLDERS.ADDRESS}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                id="phone" 
                label="Telefone" 
                type="tel" 
                value={formData.phone} 
                onChange={handleChange} 
                icon={<PhoneIcon className="h-5 w-5 text-on-surface-secondary" />}
                placeholder={PLACEHOLDERS.PHONE}
                mask="phone"
                error={errors.phone}
              />
              <InputField 
                id="email" 
                label="E-mail (opcional)" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                icon={<EnvelopeIcon className="h-5 w-5 text-on-surface-secondary" />}
                placeholder={PLACEHOLDERS.EMAIL}
                error={errors.email}
              />
            </div>

            <div>
              <label htmlFor="voucherMessage" className="block text-sm font-medium text-on-surface-secondary mb-1">Mensagem Padrão do Voucher</label>
              <textarea id="voucherMessage" value={formData.voucherMessage} onChange={(e) => setFormData(prev => ({ ...prev, voucherMessage: e.target.value }))} rows={2} className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none transition" />
              <p className="text-xs text-on-surface-secondary mt-1">Use {'{cliente}'} para o nome do cliente.</p>
            </div>

            <div className="mb-4 p-3 bg-background/40 rounded">
              <p className="text-sm text-on-surface-secondary">
                Ao criar sua conta, você receberá <strong>31 dias de teste gratuito</strong>. Após este período, será cobrada mensalmente a partir da data de cadastro o valor de <strong>R$ 29,90</strong> por mês. Você poderá pagar a qualquer momento na tela de pagamentos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <InputField 
                  id="pointsForVoucher" 
                  label="Pontos necessários para liberar o voucher" 
                  type="number" 
                  value={formData.pointsForVoucher} 
                  onChange={handlePointsChange} 
                  icon={<StarIcon className="h-5 w-5 text-on-surface-secondary" />} 
                  min={1}
                  required
                  error={errors.pointsForVoucher}
                />
              </div>
            </div>

            <div className="border-t border-slate-600 my-2"></div>

            <div className="mb-3 p-3 bg-primary/10 rounded-lg border border-primary/30">
              <p className="text-sm text-on-surface font-medium">
                📱 <strong>Dados de Acesso ao App</strong>
              </p>
              <p className="text-xs text-on-surface-secondary mt-1">
                Crie um nome de usuário e senha para fazer login no aplicativo e gerenciar seus clientes.
              </p>
            </div>

            <InputField 
              id="username" 
              label="Usuário de Acesso" 
              type="text" 
              value={formData.username} 
              onChange={handleChange} 
              icon={<UserIcon className="h-5 w-5 text-on-surface-secondary" />}
              placeholder="Ex: meunegocio123"
              required
              error={errors.username}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                id="password" 
                label="Senha" 
                type="password" 
                value={formData.password} 
                onChange={handleChange} 
                icon={<LockClosedIcon className="h-5 w-5 text-on-surface-secondary" />}
                placeholder={PLACEHOLDERS.PASSWORD}
                required
                error={errors.password}
                autoComplete="new-password"
              />
              <InputField 
                id="confirmPassword" 
                label="Confirmar Senha" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                icon={<LockClosedIcon className="h-5 w-5 text-on-surface-secondary" />}
                placeholder={PLACEHOLDERS.PASSWORD}
                required
                error={errors.confirmPassword}
                autoComplete="new-password"
              />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-on-surface-secondary mb-2">Logo do estabelecimento *</label>
              <div className="flex items-center gap-4">
                <label htmlFor="logo" className="cursor-pointer bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-focus transition-colors flex items-center gap-2">
                  <PhotoIcon className="h-5 w-5" />
                  Escolher imagem
                </label>
                <input id="logo" type="file" accept="image/*" onChange={handleLogoFile} className="hidden" />
                {logoPreview && <img src={logoPreview} alt="preview" className="w-14 h-14 rounded-md object-cover border" />}
              </div>
              <p className="text-xs text-on-surface-secondary mt-1">A imagem será usada como carimbo no cartão fidelidade.</p>
              {errors.logo && <p className="text-red-400 text-xs mt-1">{errors.logo}</p>}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all duration-300 !mt-6">
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          {statusMsg && <div className="mt-4 text-center text-sm">{statusMsg}</div>}
        </div>

        {onNavigateToLogin && (
          <div className="text-center mt-6">
            <p className="text-on-surface-secondary">Já tem uma conta?</p>
            <button onClick={onNavigateToLogin} className="font-semibold text-primary hover:text-primary-focus">
              Faça o login aqui
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
