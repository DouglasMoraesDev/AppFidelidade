/**
 * Utilitários de validação e formatação
 */

// ========== MÁSCARAS ==========

/**
 * Aplica máscara de telefone: (99) 99999-9999 ou (99) 9999-9999
 */
export function maskPhone(value: string): string {
  if (!value) return '';
  
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '');
  
  // Aplica máscara
  if (digits.length <= 10) {
    // Formato: (99) 9999-9999
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Formato: (99) 99999-9999
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15); // Limita tamanho
  }
}

/**
 * Aplica máscara de CPF: 999.999.999-99
 */
export function maskCPF(value: string): string {
  if (!value) return '';
  
  const digits = value.replace(/\D/g, '');
  
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

/**
 * Aplica máscara de CNPJ: 99.999.999/9999-99
 */
export function maskCNPJ(value: string): string {
  if (!value) return '';
  
  const digits = value.replace(/\D/g, '');
  
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    .slice(0, 18);
}

/**
 * Aplica máscara de CPF ou CNPJ automaticamente
 */
export function maskCPForCNPJ(value: string): string {
  if (!value) return '';
  
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 11) {
    return maskCPF(value);
  } else {
    return maskCNPJ(value);
  }
}

// ========== VALIDAÇÕES ==========

/**
 * Valida formato de email
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida CPF
 */
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  const digits = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (digits.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1+$/.test(digits)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  
  if (digit1 !== parseInt(digits.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  
  if (digit2 !== parseInt(digits.charAt(10))) return false;
  
  return true;
}

/**
 * Valida CNPJ
 */
export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) return false;
  
  // Remove caracteres não numéricos
  const digits = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (digits.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(digits)) return false;
  
  // Validação do primeiro dígito verificador
  let length = digits.length - 2;
  let numbers = digits.substring(0, length);
  const verificadores = digits.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(verificadores.charAt(0))) return false;
  
  // Validação do segundo dígito verificador
  length = length + 1;
  numbers = digits.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(verificadores.charAt(1))) return false;
  
  return true;
}

/**
 * Valida CPF ou CNPJ
 */
export function validateCPForCNPJ(value: string): boolean {
  if (!value) return false;
  
  const digits = value.replace(/\D/g, '');
  
  if (digits.length === 11) {
    return validateCPF(value);
  } else if (digits.length === 14) {
    return validateCNPJ(value);
  }
  
  return false;
}

/**
 * Valida telefone brasileiro
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  
  const digits = phone.replace(/\D/g, '');
  
  // Telefone fixo: 10 dígitos (DDD + 8 dígitos)
  // Celular: 11 dígitos (DDD + 9 dígitos)
  return digits.length === 10 || digits.length === 11;
}

/**
 * Remove máscara de um valor (retorna apenas dígitos)
 */
export function unmask(value: string): string {
  return value.replace(/\D/g, '');
}

// ========== MENSAGENS DE ERRO ==========

export const ERROR_MESSAGES = {
  EMAIL_INVALID: 'Email inválido. Use o formato: exemplo@dominio.com',
  CPF_INVALID: 'CPF inválido. Use o formato: 999.999.999-99',
  CNPJ_INVALID: 'CNPJ inválido. Use o formato: 99.999.999/9999-99',
  CPFCNPJ_INVALID: 'CPF/CNPJ inválido',
  PHONE_INVALID: 'Telefone inválido. Use o formato: (99) 99999-9999',
  REQUIRED_FIELD: 'Este campo é obrigatório',
  PASSWORD_TOO_SHORT: 'A senha deve ter no mínimo 6 caracteres'
};

// ========== PLACEHOLDERS ==========

export const PLACEHOLDERS = {
  EMAIL: 'exemplo@dominio.com',
  CPF: '999.999.999-99',
  CNPJ: '99.999.999/9999-99',
  CPFCNPJ: 'CPF ou CNPJ',
  PHONE: '(99) 99999-9999',
  NAME: 'Nome completo',
  ESTABLISHMENT_NAME: 'Nome do estabelecimento',
  ADDRESS: 'Endereço completo',
  PASSWORD: 'Mínimo 6 caracteres'
};
