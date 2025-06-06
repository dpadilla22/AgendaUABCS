const API_BASE_URL = "https://92d8-2806-265-5402-ca4-9c21-53fd-292c-aa68.ngrok-free.app";

export const checkIfBookmarked = async (accountId, eventId, setIsBookmarked) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/${accountId}`);
    const data = await response.json();

    if (data.success) {
      const isSaved = data.favorites.some(fav => fav.eventId == eventId);
      setIsBookmarked(isSaved);
    }
  } catch (error) {
    console.error("Error checking favorites:", error);
  }
};

export const addToFavorites = async (accountId, eventId, setIsBookmarked) => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId }),
    });

    const result = await response.json();
    if (result.success) {
      setIsBookmarked(true);
     
    } else {
      
    }
  } catch (error) {
    console.error("Error:", error);
   
  }
};

export const removeFromFavorites = async (accountId, eventId, setIsBookmarked) => {
  try {
    const response = await fetch(`${API_BASE_URL}/favorites/${accountId}/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    console.log("DELETE result:", result);
    
    if (response.ok && result.success) {
      setIsBookmarked(false);
     
    } else {
      
    }
  } catch (error) {
    console.error("Error al eliminar de favoritos:", error.message);
   
  }
};
