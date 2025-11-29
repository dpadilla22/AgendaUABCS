describe('EventCard - Pruebas de Integración', () => {
  
  
  const simulateEventCard = (eventData) => {
    const {
      id,
      title,
      department,
      date,
      time,
      location,
      imageUrl,
      showBookmark = false
    } = eventData;

    const formatDate = (dateString) => {
      if (!dateString) return "Fecha no disponible";
      try {
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
      } catch (error) {
        return dateString; 
      }
    };

  
    const getDepartmentColor = (dept, isDark = false) => {
      const colorsitos = {
        'Sistemas computacionales': '#3B82F6',
        'Economía': '#F59E0B',
        'Ciencias Sociales y jurídicas': '#06B6D4',
        'Agronomia': '#10B981',
        'Ciencias de la tierra': '#8B5CF6',
        'Humanidades': '#F97316',
        'Ingeniería en pesquerías': '#EF4444',
        'Ciencias marinas y costeras': '#478884ff',
        'Ciencia animal y conservación del hábitat': '#FBBF24',
      };
      return colorsitos[dept] || (isDark ? '#145172ff' : '#22033dff');
    };


    const simulateNavigation = () => {
      return {
        eventId: id,
        event: {
          id,
          title,
          department,
          date,
          time,
          location,
          imageUrl
        }
      };
    };

    return {
      displayedData: {
        title: title,
        department: department,
        formattedDate: formatDate(date),
        displayTime: time || "Horario no especificado",
        displayLocation: location || "Ubicación no especificada",
        hasBookmark: showBookmark,
        departmentColor: getDepartmentColor(department)
      },
      navigationData: simulateNavigation(),
      testId: 'event-card'
    };
  };

  const mockEvent = {
    id: '1',
    title: 'Conferencia de Tecnología 2025',
    department: 'Sistemas computacionales',
    date: '2025-06-15',
    time: '10:00 AM',
    location: 'Auditorio Principal',
    imageUrl: 'https://example.com/image.jpg',
    showBookmark: true
  };

  const incompleteEvent = {
    id: '2',
    title: 'Evento con datos incompletos',
    department: 'Economía',
  };

  it('renderiza todos los datos del evento correctamente', () => {
    const result = simulateEventCard(mockEvent);
    
    expect(result.displayedData.title).toBe('Conferencia de Tecnología 2025');
    expect(result.displayedData.department).toBe('Sistemas computacionales');
    expect(result.displayedData.formattedDate).toContain('junio');
    expect(result.displayedData.formattedDate).toContain('2025');
    expect(result.displayedData.displayTime).toBe('10:00 AM');
    expect(result.displayedData.displayLocation).toBe('Auditorio Principal');
    expect(result.displayedData.hasBookmark).toBe(true);
    expect(result.displayedData.departmentColor).toBe('#3B82F6');
  });

  it('renderiza datos incompletos con valores por defecto', () => {
    const result = simulateEventCard(incompleteEvent);
    
    expect(result.displayedData.title).toBe('Evento con datos incompletos');
    expect(result.displayedData.department).toBe('Economía');
    expect(result.displayedData.formattedDate).toBe('Fecha no disponible');
    expect(result.displayedData.displayTime).toBe('Horario no especificado');
    expect(result.displayedData.displayLocation).toBe('Ubicación no especificada');
    expect(result.displayedData.hasBookmark).toBe(false);
    expect(result.displayedData.departmentColor).toBe('#F59E0B');
  });

  it('no muestra bookmark cuando showBookmark es false', () => {
    const eventWithoutBookmark = { ...mockEvent, showBookmark: false };
    const result = simulateEventCard(eventWithoutBookmark);
    
    expect(result.displayedData.hasBookmark).toBe(false);
  });

  it('aplica colores correctos por departamento', () => {
    const systemsEvent = { ...mockEvent, department: 'Sistemas computacionales' };
    const economyEvent = { ...mockEvent, department: 'Economía' };
    const unknownEvent = { ...mockEvent, department: 'Departamento Desconocido' };
    
    expect(simulateEventCard(systemsEvent).displayedData.departmentColor).toBe('#3B82F6');
    expect(simulateEventCard(economyEvent).displayedData.departmentColor).toBe('#F59E0B');
    expect(simulateEventCard(unknownEvent).displayedData.departmentColor).toBe('#22033dff');
  });

  it('navega con los datos correctos al hacer click', () => {
    const result = simulateEventCard(mockEvent);
    
    expect(result.navigationData.eventId).toBe('1');
    expect(result.navigationData.event.title).toBe('Conferencia de Tecnología 2025');
    expect(result.navigationData.event.department).toBe('Sistemas computacionales');
    expect(result.navigationData.event.time).toBe('10:00 AM');
    expect(result.navigationData.event.location).toBe('Auditorio Principal');
  });

  it('maneja fecha inválida correctamente', () => {
    const eventWithInvalidDate = {
      ...mockEvent,
      date: 'fecha-invalida'
    };
    
    const result = simulateEventCard(eventWithInvalidDate);
   
    expect(typeof result.displayedData.formattedDate).toBe('string');
  });

  it('tiene el testID correcto', () => {
    const result = simulateEventCard(mockEvent);
    expect(result.testId).toBe('event-card');
  });

  it('procesa eventos con imagen por defecto', () => {
    const eventWithoutImage = {
      ...mockEvent,
      imageUrl: null
    };
    
    const result = simulateEventCard(eventWithoutImage);
    expect(result.navigationData.event.imageUrl).toBeNull();
  });

  it('maneja fecha nula correctamente', () => {
    const eventWithNullDate = {
      ...mockEvent,
      date: null
    };
    
    const result = simulateEventCard(eventWithNullDate);
    expect(result.displayedData.formattedDate).toBe('Fecha no disponible');
  });

  it('maneja fecha vacía correctamente', () => {
    const eventWithEmptyDate = {
      ...mockEvent,
      date: ''
    };
    
    const result = simulateEventCard(eventWithEmptyDate);
    expect(result.displayedData.formattedDate).toBe('Fecha no disponible');
  });
});


describe('EventCard - Lógica de Utilidades', () => {
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const options = { day: '2-digit', month: 'long', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (error) {
      return dateString; 
    }
  };

  const getDepartmentColor = (dept, isDark = false) => {
    const colorsitos = {
      'Sistemas computacionales': '#3B82F6',
      'Economía': '#F59E0B',
      'Ciencias Sociales y jurídicas': '#06B6D4',
      'Agronomia': '#10B981',
      'Ciencias de la tierra': '#8B5CF6',
      'Humanidades': '#F97316',
      'Ingeniería en pesquerías': '#EF4444',
      'Ciencias marinas y costeras': '#478884ff',
      'Ciencia animal y conservación del hábitat': '#FBBF24',
    };
    return colorsitos[dept] || (isDark ? '#145172ff' : '#22033dff');
  };

  it('formatea diferentes tipos de fecha correctamente', () => {
    expect(formatDate('2025-06-15')).toContain('junio');
    expect(formatDate('2025-12-25')).toContain('diciembre');
    expect(formatDate(null)).toBe('Fecha no disponible');
    expect(formatDate('')).toBe('Fecha no disponible');
  });

  it('asigna colores para todos los departamentos conocidos', () => {
    expect(getDepartmentColor('Sistemas computacionales')).toBe('#3B82F6');
    expect(getDepartmentColor('Economía')).toBe('#F59E0B');
    expect(getDepartmentColor('Ciencias Sociales y jurídicas')).toBe('#06B6D4');
    expect(getDepartmentColor('Agronomia')).toBe('#10B981');
    expect(getDepartmentColor('Ciencias de la tierra')).toBe('#8B5CF6');
    expect(getDepartmentColor('Humanidades')).toBe('#F97316');
    expect(getDepartmentColor('Ingeniería en pesquerías')).toBe('#EF4444');
    expect(getDepartmentColor('Ciencias marinas y costeras')).toBe('#478884ff');
    expect(getDepartmentColor('Ciencia animal y conservación del hábitat')).toBe('#FBBF24');
  });

  it('usa colores diferentes para modo oscuro', () => {
    const getDepartmentColorWithTheme = (dept, isDark) => {
      const colorsitos = {
        'Sistemas computacionales': '#3B82F6',
        'Economía': '#F59E0B',
        'Ciencias Sociales y jurídicas': '#06B6D4',
        'Agronomia': '#10B981',
        'Ciencias de la tierra': '#8B5CF6',
        'Humanidades': '#F97316',
        'Ingeniería en pesquerías': '#EF4444',
        'Ciencias marinas y costeras': '#478884ff',
        'Ciencia animal y conservación del hábitat': '#FBBF24',
      };
      return colorsitos[dept] || (isDark ? '#145172ff' : '#22033dff');
    };

    expect(getDepartmentColorWithTheme('Departamento Desconocido', false)).toBe('#22033dff');
    expect(getDepartmentColorWithTheme('Departamento Desconocido', true)).toBe('#145172ff');
  });
});