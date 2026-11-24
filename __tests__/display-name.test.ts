import { displayName, householdLabel } from '@/lib/displayName';

describe('displayName', () => {
  it('capitalises each word', () => {
    expect(displayName('alice smith')).toBe('Alice Smith');
  });

  it('capitalises after a hyphen', () => {
    expect(displayName('anne-marie de vries')).toBe('Anne-Marie De Vries');
  });

  it('leaves the rest of each word as stored', () => {
    expect(displayName("o'neil mcdonald")).toBe("O'neil Mcdonald");
    expect(displayName('aLice')).toBe('ALice');
  });

  it('handles a single word, extra spaces and non-ASCII letters', () => {
    expect(displayName('alice')).toBe('Alice');
    expect(displayName('alice  bob')).toBe('Alice  Bob');
    expect(displayName('élodie')).toBe('Élodie');
  });

  it('returns an empty string for empty, null and undefined', () => {
    expect(displayName('')).toBe('');
    expect(displayName(null)).toBe('');
    expect(displayName(undefined)).toBe('');
  });
});

describe('householdLabel', () => {
  it("shows the capitalised owner name and 's household", () => {
    expect(householdLabel('alice')).toBe("Alice's household");
    expect(householdLabel('anne-marie de vries')).toBe("Anne-Marie De Vries's household");
  });

  it('is empty when there is no owner', () => {
    expect(householdLabel(null)).toBe('');
    expect(householdLabel(undefined)).toBe('');
  });
});
