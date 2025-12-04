/**
 * Utilitários de validação para o backend
 */

/**
 * Valida formato de email
 */
function validateEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida CPF
 */
function validateCPF(cpf) {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  const digits = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (digits.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
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
function validateCNPJ(cnpj) {
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
function validateCPForCNPJ(value) {
  if (!value) return true; // Campo opcional
  
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
function validatePhone(phone) {
  if (!phone) return true; // Campo opcional
  
  const digits = phone.replace(/\D/g, '');
  
  // Telefone fixo: 10 dígitos (DDD + 8 dígitos)
  // Celular: 11 dígitos (DDD + 9 dígitos)
  return digits.length === 10 || digits.length === 11;
}

/**
 * Remove caracteres não numéricos
 */
function unmask(value) {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

module.exports = {
  validateEmail,
  validateCPF,
  validateCNPJ,
  validateCPForCNPJ,
  validatePhone,
  unmask
};
