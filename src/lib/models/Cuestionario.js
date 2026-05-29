import mongoose from 'mongoose';

const CuestionarioSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  referencia: { type: String }, // LINEA NUEVA: Guarda el link de Drive o AccessMedicine
  preguntas: [{
    pregunta: { type: String, required: true },
    respuesta: { type: String, required: true }
  }],
  fechaCreacion: { type: Date, default: Date.now }
});

export default mongoose.models.Cuestionario || mongoose.model('Cuestionario', CuestionarioSchema);