// Função para formatar a data
export function formatDate(date: string): string {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('pt-BR', options);
}