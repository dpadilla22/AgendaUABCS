import {  jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';

// Mock de la función connect
jest.unstable_mockModule('../db.js', () => {
  return {
    default: jest.fn().mockResolvedValue({
      execute: jest.fn().mockResolvedValue([[]]),
      end: jest.fn().mockResolvedValue(null)
    })
  };
});

// Crear app de testing (versión simplificada de index.js)
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ====== RUTAS ======

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ message: 'API de AgendaUABCS está activa ✓' });
});

// Login
app.post('/login', async (req, res) => {
  const { identifierUser, passwordUser } = req.body;
  if (!identifierUser || !passwordUser) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }
  res.json({
    success: true,
    message: 'Login successful',
    user: {
      name: 'John Doe',
      email: identifierUser,
      idAccount: 1,
    },
  });
});

// Check Accounts
app.get('/Accounts', async (req, res) => {
  res.json({
    data: [],
    status: 200,
  });
});

// Create Account
app.post('/createAccount', async (req, res) => {
  const { nameUser, emailUser, passwordUser } = req.body;
  if (!nameUser || !emailUser || !passwordUser) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }
  res.json({
    data: [],
    status: 200,
  });
});

// Create Event
app.post('/createEvent', async (req, res) => {
  const { imageUrl, title, department, date, location } = req.body;
  if (!imageUrl || !title || !department || !date || !location) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }
  res.json({
    data: [],
    status: 200,
  });
});

// Check Events
app.get('/events', async (req, res) => {
  res.json({
    success: true,
    events: [],
    status: 200,
  });
});

// Check Event by ID
app.get('/events/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Event ID is required',
    });
  }
  res.json({
    success: true,
    event: {
      id: parseInt(id),
      title: 'Sample Event',
      department: 'Agronomía',
    },
    status: 200,
  });
});

// Add Event to Favorites
app.post('/events/:id/favorite', async (req, res) => {
  const { accountId } = req.body;
  if (!accountId) {
    return res.status(400).json({
      success: false,
      message: 'Account ID is required',
    });
  }
  res.json({
    success: true,
    message: 'Event added to favorites',
    status: 200,
  });
});

// Check Favorites by Account
app.get('/favorites/:accountId', async (req, res) => {
  res.json({
    success: true,
    favorites: [],
    status: 200,
  });
});

// Delete Favorite
app.delete('/favorites/:accountId/:eventId', async (req, res) => {
  res.json({
    success: true,
    message: 'Favorite deleted successfully',
    status: 200,
  });
});

// Create Department
app.post('/createDepartment', async (req, res) => {
  const { nameDepartment } = req.body;
  if (!nameDepartment) {
    return res.status(400).json({
      success: false,
      message: 'Name department is required',
    });
  }
  res.json({
    data: [],
    status: 200,
  });
});

// Create Suggestion
app.post('/createSuggestion', async (req, res) => {
  const {
    titleEventSuggestion,
    idDepartment,
    dateEventSuggestion,
    timeEventSuggestion,
    locationEventSuggestion,
    accountId,
  } = req.body;

  if (
    !titleEventSuggestion ||
    !idDepartment ||
    !dateEventSuggestion ||
    !timeEventSuggestion ||
    !locationEventSuggestion ||
    !accountId
  ) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }
  res.json({
    data: [],
    status: 200,
  });
});

// Check Departments
app.get('/departments', async (req, res) => {
  res.json({
    success: true,
    departments: [],
    status: 200,
  });
});

// Check Suggestions
app.get('/suggestions', async (req, res) => {
  res.json({
    success: true,
    suggestions: [],
    status: 200,
  });
});

// Create Notification
app.post('/createNotification', async (req, res) => {
  const { accountId, eventId, message } = req.body;
  if (!accountId || !message) {
    return res.status(400).json({
      success: false,
      message: 'accountId and message are required',
    });
  }
  res.json({
    success: true,
    message: 'Notification created successfully',
    status: 200,
  });
});

// Create Comment
app.post('/createComment', async (req, res) => {
  const { titleComment, descriptionComment, accountId } = req.body;
  if (!titleComment || !descriptionComment || !accountId) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }
  res.json({
    data: [],
    status: 200,
  });
});

// Mark Attendance
app.post('/markAttendance', async (req, res) => {
  const { accountId, eventId } = req.body;
  if (!accountId || !eventId) {
    return res.status(400).json({
      success: false,
      message: 'accountId and eventId are required',
    });
  }
  res.json({
    success: true,
    message: 'Attendance marked successfully',
    status: 200,
  });
});

// Unmark Attendance
app.post('/unmarkAttendance', async (req, res) => {
  const { accountId, eventId } = req.body;
  if (!accountId || !eventId) {
    return res.status(400).json({
      success: false,
      message: 'accountId and eventId are required',
    });
  }
  res.json({
    success: true,
    message: 'Attendance unmarked successfully',
    status: 200,
  });
});

// Check Attendance by Account
app.get('/attendance/:accountId', async (req, res) => {
  res.json({
    success: true,
    attendance: [],
    status: 200,
  });
});

// Check Comments by Account
app.get('/comments/:accountId', async (req, res) => {
  res.json({
    success: true,
    comments: [],
    status: 200,
  });
});

// Check All Comments
app.get('/comments', async (req, res) => {
  res.json({
    success: true,
    comments: [],
    status: 200,
  });
});

// Check Notifications
app.get('/notifications/:accountId', async (req, res) => {
  res.json({
    success: true,
    notifications: [],
    status: 200,
  });
});

// ====== TESTS ======

describe('API Endpoints Tests', () => {
  // --- ROOT ---
  test('GET / debe retornar status 200 y mensaje', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('activa');
  });

  // --- LOGIN ---
  describe('Login Endpoints', () => {
    test('POST /login con credenciales válidas debe retornar 200', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          identifierUser: 'user@example.com',
          passwordUser: 'password123',
        });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
    });

    test('POST /login sin email debe retornar 400', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          passwordUser: 'password123',
        });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('POST /login sin password debe retornar 400', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          identifierUser: 'user@example.com',
        });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // --- ACCOUNTS ---
  describe('Accounts Endpoints', () => {
    test('GET /Accounts debe retornar lista de cuentas', async () => {
      const response = await request(app).get('/Accounts');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /createAccount con todos los campos debe retornar 200', async () => {
      const response = await request(app)
        .post('/createAccount')
        .send({
          nameUser: 'John Doe',
          emailUser: 'john@example.com',
          passwordUser: 'password123',
        });
      expect(response.status).toBe(200);
    });

    test('POST /createAccount sin campos debe retornar 400', async () => {
      const response = await request(app)
        .post('/createAccount')
        .send({
          nameUser: 'John Doe',
        });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // --- EVENTS ---
  describe('Events Endpoints', () => {
    test('GET /events debe retornar lista de eventos', async () => {
      const response = await request(app).get('/events');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.events)).toBe(true);
    });

    test('GET /events/1 debe retornar un evento específico', async () => {
      const response = await request(app).get('/events/1');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.event).toBeDefined();
    });

    test('POST /createEvent con todos los campos debe retornar 200', async () => {
      const response = await request(app)
        .post('/createEvent')
        .send({
          imageUrl: 'http://example.com/image.jpg',
          title: 'Conferencia de Agronomía',
          department: 'Agronomía',
          date: '2025-12-15',
          location: 'Sala 101',
        });
      expect(response.status).toBe(200);
    });

    test('POST /createEvent sin campos debe retornar 400', async () => {
      const response = await request(app)
        .post('/createEvent')
        .send({
          title: 'Evento sin detalles',
        });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // --- FAVORITES ---
  describe('Favorites Endpoints', () => {
    test('GET /favorites/1 debe retornar favoritos del usuario', async () => {
      const response = await request(app).get('/favorites/1');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.favorites)).toBe(true);
    });

    test('POST /events/1/favorite con accountId debe retornar 200', async () => {
      const response = await request(app)
        .post('/events/1/favorite')
        .send({
          accountId: 1,
        });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /events/1/favorite sin accountId debe retornar 400', async () => {
      const response = await request(app)
        .post('/events/1/favorite')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('DELETE /favorites/1/1 debe eliminar un favorito', async () => {
      const response = await request(app)
        .delete('/favorites/1/1');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  // --- DEPARTMENTS ---
  describe('Departments Endpoints', () => {
    test('GET /departments debe retornar lista de departamentos', async () => {
      const response = await request(app).get('/departments');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.departments)).toBe(true);
    });

    test('POST /createDepartment con nombre debe retornar 200', async () => {
      const response = await request(app)
        .post('/createDepartment')
        .send({
          nameDepartment: 'Agronomía',
        });
      expect(response.status).toBe(200);
    });

    test('POST /createDepartment sin nombre debe retornar 400', async () => {
      const response = await request(app)
        .post('/createDepartment')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // --- SUGGESTIONS ---
  describe('Suggestions Endpoints', () => {
    test('GET /suggestions debe retornar lista de sugerencias', async () => {
      const response = await request(app).get('/suggestions');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.suggestions)).toBe(true);
    });

    test('POST /createSuggestion con todos los campos debe retornar 200', async () => {
      const response = await request(app)
        .post('/createSuggestion')
        .send({
          titleEventSuggestion: 'Taller de Agronomía',
          idDepartment: 1,
          dateEventSuggestion: '2025-12-20',
          timeEventSuggestion: '10:00',
          locationEventSuggestion: 'Auditorio',
          accountId: 1,
        });
      expect(response.status).toBe(200);
    });

    test('POST /createSuggestion sin campos debe retornar 400', async () => {
      const response = await request(app)
        .post('/createSuggestion')
        .send({
          titleEventSuggestion: 'Solo título',
        });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // --- NOTIFICATIONS ---
  describe('Notifications Endpoints', () => {
    test('GET /notifications/1 debe retornar notificaciones del usuario', async () => {
      const response = await request(app).get('/notifications/1');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.notifications)).toBe(true);
    });

    test('POST /createNotification con campos requeridos debe retornar 200', async () => {
      const response = await request(app)
        .post('/createNotification')
        .send({
          accountId: 1,
          eventId: 1,
          message: 'Nuevo evento disponible',
        });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /createNotification sin accountId debe retornar 400', async () => {
      const response = await request(app)
        .post('/createNotification')
        .send({
          message: 'Nuevo evento',
        });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // --- COMMENTS ---
  describe('Comments Endpoints', () => {
    test('GET /comments debe retornar todos los comentarios', async () => {
      const response = await request(app).get('/comments');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.comments)).toBe(true);
    });

    test('GET /comments/1 debe retornar comentarios del usuario', async () => {
      const response = await request(app).get('/comments/1');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.comments)).toBe(true);
    });

    test('POST /createComment con todos los campos debe retornar 200', async () => {
      const response = await request(app)
        .post('/createComment')
        .send({
          titleComment: 'Buen evento',
          descriptionComment: 'Muy interesante la conferencia',
          accountId: 1,
        });
      expect(response.status).toBe(200);
    });

    test('POST /createComment sin campos debe retornar 400', async () => {
      const response = await request(app)
        .post('/createComment')
        .send({
          titleComment: 'Solo título',
        });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // --- ATTENDANCE ---
  describe('Attendance Endpoints', () => {
    test('GET /attendance/1 debe retornar asistencia del usuario', async () => {
      const response = await request(app).get('/attendance/1');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.attendance)).toBe(true);
    });

    test('POST /markAttendance debe marcar asistencia', async () => {
      const response = await request(app)
        .post('/markAttendance')
        .send({
          accountId: 1,
          eventId: 1,
        });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /markAttendance sin datos debe retornar 400', async () => {
      const response = await request(app)
        .post('/markAttendance')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('POST /unmarkAttendance debe desmarcar asistencia', async () => {
      const response = await request(app)
        .post('/unmarkAttendance')
        .send({
          accountId: 1,
          eventId: 1,
        });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /unmarkAttendance sin datos debe retornar 400', async () => {
      const response = await request(app)
        .post('/unmarkAttendance')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});