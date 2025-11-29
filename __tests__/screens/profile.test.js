import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getHour, 
  formatDate, 
  getDepartmentColor, 
  processEventsData,
  getUserEmail,
  getAccountId 
} from '../../utils/profileUtils';


jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

describe('Profile Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHour', () => {
    it('formatea hora correctamente', () => {
      expect(getHour('2025-06-15T14:30:00')).toBe('14:30');
      expect(getHour('2025-06-15T09:05:00')).toBe('09:05');
    });
  });

  describe('formatDate', () => {
    it('formatea fecha correctamente', () => {
      const result = formatDate('2025-06-15T10:00:00');
      expect(result).toContain('junio');
      expect(result).toContain('2025');
    });
  });

  describe('getDepartmentColor', () => {
    it('asigna colores correctos a departamentos conocidos', () => {
      expect(getDepartmentColor('Sistemas computacionales')).toBe('#3B82F6');
      expect(getDepartmentColor('Economía')).toBe('#F59E0B');
      expect(getDepartmentColor('Ciencias Sociales y jurídicas')).toBe('#06B6D4');
    });

    it('usa color por defecto para departamento desconocido', () => {
      expect(getDepartmentColor('Departamento Desconocido')).toBe('#6B7280');
      expect(getDepartmentColor('Departamento Desconocido', true)).toBe('#999');
    });
  });

  describe('processEventsData', () => {
    const mockEventsData = {
      success: true,
      events: [
        {
          id: 1,
          title: 'Conferencia de Tecnología',
          department: 'Sistemas computacionales',
          date: '2025-06-15T10:00:00',
          location: 'Auditorio Principal',
          imageUrl: 'https://example.com/image1.jpg'
        },
        {
          id: 2,
          title: 'Taller de Economía',
          department: 'Economía',
          date: '2025-06-20T14:00:00',
          location: 'Sala de Conferencias',
          imageUrl: 'https://example.com/image2.jpg'
        }
      ]
    };

    it('procesa favoritos correctamente', () => {
      const favData = {
        success: true,
        favorites: [{ eventId: 1 }]
      };
      const attendanceData = {
        success: true,
        attendance: []
      };

      const result = processEventsData(mockEventsData, favData, attendanceData);
      
      expect(result.favorites).toHaveLength(1);
      expect(result.favorites[0].title).toBe('Conferencia de Tecnología');
      expect(result.favorites[0].department).toBe('Sistemas computacionales');
      expect(result.favorites[0].date).toContain('junio');
      expect(result.favorites[0].time).toBe('10:00');
      expect(result.attendance).toHaveLength(0);
    });

    it('procesa asistencia correctamente', () => {
      const favData = {
        success: true,
        favorites: []
      };
      const attendanceData = {
        success: true,
        attendance: [{ eventId: 2 }]
      };

      const result = processEventsData(mockEventsData, favData, attendanceData);
      
      expect(result.attendance).toHaveLength(1);
      expect(result.attendance[0].title).toBe('Taller de Economía');
      expect(result.attendance[0].department).toBe('Economía');
      expect(result.attendance[0].date).toContain('junio');
      expect(result.attendance[0].time).toBe('14:00');
      expect(result.favorites).toHaveLength(0);
    });

    it('maneja eventos sin datos completos', () => {
      const incompleteEvent = {
        success: true,
        events: [
          {
            id: 3,
            date: 'fecha-invalida',
           
          }
        ]
      };

      const favData = {
        success: true,
        favorites: [{ eventId: 3 }]
      };

      const result = processEventsData(incompleteEvent, favData, { success: true, attendance: [] });
      
      expect(result.favorites[0].title).toBe('Evento sin título');
      expect(result.favorites[0].department).toBe('Sin departamento');
      expect(result.favorites[0].location).toBe('Ubicación no especificada');
      expect(result.favorites[0].imageUrl).toBe('https://via.placeholder.com/150');
    });
  });

  describe('getUserEmail', () => {
    it('obtiene email desde AsyncStorage', async () => {
     
      AsyncStorage.getItem.mockResolvedValue('estudiante@uabcs.mx');
      
      const email = await getUserEmail();
      expect(email).toBe('estudiante@uabcs.mx');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('userName');
    });

    it('retorna string vacío cuando no hay email', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      
      const email = await getUserEmail();
      expect(email).toBe('');
    });
  });

  describe('getAccountId', () => {
    it('obtiene accountId desde AsyncStorage', async () => {
      AsyncStorage.getItem.mockResolvedValue('12345');
      
      const accountId = await getAccountId();
      expect(accountId).toBe('12345');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('accountId');
    });

    it('retorna null cuando no hay accountId', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      
      const accountId = await getAccountId();
      expect(accountId).toBeNull();
    });
  });
});