import { addToFavorites, removeFromFavorites, checkIfBookmarked } from '../../components/Favorites';

const API_BASE_URL = "https://agendauabcs.up.railway.app";

beforeEach(() => {
  global.fetch = jest.fn();
  jest.clearAllMocks();
});

test("addToFavorites debe agregar a favoritos y llamar setIsBookmarked(true)", async () => {
  const mockSetIsBookmarked = jest.fn();

  global.fetch.mockResolvedValueOnce({
    json: async () => ({ success: true }),
    ok: true,
  });

  await addToFavorites(1, 100, mockSetIsBookmarked);

  expect(fetch).toHaveBeenCalledWith(
    `${API_BASE_URL}/events/100/favorite`,
    expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: 1 })
    })
  );

  expect(mockSetIsBookmarked).toHaveBeenCalledWith(true);
});

test("removeFromFavorites debe quitar de favoritos y llamar setIsBookmarked(false)", async () => {
  const mockSetIsBookmarked = jest.fn();

  global.fetch.mockResolvedValueOnce({
    json: async () => ({ success: true }),
    ok: true,
  });

  await removeFromFavorites(1, 100, mockSetIsBookmarked);

  expect(fetch).toHaveBeenCalledWith(
    `${API_BASE_URL}/favorites/1/100`,
    expect.objectContaining({ method: "DELETE" })
  );

  expect(mockSetIsBookmarked).toHaveBeenCalledWith(false);
});

test("checkIfBookmarked debe detectar si un evento está guardado", async () => {
  const mockSetIsBookmarked = jest.fn();

  global.fetch.mockResolvedValueOnce({
    json: async () => ({
      success: true,
      favorites: [
        { eventId: 100 },
        { eventId: 200 }
      ]
    })
  });

  await checkIfBookmarked(1, 100, mockSetIsBookmarked);

  expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/favorites/1`);
  expect(mockSetIsBookmarked).toHaveBeenCalledWith(true);
});

test("checkIfBookmarked debe marcar false si NO está guardado", async () => {
  const mockSetIsBookmarked = jest.fn();

  global.fetch.mockResolvedValueOnce({
    json: async () => ({
      success: true,
      favorites: [
        { eventId: 200 }, 
      ]
    })
  });

  await checkIfBookmarked(1, 100, mockSetIsBookmarked);

  expect(mockSetIsBookmarked).toHaveBeenCalledWith(false);
});
