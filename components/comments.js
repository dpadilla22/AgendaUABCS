const API_URL = "https://4e06-200-92-221-16.ngrok-free.app";


export const fetchComments = async () => {
  try {
    const response = await fetch(`${API_URL}/comments`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    const data = await response.json();

    if (data.success) {
    
      const sortedComments = data.comments.sort(
        (a, b) => new Date(b.dateComment) - new Date(a.dateComment)
      );
      return {
        success: true,
        comments: sortedComments,
      };
    } else {
      throw new Error(data.message || "Error loading comments");
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};


export const createComment = async (commentData) => {
  try {
    console.log("Enviando comentario con ID de cuenta:", commentData.accountId);

    const response = await fetch(`${API_URL}/createComment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        titleComment: commentData.titleComment || "Comentario de usuario",
        descriptionComment: commentData.descriptionComment,
        accountId: commentData.accountId,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: data,
      };
    } else {
      throw new Error(data.message || "Error al enviar comentario");
    }
  } catch (error) {
    console.error("Error submitting comment:", error);
    throw error;
  }
};


export const convertUTCToLocal = (utcDateString) => {
  if (!utcDateString) return null;

  try {
    const utcDate = new Date(utcDateString);
    
    const localDate = new Date(utcDate.getTime() - 7 * 60 * 60 * 1000);
    return localDate;
  } catch (error) {
    console.error("Error converting UTC to local:", error);
    return new Date(utcDateString);
  }
};


export const formatDateTime = (dateString) => {
  if (!dateString) return "";

  try {
    const localDate = convertUTCToLocal(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - localDate);

    const diffSeconds = Math.floor(diffTime / 1000);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffSeconds < 60) {
      return "Hace unos segundos";
    } else if (diffMinutes < 60) {
      return diffMinutes === 1 ? "Hace 1 minuto" : `Hace ${diffMinutes} minutos`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? "Hace 1 hora" : `Hace ${diffHours} horas`;
    } else if (diffDays === 0) {
      return "Hoy";
    } else if (diffDays === 1) {
      return "Ayer";
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      const hours = localDate.getHours().toString().padStart(2, "0");
      const minutes = localDate.getMinutes().toString().padStart(2, "0");

      return (
        localDate.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) + ` ${hours}:${minutes}`
      );
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Fecha no válida";
  }
};