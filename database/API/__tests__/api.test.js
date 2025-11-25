import request from 'supertest';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// Crear una app simple para testing
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ message: 'API de AgendaUABCS está activa ✓' });
});

// Ruta de eventos (mock)
app.get('/events', (req, res) => {
  res.json({
    success: true,
    events: [],
    status: 200,
  });
});

// Tests
describe('API Basic Tests', () => {
  test('GET / debe retornar status 200', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('activa');
  });

  test('GET /events debe retornar lista vacía', async () => {
    const response = await request(app).get('/events');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.events)).toBe(true);
  });

//   test('Simple math test: 2 + 2 = 4', () => {
//     expect(2 + 2).toBe(4);
//   });
});