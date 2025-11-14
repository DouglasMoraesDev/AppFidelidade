import React, { useState, useEffect } from 'react';
import { Establishment } from '../../types';
import { 
    GiftIcon, 
    BuildingOfficeIcon, 
    UserIcon, 
    LockClosedIcon,
    MapPinIcon,
    IdentificationIcon,
    PhoneIcon,
    EnvelopeIcon,
    ChatBubbleLeftEllipsisIcon,
    StarIcon,
    CalendarIcon
} from '../icons/Icons';

type RegisterData = Omit<Establishment, 'id' | 'clients' | 'totalVouchersSent' | 'logoUrl' | 'paymentHistory'> & { lastPaymentDate: string };

interface RegisterPageProps {
    onRegister: (establishment: RegisterData) => void;
    onNavigateToLogin?: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onNavigateToLogin }) => {
    const [formData, setFormData] = useState<RegisterData>({
        name: '',
        address: '',
        cpfCnpj: '',
        phone: '',
        email: '',
        voucherMessage: 'Parabéns, {cliente}! Você ganhou um brinde especial!',
        pointsForVoucher: 10,
        lastPaymentDate: new Date().toISOString().split('T')[0],
        username: '',
        passwordHash: '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Nome do estabelecimento é obrigatório.';
        if (!formData.username) newErrors.username = 'Usuário de acesso é obrigatório.';
        if (!formData.passwordHash) newErrors.passwordHash = 'Senha é obrigatória.';
        if (formData.passwordHash.length < 6) newErrors.passwordHash = 'A senha deve ter no mínimo 6 caracteres.';
        if (formData.passwordHash !== confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem.';
        if (formData.pointsForVoucher <= 0) newErrors.pointsForVoucher = 'O valor deve ser maior que zero.';
        if (!formData.lastPaymentDate) newErrors.lastPaymentDate = 'A data é obrigatória.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value }));
    };

    const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, pointsForVoucher: parseInt(e.target.value, 10) || 0}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onRegister(formData);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <GiftIcon className="h-16 w-16 text-primary mx-auto"/>
                    <h1 className="text-3xl font-bold text-on-surface mt-4">Crie sua Conta</h1>
                    <p className="text-on-surface-secondary">Cadastre seu estabelecimento para começar.</p>
                </div>

                <div className="bg-surface p-8 rounded-xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Fields omitted for brevity but they would use handleChange and display errors from the errors state object */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputField id="name" label="Nome do Estabelecimento *" type="text" value={formData.name} onChange={handleChange} icon={<BuildingOfficeIcon className="h-5 w-5 text-on-surface-secondary" />} />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>
                             <InputField id="cpfCnpj" label="CPF / CNPJ" type="text" value={formData.cpfCnpj!} onChange={handleChange} icon={<IdentificationIcon className="h-5 w-5 text-on-surface-secondary" />} />
                        </div>
                        <InputField id="address" label="Endereço" type="text" value={formData.address!} onChange={handleChange} icon={<MapPinIcon className="h-5 w-5 text-on-surface-secondary" />} />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField id="phone" label="Telefone" type="tel" value={formData.phone!} onChange={handleChange} icon={<PhoneIcon className="h-5 w-5 text-on-surface-secondary" />} />
                            <InputField id="email" label="E-mail" type="email" value={formData.email!} onChange={handleChange} icon={<EnvelopeIcon className="h-5 w-5 text-on-surface-secondary" />} />
                        </div>
                        <div>
                            <label htmlFor="voucherMessage" className="block text-sm font-medium text-on-surface-secondary mb-1">Mensagem Padrão do Voucher</label>
                            <textarea id="voucherMessage" value={formData.voucherMessage} onChange={handleChange} rows={2} className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none transition" />
                            <p className="text-xs text-on-surface-secondary mt-1">Use `{'{cliente}'}` para o nome.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputField id="pointsForVoucher" label="Pontos para Voucher *" type="number" value={formData.pointsForVoucher} onChange={handlePointsChange} icon={<StarIcon className="h-5 w-5 text-on-surface-secondary" />} min={1} />
                                {errors.pointsForVoucher && <p className="text-red-400 text-xs mt-1">{errors.pointsForVoucher}</p>}
                            </div>
                            <div>
                                <InputField id="lastPaymentDate" label="Data do 1º Pagamento *" type="date" value={formData.lastPaymentDate} onChange={handleChange} icon={<CalendarIcon className="h-5 w-5 text-on-surface-secondary" />} />
                                {errors.lastPaymentDate && <p className="text-red-400 text-xs mt-1">{errors.lastPaymentDate}</p>}
                            </div>
                        </div>
                        <div className="border-t border-slate-600 my-2"></div>
                        <div>
                           <InputField id="username" label="Usuário de Acesso *" type="text" value={formData.username} onChange={handleChange} icon={<UserIcon className="h-5 w-5 text-on-surface-secondary" />} />
                           {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <InputField id="passwordHash" label="Senha *" type="password" value={formData.passwordHash} onChange={handleChange} icon={<LockClosedIcon className="h-5 w-5 text-on-surface-secondary" />} />
                                {errors.passwordHash && <p className="text-red-400 text-xs mt-1">{errors.passwordHash}</p>}
                             </div>
                             <div>
                                <InputField id="confirmPassword" label="Confirmar Senha *" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} icon={<LockClosedIcon className="h-5 w-5 text-on-surface-secondary" />} />
                                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                             </div>
                        </div>
                        <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all duration-300 !mt-6">
                            Cadastrar
                        </button>
                    </form>
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

// InputField component to be used within RegisterPage
const InputField: React.FC<{
    id: string;
    label: string;
    type: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon: React.ReactNode;
    min?: number;
}> = ({ id, label, type, value, onChange, icon, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-on-surface-secondary mb-1">{label}</label>
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">{icon}</span>
            <input id={id} name={id} type={type} value={value} onChange={onChange}
                className="w-full bg-background text-on-surface p-3 pl-10 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none transition" {...props} />
        </div>
    </div>
);


export default RegisterPage;
