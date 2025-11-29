import {
  fetchComments,
  createComment,
  convertUTCToLocal,
  formatDateTime,
} from '../../components/comments';


global.fetch = jest.fn();

describe('Comments Utils', () => {
  

  const originalError = console.error;
  const originalLog = console.log;

  beforeAll(() => {
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
    console.log = originalLog;
  });
  
  beforeEach(() => {
   
    fetch.mockClear();
  });

 

  describe('fetchComments', () => {
    test('debe obtener comentarios exitosamente', async () => {
      const mockComments = {
        success: true,
        comments: [
          {
            id: 1,
            titleComment: 'Comentario 1',
            descriptionComment: 'Descripción 1',
            dateComment: '2025-11-28T10:00:00Z',
            accountId: 1,
          },
          {
            id: 2,
            titleComment: 'Comentario 2',
            descriptionComment: 'Descripción 2',
            dateComment: '2025-11-27T10:00:00Z',
            accountId: 2,
          },
        ],
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockComments,
      });

      const result = await fetchComments();

      expect(result.success).toBe(true);
      expect(result.comments).toHaveLength(2);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        'https://agendauabcs.up.railway.app/comments',
        expect.objectContaining({
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        })
      );
    });

    test('debe ordenar comentarios de más recientes a más antiguos', async () => {
      const mockComments = {
        success: true,
        comments: [
          {
            id: 1,
            dateComment: '2025-11-25T10:00:00Z',
          },
          {
            id: 2,
            dateComment: '2025-11-28T10:00:00Z',
          },
          {
            id: 3,
            dateComment: '2025-11-27T10:00:00Z',
          },
        ],
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockComments,
      });

      const result = await fetchComments();

    
      expect(result.comments[0].id).toBe(2);
      expect(result.comments[1].id).toBe(3);
      expect(result.comments[2].id).toBe(1);
    });

    test('debe manejar error cuando la API falla', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => ({
          success: false,
          message: 'Error del servidor',
        }),
      });

      await expect(fetchComments()).rejects.toThrow('Error del servidor');
    });

    test('debe manejar error de red', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchComments()).rejects.toThrow('Network error');
    });
  });


  describe('createComment', () => {
    test('debe crear un comentario exitosamente', async () => {
      const commentData = {
        titleComment: 'Mi comentario',
        descriptionComment: 'Esta es una descripción',
        accountId: 123,
      };

      const mockResponse = {
        success: true,
        comment: { id: 1, ...commentData },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createComment(commentData);

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        'https://agendauabcs.up.railway.app/createComment',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(commentData),
        })
      );
    });

    test('debe usar título por defecto cuando no se proporciona', async () => {
      const commentData = {
        descriptionComment: 'Solo descripción',
        accountId: 123,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await createComment(commentData);

      const callBody = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callBody.titleComment).toBe('Comentario de usuario');
    });

    test('debe manejar error al crear comentario', async () => {
      const commentData = {
        titleComment: 'Test',
        descriptionComment: 'Test',
        accountId: 123,
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: 'Error al guardar',
        }),
      });

      await expect(createComment(commentData)).rejects.toThrow(
        'Error al guardar'
      );
    });

    test('debe manejar error de red al crear comentario', async () => {
      const commentData = {
        titleComment: 'Test',
        descriptionComment: 'Test',
        accountId: 123,
      };

      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(createComment(commentData)).rejects.toThrow('Network error');
    });
  });

  describe('convertUTCToLocal', () => {
    test('debe convertir fecha UTC correctamente', () => {
      const utcDate = '2025-11-28T10:00:00Z';
      const result = convertUTCToLocal(utcDate);

      expect(result).toBeInstanceOf(Date);
   
      const originalDate = new Date(utcDate);
      const expectedTime = originalDate.getTime() - 7 * 60 * 60 * 1000;
      expect(result.getTime()).toBe(expectedTime);
    });

    test('debe retornar null si no hay fecha', () => {
      const result = convertUTCToLocal(null);
      expect(result).toBeNull();
    });

    test('debe manejar fechas inválidas', () => {
      const result = convertUTCToLocal('fecha-invalida');
      expect(result).toBeInstanceOf(Date);
    });

    test('debe manejar undefined', () => {
      const result = convertUTCToLocal(undefined);
      expect(result).toBeNull();
    });
  });



  describe('formatDateTime', () => {
   
    const RealDate = Date;
    const mockNow = new Date('2025-11-28T12:00:00Z');

    beforeEach(() => {
      global.Date = class extends RealDate {
        constructor(...args) {
          if (args.length === 0) {
            return mockNow;
          }
          return new RealDate(...args);
        }
        static now() {
          return mockNow.getTime();
        }
      };
    });

    afterEach(() => {
      global.Date = RealDate;
    });

    test('debe retornar "Hace unos segundos" para fechas muy recientes', () => {
    
      const recentDate = new Date(mockNow.getTime() - 30 * 1000 + 7 * 60 * 60 * 1000);
      const result = formatDateTime(recentDate.toISOString());
      
      expect(result).toBe('Hace unos segundos');
    });

    test('debe retornar "Hace X minutos"', () => {
     
      const date = new Date(mockNow.getTime() - 5 * 60 * 1000 + 7 * 60 * 60 * 1000);
      const result = formatDateTime(date.toISOString());
      
      expect(result).toBe('Hace 5 minutos');
    });

    test('debe retornar "Hace 1 minuto" en singular', () => {
      const date = new Date(mockNow.getTime() - 60 * 1000 + 7 * 60 * 60 * 1000);
      const result = formatDateTime(date.toISOString());
      
      expect(result).toBe('Hace 1 minuto');
    });

    test('debe retornar "Hace X horas"', () => {
      const date = new Date(mockNow.getTime() - 3 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000);
      const result = formatDateTime(date.toISOString());
      
      expect(result).toBe('Hace 3 horas');
    });

    test('debe retornar "Hace 1 hora" en singular', () => {
      const date = new Date(mockNow.getTime() - 60 * 60 * 1000 + 7 * 60 * 60 * 1000);
      const result = formatDateTime(date.toISOString());
      
      expect(result).toBe('Hace 1 hora');
    });

    test('debe retornar "Ayer" para fecha del día anterior', () => {
      const yesterday = new Date(mockNow.getTime() - 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000);
      const result = formatDateTime(yesterday.toISOString());
      
      expect(result).toBe('Ayer');
    });

    test('debe retornar "Hace X días" para fechas recientes', () => {
      const date = new Date(mockNow.getTime() - 3 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000);
      const result = formatDateTime(date.toISOString());
      
      expect(result).toBe('Hace 3 días');
    });

    test('debe retornar fecha completa para fechas antiguas (más de 7 días)', () => {
      const oldDate = new Date(mockNow.getTime() - 10 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000);
      const result = formatDateTime(oldDate.toISOString());
  
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    test('debe retornar cadena vacía si no hay fecha', () => {
      const result = formatDateTime(null);
      expect(result).toBe('');
    });

    test('debe manejar fechas inválidas', () => {
      const result = formatDateTime('invalid-date');
     
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    test('debe manejar undefined', () => {
      const result = formatDateTime(undefined);
      expect(result).toBe('');
    });
  });



  describe('Integración de funciones', () => {
    test('fetchComments debe retornar comentarios con fechas formateables', async () => {
      const mockComments = {
        success: true,
        comments: [
          {
            id: 1,
            titleComment: 'Test',
            dateComment: '2025-11-28T10:00:00Z',
          },
        ],
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockComments,
      });

      const result = await fetchComments();
      const formattedDate = formatDateTime(result.comments[0].dateComment);

      expect(formattedDate).toBeTruthy();
      expect(typeof formattedDate).toBe('string');
    });
  });
});