// attendance.test.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { markAttendance, unmarkAttendance } from './attendance';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

describe('Attendance functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterAll(() => {
    delete global.fetch;
  });

  describe('markAttendance', () => {
    it('marca asistencia correctamente cuando hay accountId y fetch responde ok', async () => {
      AsyncStorage.getItem.mockResolvedValue('123'); // accountId almacenado como string
      const mockResponse = { message: 'Asistencia registrada' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await markAttendance(45);

      expect(result.success).toBe(true);
      expect(result.message).toBe(mockResponse.message);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Verificar URL y payload enviado
      const expectedUrl = 'https://agendauabcs.up.railway.app/markAttendance';
      const fetchCallArgs = global.fetch.mock.calls[0];
      expect(fetchCallArgs[0]).toBe(expectedUrl);

      const fetchOptions = fetchCallArgs[1];
      expect(fetchOptions.method).toBe('POST');
      expect(fetchOptions.headers['Content-Type']).toBe('application/json');

      const sentBody = JSON.parse(fetchOptions.body);
      expect(sentBody).toEqual({ accountId: '123', eventId: 45 });
    });

    it('devuelve error si falta accountId', async () => {
      AsyncStorage.getItem.mockResolvedValue(null); // no hay accountId
      const result = await markAttendance(5);

      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Faltan datos necesarios/);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('devuelve error si falta eventId', async () => {
      AsyncStorage.getItem.mockResolvedValue('123');
      const result = await markAttendance(null);

      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Faltan datos necesarios/);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('devuelve error si la respuesta HTTP no es ok', async () => {
      AsyncStorage.getItem.mockResolvedValue('123');
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await markAttendance(12);

      expect(result.success).toBe(false);
      expect(result.message).toBe('HTTP Error: 500');
    });
  });

  describe('unmarkAttendance', () => {
    it('desmarca asistencia correctamente cuando hay accountId y fetch responde ok', async () => {
      AsyncStorage.getItem.mockResolvedValue('999');
      const mockResponse = { message: 'Asistencia eliminada' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await unmarkAttendance('7');

      expect(result.success).toBe(true);
      expect(result.message).toBe(mockResponse.message);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const expectedUrl = 'https://agendauabcs.up.railway.app/unmarkAttendance';
      const fetchCallArgs = global.fetch.mock.calls[0];
      expect(fetchCallArgs[0]).toBe(expectedUrl);

      const fetchOptions = fetchCallArgs[1];
      expect(fetchOptions.method).toBe('POST');

      const sentBody = JSON.parse(fetchOptions.body);
      expect(sentBody).toEqual({ accountId: '999', eventId: 7 });
    });

    it('devuelve error si falta accountId', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      const result = await unmarkAttendance(1);

      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Faltan datos necesarios/);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('devuelve error si falta eventId', async () => {
      AsyncStorage.getItem.mockResolvedValue('999');
      const result = await unmarkAttendance(undefined);

      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Faltan datos necesarios/);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('devuelve error si la respuesta HTTP no es ok', async () => {
      AsyncStorage.getItem.mockResolvedValue('999');
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await unmarkAttendance(3);

      expect(result.success).toBe(false);
      expect(result.message).toBe('HTTP Error: 404');
    });
  });
});
