/**
 * Sınıf adlarını boşlukla birleştirir; yanlış değerler atlanır.
 * Koşullu sınıflar için bunu kullanın: Prettier'ın Tailwind eklentisi className içindeki
 * metinlerin baştaki boşluğunu silip sınıfları birbirine yapıştırabiliyor.
 */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}
