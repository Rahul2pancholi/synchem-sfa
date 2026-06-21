export function hashMpinValue(mpin: string): string {
  let hash = 0;
  for (let i = 0; i < mpin.length; i += 1) {
    hash = (hash << 5) - hash + mpin.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

describe('hashMpinValue', () => {
  it('returns stable hash for same mpin', () => {
    expect(hashMpinValue('1234')).toBe(hashMpinValue('1234'));
  });

  it('returns different hash for different mpin', () => {
    expect(hashMpinValue('1234')).not.toBe(hashMpinValue('4321'));
  });
});
