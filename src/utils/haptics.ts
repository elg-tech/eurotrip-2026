export const vibrate = (type: 'light' | 'medium' | 'success' | 'error' = 'light') => {
  if (typeof window !== 'undefined' && window.navigator.vibrate) {
    switch (type) {
      case 'light':
        window.navigator.vibrate(10); // Vibração curtinha (estilo clique)
        break;
      case 'medium':
        window.navigator.vibrate(30);
        break;
      case 'success':
        window.navigator.vibrate([20, 50, 20]); // Dois toques rápidos
        break;
      case 'error':
        window.navigator.vibrate([100, 50, 100]); // Vibração pesada
        break;
    }
  }
};