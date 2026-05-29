import Link from 'next/link';
import connectMongo from '@/lib/mongodb';
import Cuestionario from '@/lib/models/Cuestionario';

export default async function CuestionarioPage({ params }) {
  await connectMongo();
  const { id } = await params;
  const cuestionario = await Cuestionario.findById(id);

  if (!cuestionario) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-flip-light p-4">
        <h1 className="text-xl md:text-2xl font-bold text-flip-slate text-center">Cuestionario no encontrado</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-flip-light">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Link href="/" className="inline-flex items-center text-flip-teal hover:underline font-medium mb-3 py-2">
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
                <span className="text-base">📖</span> Ver Material de Referencia
              </a>
            </div>
          )}
          
          <div className="border-b border-flip-slate/20 mt-5"></div>
        </div>

        <div className="space-y-4 md:space-y-6">
          {cuestionario.preguntas.map((item, index) => (
            <div key={item._id.toString()} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-flip-slate/10">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex items-center sm:items-start gap-2 sm:gap-0 mb-1 sm:mb-0">
                  <span className="text-flip-teal/20 font-black text-2xl sm:text-4xl leading-none">
                    Q{index + 1}
                  </span>
                </div>
                
                <div className="flex-1 w-full">
                  <h2 className="text-lg md:text-xl font-bold text-flip-dark mb-3 md:mb-4">
                    {item.pregunta}
                  </h2>
                  
                  <details className="group bg-flip-light rounded-xl p-1 cursor-pointer border border-flip-slate/5 transition-colors">
                    <summary className="font-semibold text-flip-teal list-none text-center py-3 select-none active:bg-flip-teal/5 rounded-lg">
                      Ver Respuesta Correcta
                    </summary>
                    <div className="p-4 bg-flip-dark text-white rounded-b-xl text-base md:text-lg leading-relaxed">
                      {item.respuesta}
                    </div>
                  </details>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}