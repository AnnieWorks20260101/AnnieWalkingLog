/** 0/O/1/I/L を除いた文字（読み間違い防止） */
export const INVITE_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const INVITE_CODE_LENGTH = 8;

/** ハイフンを除去し大文字化 */
export function compactInviteCode(code) {
  return typeof code === 'string' ? code.replace(/-/g, '').toUpperCase() : '';
}

/** 表示・共有用に "XXXX-XXXX" 形式へ整形 */
export function formatInviteCode(code) {
  const compact = compactInviteCode(code);
  if (compact.length <= 4) {
    return compact;
  }
  return `${compact.slice(0, 4)}-${compact.slice(4, INVITE_CODE_LENGTH)}`;
}

/** 8桁・許容文字のみで構成された正しい招待コードか */
export function isValidInviteCodeInput(input) {
  const compact = compactInviteCode(input);
  if (compact.length !== INVITE_CODE_LENGTH) {
    return false;
  }
  return [...compact].every((ch) => INVITE_CODE_ALPHABET.includes(ch));
}

/** 入力中のテキストを招待コード形式に整形（許容外の文字は除去、最大8桁） */
export function sanitizeInviteCodeInput(input) {
  const compact = compactInviteCode(input)
    .split('')
    .filter((ch) => INVITE_CODE_ALPHABET.includes(ch))
    .slice(0, INVITE_CODE_LENGTH)
    .join('');
  return formatInviteCode(compact);
}

/** ランダムな8桁招待コードを生成（"XXXX-XXXX" 形式） */
export function generateInviteCode() {
  let compact = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i += 1) {
    compact += INVITE_CODE_ALPHABET[Math.floor(Math.random() * INVITE_CODE_ALPHABET.length)];
  }
  return formatInviteCode(compact);
}
