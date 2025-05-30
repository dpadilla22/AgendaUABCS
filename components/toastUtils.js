import Toast from 'react-native-toast-message';

export const showToast = (message, type = 'error') => {
  Toast.show({
    type,
    text1: message,
    position: 'top',
    visibilityTime: 3000,
  });
};
