import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Cuestionario from '@/lib/models/Cuestionario';

// NUEVO: Obtener todos los cuestionarios para listarlos en el Admin
export async function GET() {
  try {
    await connectMongo();
    const cuestionarios = await Cuestionario.find({}).sort({ fechaCreacion: -1 });
    return NextResponse.json({ success: true, data: cuestionarios });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Mantiene tu lógica de guardado seguro actual
export async function POST(request) {
  try {
    const body = await request.json();
    
    if (body.password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    await connectMongo();
    const nuevoCuestionario = await Cuestionario.create(body);
    return NextResponse.json({ success: true, data: nuevoCuestionario }, { status: 201 });
  } catch (error) {
    console.log("❌ DETALLE DEL ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}