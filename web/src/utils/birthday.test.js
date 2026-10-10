import { isBirthdayPhrase, isBirthdayPrefix, isBirthdayWindow } from './birthday';

describe('birthday Easter egg', () => {
  it.each([
    'Happy Birthday', 'happy birthday', 'Happy  Birthday!!', 'HAPPYBIRTHDAY', 'hbd', 'HBD 🎉', ' h.b.d ', 'สุขสันต์วันเกิด',
  ])('opens the party for %p', (q) => {
    expect(isBirthdayPhrase(q)).toBe(true);
  });

  it.each(['happy', 'birthday', 'hbd1', 'CSS221', '', null])('searches normally for %p', (q) => {
    expect(isBirthdayPhrase(q)).toBe(false);
  });

  it('notices someone part-way through typing it', () => {
    expect(isBirthdayPrefix('hap')).toBe(true);
    expect(isBirthdayPrefix('Happy Bir')).toBe(true);
    expect(isBirthdayPrefix('hb')).toBe(true);
    expect(isBirthdayPrefix('h')).toBe(false);   // too short to mean anything
    expect(isBirthdayPrefix('hbd')).toBe(false); // complete, not part-way
    expect(isBirthdayPrefix('css')).toBe(false);
  });

  it('runs 1 Oct to 4 Nov 2026, Bangkok time', () => {
    expect(isBirthdayWindow(new Date('2026-09-30T23:59:59+07:00'))).toBe(false);
    expect(isBirthdayWindow(new Date('2026-10-01T00:00:00+07:00'))).toBe(true);
    expect(isBirthdayWindow(new Date('2026-11-04T23:59:59+07:00'))).toBe(true);
    expect(isBirthdayWindow(new Date('2026-11-05T00:00:00+07:00'))).toBe(false);
  });
});
