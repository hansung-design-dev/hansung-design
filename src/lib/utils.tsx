export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// 숫자만 남기기
export function onlyDigits(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

// 01012345678 -> 010-1234-5678 형식으로 변환 (입력용)
export function formatPhoneInput(value: string): string {
  const digits = onlyDigits(value);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

// 010-1234-5678 형식 검증
export function isValidPhoneFormatted(value: string): boolean {
  return /^[0-9]{3}-[0-9]{3,4}-[0-9]{4}$/.test(value);
}

// 백엔드/저장용 정규화 (숫자만 들어와도 010-1234-5678 로 맞추기)
export function normalizePhone(value: string): string {
  return formatPhoneInput(value);
}
