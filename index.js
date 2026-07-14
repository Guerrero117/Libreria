require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URI; 

mongoose.connect(mongoURI)
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

// Schema de usuarios con correo
const Usuario = mongoose.model('Usuario', new mongoose.Schema({
    usuario: String,
    contrasena: String,
    correo: String 
}), 'usuarios');

// Schema de clientes
const Cliente = mongoose.model('Cliente', new mongoose.Schema({
    clave: { type: String, required: true, unique: true },
    nombre: String,
    edad: Number,
    fecha_nacimiento: Date
}), 'clientes');

// Schema de Favoritos
const Favorito = mongoose.model('Favorito', new mongoose.Schema({
    usuario: { type: String, required: true },
    libroId: { type: String, required: true },
    titulo: String
}), 'favoritos');

// --- RUTAS DE USUARIOS ---

app.post('/api/login', async (req, res) => {
    const { usuario, contrasena } = req.body;
    try {
        const encontrado = await Usuario.findOne({ usuario, contrasena });
        res.json({ existe: !!encontrado }); 
    } catch (e) {
        res.status(500).json({ existe: false, error: e.message });
    }
});

// RUTA REGISTRO (CON CORREO INTEGRADO)
app.post('/api/usuarios/registrar', async (req, res) => {
    // Capturamos el correo enviado desde la app
    const { usuario, contrasena, correo } = req.body;
    
    try {
        const usuarioExistente = await Usuario.findOne({ usuario });
        if (usuarioExistente) {
            return res.status(400).json({ exito: false, mensaje: 'El nombre de usuario ya está ocupado' });
        }
        
        // Guardamos el nuevo usuario con los 3 campos
        const nuevoUsuario = new Usuario({ usuario, contrasena, correo });
        await nuevoUsuario.save();
        
        res.status(201).json({ exito: true, mensaje: 'Usuario registrado exitosamente' });
    } catch (e) {
        res.status(500).json({ exito: false, error: e.message });
    }
});

// --- RUTAS DE CLIENTES ---

app.get('/api/clientes', async (req, res) => {
    try {
        const clientes = await Cliente.find();
        res.json(clientes);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- RUTAS DE FAVORITOS ---

app.post('/api/favoritos/agregar', async (req, res) => {
    const { usuario, libroId, titulo } = req.body;
    try {
        const existe = await Favorito.findOne({ usuario, libroId });
        if (existe) {
            return res.json({ exito: true, mensaje: 'El libro ya estaba en favoritos' });
        }
        const nuevoFavorito = new Favorito({ usuario, libroId, titulo });
        await nuevoFavorito.save();
        res.json({ exito: true, mensaje: 'Guardado en favoritos' });
    } catch (e) {
        res.status(500).json({ exito: false, error: e.message });
    }
});

app.get('/api/favoritos/:usuario', async (req, res) => {
    try {
        const misFavoritos = await Favorito.find({ usuario: req.params.usuario });
        res.json(misFavoritos);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));