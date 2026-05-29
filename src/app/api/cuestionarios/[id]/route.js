import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Cuestionario from '@/lib/models/Cuestionario';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    // Leemos la contraseña desde las cabeceras de la petición
    const password = request.headers.get('x-admin-password');

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    await connectMongo();
    // Buscamos el cuestionario por su ID y lo borramos de MongoDB
    await Cuestionario.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}