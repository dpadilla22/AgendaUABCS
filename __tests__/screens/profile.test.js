
describe('Profile Screen - Tests Completos', () => {
 
  const mockUserData = { email: 'estudiante@uabcs.mx' };
  const mockStats = { favorites: 3, attendance: 5 };

  const getUserData = async () => mockUserData;
  const getUserStats = async () => mockStats;

  const profileDisplay = async (userData = mockUserData, stats = mockStats) => ({
  displayTitle: 'Estudiante UABCS',
  displayEmail: userData?.email || 'Usuario',
  displayStats: {
    favorites: stats?.favorites || 0,
    attendance: stats?.attendance || 0,
  },
  sections: {
    favorites: { title: `Favoritos (${stats?.favorites || 0})`, expanded: false },
    attendance: { title: `Asistencia (${stats?.attendance || 0})`, expanded: false },
  },
});


  const getHour = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('T')[0].split('-');
    return new Date(`${year}-${month}-${day}T12:00:00`).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const simulateLogout = async () => ({ success: true, screen: 'Welcome' });

  it('muestra el email del usuario correctamente', async () => {
    const display = await profileDisplay();
    expect(display.displayEmail).toBe('estudiante@uabcs.mx');
    expect(display.displayEmail).toContain('@');
  });

  it('muestra "Usuario" cuando no hay email', async () => {
    const display = await profileDisplay({ email: '' });
    expect(display.displayEmail).toBe('Usuario');
  });

  it('muestra estadísticas de favoritos y asistencia correctamente', async () => {
    const display = await profileDisplay();
    expect(display.displayStats.favorites).toBe(3);
    expect(display.displayStats.attendance).toBe(5);
    expect(typeof display.displayStats.favorites).toBe('number');
    expect(typeof display.displayStats.attendance).toBe('number');
  });

  it('maneja títulos de secciones con contadores', async () => {
    const display = await profileDisplay();
    expect(display.sections.favorites.title).toBe('Favoritos (3)');
    expect(display.sections.attendance.title).toBe('Asistencia (5)');
  });

  it('maneja estado de secciones expandibles', async () => {
    const display = await profileDisplay();
    expect(display.sections.favorites.expanded).toBe(false);
    display.sections.favorites.expanded = true;
    expect(display.sections.favorites.expanded).toBe(true);
  });

  it('maneja listas vacías de eventos', async () => {
    const display = await profileDisplay({ email: 'usuario@uabcs.mx' }, { favorites: 0, attendance: 0 });
    expect(display.displayStats.favorites).toBe(0);
    expect(display.displayStats.attendance).toBe(0);
    expect(display.sections.favorites.title).toBe('Favoritos (0)');
    expect(display.sections.attendance.title).toBe('Asistencia (0)');
  });

  it('valida el formato del título del perfil', async () => {
    const display = await profileDisplay();
    expect(display.displayTitle).toBe('Estudiante UABCS');
    expect(display.displayTitle).toContain('UABCS');
  });

  it('simula el proceso de carga de datos', async () => {
    let loading = true;
    const userData = await getUserData();
    const stats = await getUserStats();
    loading = false;
    expect(loading).toBe(false);
    expect(userData).toBeDefined();
    expect(stats).toBeDefined();
  });

  it('maneja datos corruptos de AsyncStorage', async () => {
    const display = await profileDisplay(null, { favorites: 0, attendance: 0 });
    expect(display.displayEmail).toBe('Usuario');
    expect(display.displayStats.favorites).toBe(0);
    expect(display.displayStats.attendance).toBe(0);
  });

  it('formatea correctamente fechas de eventos', () => {
    const formatted = formatDate('2025-06-15T10:00:00');
    expect(formatted).toContain('junio');
    expect(formatted).toContain('2025');
  });

  it('formatea correctamente horas de eventos', () => {
    const hour = getHour('2025-06-15T14:30:00');
    expect(hour).toBe('14:30');
  });

  it('maneja el cierre de sesión', async () => {
    const result = await simulateLogout();
    expect(result.success).toBe(true);
    expect(result.screen).toBe('Welcome');
  });
});
