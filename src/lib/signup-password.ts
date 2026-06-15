export function normalizePhoneLoginId(value: string) {
  const digits = value.replace(/\D/g, "");
  return /^010\d{8}$/.test(digits) ? digits : null;
}

export function normalizeLoginIdentifier(value: string) {
  const trimmed = value.trim();
  return normalizePhoneLoginId(trimmed) ?? trimmed;
}

function hasSequentialDigits(value: string) {
  const digits = value.match(/\d+/g) ?? [];
  return digits.some((group) => {
    if (group.length < 4) return false;

    for (let start = 0; start <= group.length - 4; start += 1) {
      const slice = group.slice(start, start + 4);
      const numbers = slice.split("").map(Number);
      const ascending = numbers.every((number, index) => index === 0 || number === numbers[index - 1] + 1);
      const descending = numbers.every((number, index) => index === 0 || number === numbers[index - 1] - 1);
      if (ascending || descending) return true;
    }

    return false;
  });
}

function hasRepeatedCharacters(value: string) {
  return /(.)\1{3,}/.test(value);
}

function isValidMonthDay(month: number, day: number) {
  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

function hasDateLikeDigits(value: string) {
  const digits = value.match(/\d+/g) ?? [];

  return digits.some((group) => {
    for (let start = 0; start <= group.length - 6; start += 1) {
      const sixDigits = group.slice(start, start + 6);
      const month = Number(sixDigits.slice(2, 4));
      const day = Number(sixDigits.slice(4, 6));
      if (isValidMonthDay(month, day)) return true;
    }

    for (let start = 0; start <= group.length - 8; start += 1) {
      const eightDigits = group.slice(start, start + 8);
      const year = Number(eightDigits.slice(0, 4));
      const month = Number(eightDigits.slice(4, 6));
      const day = Number(eightDigits.slice(6, 8));
      if (year >= 1900 && year <= 2099 && isValidMonthDay(month, day)) return true;
    }

    return false;
  });
}

export function validateSignupPassword(password: string, phone: string) {
  if (password.length < 8) {
    return { valid: false, error: "비밀번호는 8자 이상으로 입력해 주세요." };
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return { valid: false, error: "비밀번호는 영문과 숫자를 함께 사용해 주세요." };
  }

  const normalizedPhone = normalizePhoneLoginId(phone);
  if (normalizedPhone) {
    const passwordDigits = password.replace(/\D/g, "");
    if (
      password.includes(normalizedPhone) ||
      passwordDigits.includes(normalizedPhone.slice(-4))
    ) {
      return { valid: false, error: "휴대폰 번호와 같은 숫자는 비밀번호로 사용할 수 없습니다." };
    }
  }

  if (hasDateLikeDigits(password)) {
    return { valid: false, error: "생년월일처럼 보이는 숫자는 비밀번호로 사용할 수 없습니다." };
  }

  if (hasSequentialDigits(password)) {
    return { valid: false, error: "연속된 숫자는 비밀번호로 사용할 수 없습니다." };
  }

  if (hasRepeatedCharacters(password)) {
    return { valid: false, error: "반복된 문자는 비밀번호로 사용할 수 없습니다." };
  }

  return { valid: true };
}
