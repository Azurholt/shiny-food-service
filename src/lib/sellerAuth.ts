export type CanonicalSellerPhone = {
  local: string;
  e164: string;
};

export function normalizeGhanaPhone(input: string): CanonicalSellerPhone {
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

export function sellerCredentialEmail(localPhone: string): string {
  return `kueue_seller_${localPhone}@app.local`;
}

export function sellerCredentialPassword(pin: string): string {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 digits.');
  }

  return `KUE_${pin}`;
}
