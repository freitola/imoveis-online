// app/layout.tsx
import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Inter } from 'next/font/google';

// Adicionando a fonte personalizada "Inter" do Google Fonts
const inter = Inter({ subsets: ['latin'], weight: ['400', '700'] });

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      {/* Aplicando a fonte personalizada ao HTML */}
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        {/* Cabeçalho */}
        <Header />
        
        {/* Conteúdo da página */}
        <main className="container">
          {children}
        </main>

        {/* Rodapé */}
        <Footer />
      </body>
    </html>
  );
}