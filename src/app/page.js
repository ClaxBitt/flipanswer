import Link from 'next/link';
import Image from 'next/image';
import connectMongo from '@/lib/mongodb';
import Cuestionario from '@/lib/models/Cuestionario';

export default async function Home() {
  await connectMongo();
  const cuestionarios = await Cuestionario.find({}).sort({ fechaCreacion: -1 });

  return (
    // Aplicamos tu color de fondo claro (flip-light) a toda la página
    <main className="min-h-screen p-4 md:p-8 bg-flip-light">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 md:mb-12 border-b border-flip-slate/20 pb-6">
          
          {/* Contenedor del Logo y Título */}
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Flipanswer Logo" 
              width={48} 
              height={48} 
              className="drop-shadow-sm"
            />
            <h1 className="text-3xl md:text-4xl font-extrabold text-flip-dark tracking-tight">
              FlipAnswer
            </h1>
          </div>

          <Link href="/admin" className="w-full sm:w-auto text-center px-5 py-3 sm:py-2 bg-white text-flip-teal font-semibold border border-flip-teal/30 rounded-xl hover:border-flip-teal hover:bg-flip-teal/5 transition-all shadow-sm">
            + Subir
          </Link>
        </header>

        <h2 className="text-xl md:text-2xl font-bold text-flip-dark mb-4 md:mb-6 px-1">
          Cuestionarios
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {cuestionarios.length === 0 ? (
            <p className="text-flip-slate px-1">Aún no hay cuestionarios. ¡Sube el primero!</p>
          ) : (
            cuestionarios.map((c) => (
              <Link 
                href={`/cuestionario/${c._id.toString()}`} 
                key={c._id.toString()}
                className="group block p-5 md:p-6 bg-white rounded-2xl shadow-sm border border-flip-slate/20 active:scale-95 transition-transform sm:hover:shadow-md sm:hover:border-flip-teal/50"
              >
                <h3 className="text-lg md:text-xl font-bold text-flip-dark group-hover:text-flip-teal transition-colors mb-1 md:mb-2 line-clamp-2">
                  {c.titulo}
                </h3>
                <p className="text-sm text-flip-slate">
                  {c.preguntas.length} preguntas
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}