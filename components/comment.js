import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://5f82-2806-265-5402-ca4-4856-b42f-7290-c370.ngrok-free.app';

export const CommentsAPI = {

  fetchAllComments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/all`);
      const data = await response.json();
      
      if (data.success && data.comments) {
        return {
          success: true,
          comments: data.comments || []
        };
      } else {
        return {
          success: false,
          comments: [],
          message: data.message || 'No se pudieron obtener los comentarios'
        };
      }
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
      return {
        success: false,
        comments: [],
        message: 'Error de conexión'
      };
    }
  },


  createComment: async (commentText) => {
    try {
      const accountId = await AsyncStorage.getItem("accountId");
      if (!accountId) {
        return {
          success: false,
          message: "No se pudo obtener la información de la cuenta"
        };
      }

      const response = await fetch(`${API_BASE_URL}/createComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titleComment: "Comentario de usuario",
          descriptionComment: commentText.trim(),
          accountId: accountId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: "Comentario enviado exitosamente",
          comment: data.comment
        };
      } else {
        return {
          success: false,
          message: data.message || "No se pudo enviar el comentario"
        };
      }
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      return {
        success: false,
        message: "Error de conexión al enviar el comentario"
      };
    }
  }
};

export const CommentsUtils = {

  formatTimeAgo: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    
    if (diffMinutes < 1) {
      return 'Hace un momento';
    } else if (diffMinutes < 60) {
      return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    } else if (diffWeeks < 4) {
      return `Hace ${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'}`;
    } else {
      return `Hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;
    }
  },


  validateComment: (commentText) => {
    if (!commentText || !commentText.trim()) {
      return {
        isValid: false,
        message: "Por favor escribe un comentario"
      };
    }

    if (commentText.trim().length < 3) {
      return {
        isValid: false,
        message: "El comentario debe tener al menos 3 caracteres"
      };
    }

    if (commentText.trim().length > 500) {
      return {
        isValid: false,
        message: "El comentario no puede exceder 500 caracteres"
      };
    }

    return {
      isValid: true,
      message: ""
    };
  },


  sortCommentsByDate: (comments) => {
    return comments.sort((a, b) => {
      const dateA = new Date(a.dateCreated || a.created_at);
      const dateB = new Date(b.dateCreated || b.created_at);
      return dateB - dateA; 
    });
  },


  getUserInfo: (comment) => {
    return {
      name: comment.userName || comment.user_name || 'Usuario Anónimo',
      avatar: comment.userAvatar || comment.user_avatar || null,
      id: comment.userId || comment.user_id || comment.accountId
    };
  }
};