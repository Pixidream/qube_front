export default {
  name: 'Qube',
  initialization: {
    retryMessage: 'Une erreur est survenue. Tentative {count}/{max}...',
    maxRetriesExceeded:
      "L'initialisation a échoué après {max} tentatives. Veuillez vérifier votre connexion et réessayer.",
    retrying: 'Nouvelle tentative...',
    refreshButton: 'Actualiser',
    restartButton: 'Redémarrer',
  },
};
