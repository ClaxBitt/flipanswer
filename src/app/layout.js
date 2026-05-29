import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Flipanswer | Plataforma de Estudio',
  description: 'Herramienta profesional de flashcards y cuestionarios',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/* 1. grid: activamos la rejilla
        2. min-h-screen: altura mínima de toda la pantalla
        3. grid-rows-[1fr_auto]: el primer bloque (contenido) toma todo el espacio posible (1fr), 
           el segundo (footer) toma solo lo que necesita (auto)
      */}
      <body className={`${inter.className} antialiased bg-flip-light text-flip-dark grid min-h-screen grid-rows-[1fr_auto]`}>
        
        <main>
          {children}
        </main>

        <footer className="py-6 text-center text-sm font-medium text-flip-slate border-t border-flip-slate/10 bg-flip-light">
          <p>© {new Date().getFullYear()} Bryan Isaac Rivas García. Todos los derechos reservados.</p>
        </footer>
        
      </body>
    </html>
  );
}