import {
  getDepartmentColor,
  formatDate,
  prepareNavigationData,
  getEventDisplayData
} from '../../utils/eventCardUtils';

describe('EventCard Utils', () => {
  describe('getDepartmentColor', () => {
    it('retorna color correcto para Sistemas computacionales', () => {
      expect(getDepartmentColor('Sistemas computacionales')).toBe('#3B82F6');
    });

    it('retorna color correcto para Economía', () => {
      expect(getDepartmentColor('Economía')).toBe('#F59E0B');
    });

    it('retorna color por defecto para departamento desconocido en modo claro', () => {
      expect(getDepartmentColor('Departamento Desconocido')).toBe('#22033dff');
    });

    it('retorna color por defecto para departamento desconocido en modo oscuro', () => {
      expect(getDepartmentColor('Departamento Desconocido', true)).toBe('#145172ff');
    });

    it('retorna colores para todos los departamentos conocidos', () => {
      expect(getDepartmentColor('Ciencias Sociales y jurídicas')).toBe('#06B6D4');
      expect(getDepartmentColor('Agronomia')).toBe('#10B981');
      expect(getDepartmentColor('Ciencias de la tierra')).toBe('#8B5CF6');
      expect(getDepartmentColor('Humanidades')).toBe('#F97316');
      expect(getDepartmentColor('Ingeniería en pesquerías')).toBe('#EF4444');
      expect(getDepartmentColor('Ciencias marinas y costeras')).toBe('#478884ff');
      expect(getDepartmentColor('Ciencia animal y conservación del hábitat')).toBe('#FBBF24');
    });
  });

  describe('formatDate', () => {
    it('formatea fecha válida correctamente', () => {
      const formatted = formatDate('2025-06-15');
      expect(formatted).toContain('junio');
      expect(formatted).toContain('2025');
    });

    it('retorna mensaje por defecto para fecha nula', () => {
      expect(formatDate(null)).toBe('Fecha no disponible');
    });

    it('retorna mensaje por defecto para fecha vacía', () => {
      expect(formatDate('')).toBe('Fecha no disponible');
    });

    it('maneja fecha inválida retornando un string', () => {
      const result = formatDate('fecha-invalida');
      expect(typeof result).toBe('string');
      expect(result).toBeTruthy();
    });

    it('formatea diferentes meses correctamente', () => {
      expect(formatDate('2025-01-15')).toContain('enero');
      expect(formatDate('2025-12-25')).toContain('diciembre');
    });

    it('maneja formato de fecha con hora', () => {
      const result = formatDate('2025-06-15T10:00:00');
      expect(result).toContain('junio');
      expect(result).toContain('2025');
    });
  });

  describe('prepareNavigationData', () => {
    it('prepara datos correctos para navegación', () => {
      const eventData = {
        id: '1',
        title: 'Conferencia de Tecnología',
        department: 'Sistemas computacionales',
        date: '2025-06-15',
        time: '10:00 AM',
        location: 'Poliforo',
        imageUrl: 'https://example.com/image.jpg'
      };

      const navigationData = prepareNavigationData(eventData);

      expect(navigationData.eventId).toBe('1');
      expect(navigationData.event.title).toBe('Conferencia de Tecnología');
      expect(navigationData.event.department).toBe('Sistemas computacionales');
      expect(navigationData.event.date).toBe('2025-06-15');
      expect(navigationData.event.time).toBe('10:00 AM');
      expect(navigationData.event.location).toBe('Poliforo');
      expect(navigationData.event.imageUrl).toBe('https://example.com/image.jpg');
    });

    it('maneja datos incompletos en navegación', () => {
      const incompleteEvent = {
        id: '2',
        title: 'Evento Incompleto',
        department: 'Economía'

      };

      const navigationData = prepareNavigationData(incompleteEvent);

      expect(navigationData.eventId).toBe('2');
      expect(navigationData.event.title).toBe('Evento Incompleto');
      expect(navigationData.event.department).toBe('Economía');
      expect(navigationData.event.date).toBeUndefined();
      expect(navigationData.event.time).toBeUndefined();
      expect(navigationData.event.location).toBeUndefined();
      expect(navigationData.event.imageUrl).toBeUndefined();
    });
  });

  describe('getEventDisplayData', () => {
    const completeEvent = {
      id: '1',
      title: 'Conferencia de Tecnología',
      department: 'Sistemas computacionales',
      date: '2025-06-15',
      time: '10:00 AM',
      location: 'Poliforo',
      imageUrl: 'https://example.com/image.jpg',
      showBookmark: true
    };

    it('procesa datos completos correctamente', () => {
      const displayData = getEventDisplayData(completeEvent);

      expect(displayData.title).toBe('Conferencia de Tecnología');
      expect(displayData.department).toBe('Sistemas computacionales');
      expect(displayData.formattedDate).toContain('junio');
      expect(displayData.formattedDate).toContain('2025');
      expect(displayData.displayTime).toBe('10:00 AM');
      expect(displayData.displayLocation).toBe('Poliforo');
      expect(displayData.displayImage).toBe('https://example.com/image.jpg');
      expect(displayData.hasBookmark).toBe(true);
      expect(displayData.departmentColor).toBe('#3B82F6');
    });

    it('usa valores por defecto para datos faltantes', () => {
      const incompleteEvent = {
        title: 'Evento Incompleto',
        department: 'Economía'
        // date, time, location, imageUrl, showBookmark faltan
      };

      const displayData = getEventDisplayData(incompleteEvent);

      expect(displayData.title).toBe('Evento Incompleto');
      expect(displayData.department).toBe('Economía');
      expect(displayData.formattedDate).toBe('Fecha no disponible');
      expect(displayData.displayTime).toBe('Horario no especificado');
      expect(displayData.displayLocation).toBe('Ubicación no especificada');
      expect(displayData.displayImage).toBe('https://via.placeholder.com/100');
      expect(displayData.hasBookmark).toBe(false);
      expect(displayData.departmentColor).toBe('#F59E0B');
    });

    it('aplica colores diferentes en modo oscuro', () => {
      const event = {
        title: 'Evento Test',
        department: 'Departamento Desconocido'
      };

      const lightModeData = getEventDisplayData(event, false);
      const darkModeData = getEventDisplayData(event, true);

      expect(lightModeData.departmentColor).toBe('#22033dff');
      expect(darkModeData.departmentColor).toBe('#145172ff');
    });

    it('maneja imagen por defecto cuando no hay URL', () => {
      const eventWithoutImage = {
        title: 'Evento sin Imagen',
        department: 'Sistemas',
        imageUrl: null
      };

      const displayData = getEventDisplayData(eventWithoutImage);

      expect(displayData.displayImage).toBe('https://via.placeholder.com/100');
    });
  });

  describe('Integración de funciones', () => {
    it('flujo completo de procesamiento de evento', () => {
      const eventData = {
        id: '1',
        title: 'Taller de Programación',
        department: 'Sistemas computacionales',
        date: '2025-06-20',
        time: '14:00',
        location: 'Laboratorio de Computación',
        imageUrl: 'https://example.com/taller.jpg',
        showBookmark: false
      };

      const displayData = getEventDisplayData(eventData);
      expect(displayData.title).toBe('Taller de Programación');
      expect(displayData.formattedDate).toContain('junio');

      const navigationData = prepareNavigationData(eventData);
      expect(navigationData.eventId).toBe('1');
      expect(navigationData.event.title).toBe('Taller de Programación');

      const color = getDepartmentColor('Sistemas computacionales');
      expect(color).toBe('#3B82F6');
    });
  });
});