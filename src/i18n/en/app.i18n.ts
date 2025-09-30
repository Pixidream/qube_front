export default {
  name: 'Qube',
  initialization: {
    retryMessage: 'An error has occurred. Retrying {count}/{max}...',
    maxRetriesExceeded:
      'Initialization failed after {max} attempts. Please check your connection and try again.',
    retrying: 'Retrying...',
    refreshButton: 'Refresh',
    restartButton: 'Restart App',
  },
  update: {
    checking: 'Checking for update...',
    installing: 'Installing update',
    downloading: 'Downloading update',
  },
};
