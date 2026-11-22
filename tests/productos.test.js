const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../app');
const pool = require('../config/db');

jest.mock('../config/db', () => ({
  query: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

describe('Rutas y Controladores de Autenticación (/api/auth)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/auth/register -> rechaza datos inválidos (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: '', email: 'correo-no-valido', password: '123' });

    expect(res.statusCode).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test('POST /api/auth/register -> registra usuario con contraseña hasheada (201)', async () => {
    pool.query
      .mockResolvedValueOnce([[]]) // Email no existe
      .mockResolvedValueOnce([{ insertId: 5 }]); // Insert exitoso
    bcrypt.hash.mockResolvedValueOnce('$2a$10$hashSimulado');

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'José Alvarado',
        email: 'jose@ejemplo.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(201);
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(res.body.id).toBe(5);
  });

  test('POST /api/auth/login -> retorna token JWT con credenciales válidas (200)', async () => {
    pool.query.mockResolvedValueOnce([[
      { id: 5, nombre: 'José Alvarado', email: 'jose@ejemplo.com', password: '$2a$10$hashSimulado' }
    ]]);
    bcrypt.compare.mockResolvedValueOnce(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jose@ejemplo.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(typeof res.body.token).toBe('string');
  });

  test('POST /api/auth/login -> rechaza credenciales incorrectas (401)', async () => {
    pool.query.mockResolvedValueOnce([[
      { id: 5, nombre: 'José Alvarado', email: 'jose@ejemplo.com', password: '$2a$10$hashSimulado' }
    ]]);
    bcrypt.compare.mockResolvedValueOnce(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jose@ejemplo.com', password: 'malpassword' });

    expect(res.statusCode).toBe(401);
  });
});

describe('Rutas y Controladores de Productos (/api/productos)', () => {
  const tokenValido = jwt.sign(
    { id: 5, email: 'jose@ejemplo.com', nombre: 'José Alvarado' },
    process.env.JWT_SECRET
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/productos -> bloquea sin token (401)', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/productos -> bloquea con token inválido (403)', async () => {
    const res = await request(app)
      .get('/api/productos')
      .set('Authorization', 'Bearer token.invalido.aqui');

    expect(res.statusCode).toBe(403);
  });

  test('GET /api/productos -> lista productos con token válido (200)', async () => {
    const mockRows = [{ id: 1, nombre: 'Teclado Mecánico', descripcion: 'Switch azul', precio: 899, stock: 12 }];
    pool.query.mockResolvedValueOnce([mockRows]);

    const res = await request(app)
      .get('/api/productos')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockRows);
  });

  test('GET /api/productos/:id -> retorna 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .get('/api/productos/999')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(res.statusCode).toBe(404);
  });

  test('POST /api/productos -> rechaza datos inválidos (400)', async () => {
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ nombre: '', precio: -5, stock: 'no-numero' });

    expect(res.statusCode).toBe(400);
  });

  test('POST /api/productos -> crea producto válido (201)', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 25 }]);

    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ nombre: 'Monitor 24"', descripcion: 'IPS 100Hz', precio: 2800, stock: 7 });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBe(25);
  });

  test('PUT /api/productos/:id -> actualiza producto existente (200)', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/api/productos/1')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ nombre: 'Teclado Actualizado', descripcion: 'RGB', precio: 950, stock: 8 });

    expect(res.statusCode).toBe(200);
  });

  test('DELETE /api/productos/:id -> elimina producto existente (200)', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .delete('/api/productos/1')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(res.statusCode).toBe(200);
  });

  test('GET /api/productos -> maneja error de base de datos con 500', async () => {
    pool.query.mockRejectedValueOnce(new Error('Fallo en consulta MySQL'));

    const res = await request(app)
      .get('/api/productos')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(res.statusCode).toBe(500);
  });
});