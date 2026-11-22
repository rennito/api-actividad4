const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const productoController = require('../controllers/productoController');
const authMiddleware = require('../middlewares/authMiddleware');

const validarProducto = [
  body('nombre').notEmpty().withMessage('El nombre del producto es obligatorio'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0'),
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un entero mayor o igual a 0')
];

// Todas las rutas protegidas con JWT
router.use(authMiddleware);

router.get('/', productoController.obtenerProductos);
router.get('/:id', productoController.obtenerProductoPorId);
router.post('/', validarProducto, productoController.crearProducto);
router.put('/:id', validarProducto, productoController.actualizarProducto);
router.delete('/:id', productoController.eliminarProducto);

module.exports = router;