export type CanonicalCustomerPhone = {
  local: string;
  e164: string;
};

const BLOCKED_SIGNUP_PINS = new Set<string>([
  '0000',
  '1111',
  '1234',
  '2222',
  '3333',
  '4444',
  '4321',
  '5555',
  '6666',
  '7777',
  '8888',
  '9999',
]);

export function normalizeGhanaPhone(input: string): CanonicalCustomerPhone {
  const digits = input.replace(/\D/g, '');
  const local = digits.startsWith('233') ? `0${digits.slice(3)}` : digits;

  if (!/^0[1-9]\d{8}$/.test(local)) {
    throw new Error('Enter a valid Ghanaian phone number.');
  }

  return {
    local,
    e164: `+233${local.slice(1)}`,
  };
}

export function customerCredentialEmail(localPhone: string): string {
  return `kueue_customer_${localPhone}@app.local`;
}

export function customerCredentialPassword(pin: string): string {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 digits.');
  }

  return `KUE_${pin}`;
}

export function validateSignupPin(pin: string): void {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 digits.');
  }

  if (BLOCKED_SIGNUP_PINS.has(pin)) {
    throw new Error('Choose a less predictable 4-digit PIN.');
  }
}
