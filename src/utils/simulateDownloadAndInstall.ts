// ============ DISCLAIMER: Wrote by ChatGPT because la flemme as we say in french ==========
type UpdateEventName = 'Started' | 'Progress' | 'Finished' | 'Error';

type UpdateCallback = (event: {
  event: UpdateEventName;
  data: {
    contentLength?: number;
    chunkLength?: number;
    message?: string;
  };
}) => void;

type SimOptions = {
  /** Taille totale à “télécharger” */
  totalBytes?: number; // défaut: 50 Mo
  /** Intervalle entre 2 ticks de progression */
  intervalMs?: number; // défaut: 120 ms
  /** Taille moyenne d’un chunk */
  avgChunkBytes?: number; // défaut: 180 Ko
  /** Aléa sur la taille du chunk (0.0 = constant, 1.0 = ±100%) */
  jitter?: number; // défaut: 0.6
  /** Simuler une erreur à X% (0–100). Ex: 75 => plante vers 75% */
  failAtPercent?: number; // défaut: undefined (pas d’erreur)
  /** Possibilité d’annuler via AbortSignal */
  signal?: AbortSignal;
};

export async function simulateDownloadAndInstall(
  cb: UpdateCallback,
  opts: SimOptions = {},
): Promise<void> {
  const {
    totalBytes = 50 * 1024 * 1024,
    intervalMs = 120,
    avgChunkBytes = 180 * 1024,
    jitter = 0.6,
    failAtPercent,
    signal,
  } = opts;

  let downloaded = 0;
  let finished = false;
  let timer: ReturnType<typeof setInterval> | null = null;

  const cleanup = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }
  const onAbort = () => {
    cleanup();
    throw new DOMException('Aborted', 'AbortError');
  };
  signal?.addEventListener('abort', onAbort, { once: true });

  // Événement de départ
  cb({ event: 'Started', data: { contentLength: totalBytes } });

  await new Promise<void>((resolve, reject) => {
    timer = setInterval(() => {
      // Annulation
      if (signal?.aborted) {
        cleanup();
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }

      // Erreur simulée à un pourcentage donné
      if (
        failAtPercent !== undefined
        && downloaded < (failAtPercent / 100) * totalBytes
        && downloaded + avgChunkBytes >= (failAtPercent / 100) * totalBytes
      ) {
        cleanup();
        cb({
          event: 'Error',
          data: { message: 'Network error simulated for testing.' },
        });
        reject(new Error('Simulated download error'));
        return;
      }

      // Calcul d’un chunk avec jitter
      const rand = 1 + (Math.random() * 2 - 1) * jitter; // [1-jitter ; 1+jitter]
      let chunk = Math.max(1, Math.floor(avgChunkBytes * rand));
      // Ne pas dépasser le total
      chunk = Math.min(chunk, totalBytes - downloaded);

      downloaded += chunk;

      // Progrès
      cb({ event: 'Progress', data: { chunkLength: chunk } });

      // Terminé (download + “install” instantanée pour la démo)
      if (downloaded >= totalBytes && !finished) {
        finished = true;
        cleanup();
        cb({ event: 'Finished', data: {} });
        resolve();
      }
    }, intervalMs);
  }).finally(() => {
    signal?.removeEventListener('abort', onAbort);
    cleanup();
  });
}
