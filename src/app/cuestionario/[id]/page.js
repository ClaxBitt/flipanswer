import Link from 'next/link';
import connectMongo from '@/lib/mongodb';
import Cuestionario from '@/lib/models/Cuestionario';
import CuestionarioInteractivo from './CuestionarioInteractivo';

export const dynamic = 'force-dynamic';

export default async function CuestionarioPage({ params }) {
  await connectMongo();
  const { id } = await params;
  const cuestionario = await Cuestionario.findById(id);

  if (!cuestionario) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-flip-light p-4">
        <h1 className="text-xl font-bold text-flip-slate text-center">Cuestionario no encontrado</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-flip-light">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Link href="/" className="inline-flex items-center text-flip-teal hover:underline font-medium mb-3 py-2 text-sm">
            <span className="mr-1">←</span> Volver a Temas
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-flip-dark leading-tight">
            {cuestionario.titulo}
          </h1>

          {cuestionario.referencia && (
            <div className="mt-3">
              <a 
                href={cuestionario.referencia}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-flip-teal border border-flip-teal/20 hover:border-flip-teal rounded-xl font-medium text-sm transition-all shadow-sm"
              >
                <span className="text-base">📖</span> Ver material de referencia
              </a>
            </div>
          )}
          
          <div className="border-b border-flip-slate/20 mt-5"></div>
        </div>

        {/* Inyectamos el componente interactivo pasándole el objeto de la base de datos */}
        <CuestionarioInteractivo cuestionario={JSON.parse(JSON.stringify(cuestionario))} />
        
      </div>
    </main>
  );
}