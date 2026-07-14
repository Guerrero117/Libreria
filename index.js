require('dotenv').config(); // Cargamos las variables de entorno
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB usando variables de entorno
const mongoURI = process.env.MONGO_URI; 

mongoose.connect(mongoURI)
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

// Schema de usuarios
const Usuario = mongoose.model('Usuario', new mongoose.Schema({
    usuario: String,
    contrasena: String
}), 'usuarios');

// Schema de clientes
const Cliente = mongoose.model('Cliente', new mongoose.Schema({
    clave: { type: String, required: true, unique: true },
    nombre: String,
    edad: Number,
    fecha_nacimiento: Date
}), 'clientes');

// --- RUTAS ---

// POST login
app.post('/api/login', async (req, res) => {
    const { usuario, contrasena } = req.body;
    try {
        const encontrado = await Usuario.findOne({ usuario, contrasena });
        res.json({ existe: !!encontrado }); 
    } catch (e) {
        res.status(500).json({ existe: false, error: e.message });
    }
});

// NUEVA RUTA: POST registrar usuario
app.post('/api/usuarios/registrar', async (req, res) => {
    const { usuario, contrasena } = req.body;
    
    try {
        // Verificar si el usuario ya existe para no duplicar
        const usuarioExistente = await Usuario.findOne({ usuario });
        if (usuarioExistente) {
            return res.status(400).json({ 
                exito: false, 
                mensaje: 'El nombre de usuario ya está ocupado' 
            });
        }

        // Crear y guardar nuevo usuario
        const nuevoUsuario = new Usuario({ usuario, contrasena });
        await nuevoUsuario.save();
        
        res.status(201).json({ 
            exito: true, 
            mensaje: 'Usuario registrado exitosamente' 
        });
    } catch (e) {
        res.status(500).json({ 
            exito: false, 
            error: e.message 
        });
    }
});

// GET todos los clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const clientes = await Cliente.find();
        res.json(clientes);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));