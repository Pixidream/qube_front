import {
  computed,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  readonly,
  ref,
} from 'vue';
import { logger } from '@/utils/logger';

export type DeviceClass = 'phone' | 'tablet' | 'desktop' | 'unknown';
export type RuntimeEnvironment = 'tauri' | 'web';

const deviceLogger = logger.child({ composable: 'device' });

interface CapabilitySignals {
  anyPointerCoarse: boolean;
  anyHoverNone: boolean;
  maxTouchPoints: number;
  viewportShorterEdge: number;
  standaloneDisplayMode: boolean;
  iosStandaloneLegacy: boolean;
  hasOrientationAPI: boolean;
  hasScreenOrientation: boolean;
  hasVirtualKeyboardAPI: boolean;
  hasNetworkInfo: boolean;
  supportsSafeAreaEnv: boolean;
  userAgentData: boolean;
}

/**
 * Reads browser capabilities and device characteristics
 * Uses feature detection instead of unreliable user-agent parsing
 */
function readCapabilities(): CapabilitySignals {
  deviceLogger.trace('Reading device capabilities', {
    action: 'read_capabilities_start',
  });

  // Helper for media query matching
  const mm = (q: string) => window.matchMedia?.(q).matches ?? false;

  // Check CSS env() support for safe area insets (iPhone X+ notches, etc.)
  const supportsSafeAreaEnv = (() => {
    try {
      return (
        window.CSS?.supports('padding-top', 'env(safe-area-inset-top)') ?? false
      );
    } catch {
      return false;
    }
  })();

  // Modern Screen Orientation API (replaces deprecated screen.orientation)
  const hasScreenOrientation = (() => {
    try {
      return (
        'orientation' in screen
        && typeof (screen as any).orientation?.lock === 'function'
      );
    } catch {
      return false;
    }
  })();

  // Virtual Keyboard API - primarily Android Chrome for on-screen keyboard detection
  const hasVirtualKeyboardAPI = (() => {
    try {
      return 'virtualKeyboard' in navigator;
    } catch {
      return false;
    }
  })();

  // Network Information API - connection details, more common on mobile
  const hasNetworkInfo = (() => {
    try {
      return 'connection' in navigator;
    } catch {
      return false;
    }
  })();

  // User-Agent Client Hints - modern replacement for user-agent string
  const userAgentData = (() => {
    try {
      return 'userAgentData' in navigator && !!(navigator as any).userAgentData;
    } catch {
      return false;
    }
  })();

  const capabilities = {
    // Media queries for input capabilities - most reliable indicators
    anyPointerCoarse: mm('(any-pointer: coarse)'), // Touch/stylus primary input
    anyHoverNone: mm('(any-hover: none)'), // Cannot hover over elements

    // Touch capability - number of simultaneous touch points supported
    maxTouchPoints: Math.max(0, (navigator as any).maxTouchPoints ?? 0),

    // Screen size using shorter edge (accounts for any orientation)
    viewportShorterEdge:
      Math.min(window.innerWidth ?? 0, window.innerHeight ?? 0)
      * (window.devicePixelRatio || 1),

    // Progressive Web App detection
    standaloneDisplayMode: mm('(display-mode: standalone)'), // PWA installed
    iosStandaloneLegacy: (navigator as any).standalone === true, // iOS Safari web app

    // Device sensors and orientation
    hasOrientationAPI: 'ondeviceorientation' in window, // Device motion sensors
    hasScreenOrientation,

    // Mobile-specific browser features
    hasVirtualKeyboardAPI,
    hasNetworkInfo,
    supportsSafeAreaEnv,
    userAgentData,
  };

  deviceLogger.debug('Device capabilities detected', {
    action: 'read_capabilities_complete',
    capabilities: {
      anyPointerCoarse: capabilities.anyPointerCoarse,
      anyHoverNone: capabilities.anyHoverNone,
      maxTouchPoints: capabilities.maxTouchPoints,
      viewportShorterEdge: capabilities.viewportShorterEdge,
      standaloneDisplayMode: capabilities.standaloneDisplayMode,
      hasOrientationAPI: capabilities.hasOrientationAPI,
      hasScreenOrientation: capabilities.hasScreenOrientation,
      hasVirtualKeyboardAPI: capabilities.hasVirtualKeyboardAPI,
      hasNetworkInfo: capabilities.hasNetworkInfo,
      supportsSafeAreaEnv: capabilities.supportsSafeAreaEnv,
      userAgentData: capabilities.userAgentData,
    },
  });

  return capabilities;
}

/**
 * Scores device capabilities to classify as phone/tablet/desktop
 * Uses weighted scoring system - higher scores indicate stronger evidence
 */
function classifyDevice(signals: CapabilitySignals) {
  deviceLogger.trace('Starting device classification', {
    action: 'classify_device_start',
    inputSignals: {
      anyPointerCoarse: signals.anyPointerCoarse,
      anyHoverNone: signals.anyHoverNone,
      maxTouchPoints: signals.maxTouchPoints,
      viewportShorterEdge: signals.viewportShorterEdge,
    },
  });

  let scoreMobile = 0;
  let scoreTablet = 0;
  let scoreDesktop = 0;

  // Primary indicators: pointer and hover capabilities (most reliable cross-browser)
  if (signals.anyPointerCoarse) {
    scoreMobile += 2.5; // Coarse pointer strongly indicates touch interface
    scoreTablet += 2; // Tablets also use touch primarily
  }
  if (signals.anyHoverNone) {
    scoreMobile += 2; // No hover capability typical of touch devices
    scoreTablet += 1.5; // Tablets may have limited hover support
  }

  // Touch points analysis: helps distinguish tablets from phones
  if (signals.maxTouchPoints >= 5) {
    scoreTablet += 1.5; // Multi-touch tablets typically support more simultaneous touches
    scoreMobile += 1; // Phones have fewer but still some
  } else if (signals.maxTouchPoints >= 1) {
    scoreMobile += 1.5; // Basic touch support favors mobile
    scoreTablet += 0.5;
  }

  // Viewport size heuristics: align with Tailwind CSS breakpoints
  if (signals.viewportShorterEdge <= 640) {
    scoreMobile += 2.5; // Below sm breakpoint = mobile
  } else if (signals.viewportShorterEdge <= 1024) {
    scoreTablet += 2; // sm to lg breakpoint = tablet range
    if (signals.viewportShorterEdge >= 768) {
      scoreTablet += 0.5; // md+ gives slight tablet boost
    }
  } else {
    scoreDesktop += 2; // lg+ breakpoint = desktop/laptop
  }

  // Progressive Web App indicators: installed apps often mobile-focused
  if (signals.standaloneDisplayMode || signals.iosStandaloneLegacy) {
    scoreMobile += 1.5; // PWA standalone mode commonly used on mobile
  }

  // Mobile-specific browser APIs: these features are primarily mobile
  if (signals.hasVirtualKeyboardAPI) scoreMobile += 1.5; // Virtual keyboard mostly Android Chrome
  if (signals.hasNetworkInfo) scoreMobile += 0.5; // Connection API more common on mobile
  if (signals.supportsSafeAreaEnv) scoreMobile += 1; // Safe area insets for notched devices

  // Device orientation APIs: more prevalent on mobile devices
  if (signals.hasOrientationAPI) scoreMobile += 0.5; // Device orientation sensors
  if (signals.hasScreenOrientation) {
    scoreMobile += 0.5; // Screen orientation lock API
    scoreTablet += 0.3; // Tablets also rotate but less commonly
  }

  // Desktop indicators: traditional mouse/keyboard setup
  if (
    !signals.anyPointerCoarse
    && !signals.anyHoverNone
    && signals.maxTouchPoints === 0
  ) {
    scoreDesktop += 2; // Classic desktop: fine pointer + hover + no touch (strong signal)
  }

  // Additional desktop signals for modern laptops
  if (signals.viewportShorterEdge > 1024 && !signals.anyPointerCoarse) {
    scoreDesktop += 1.5; // Large viewport with fine pointer strongly suggests laptop/desktop
  }

  // Tauri desktop bonus (more conservative)
  if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    if (signals.viewportShorterEdge > 1024 && !signals.anyPointerCoarse) {
      scoreDesktop += 1; // Tauri on large screen with fine pointer = desktop app
    }
  }

  // More conservative tablet penalty
  if (signals.viewportShorterEdge > 1536) {
    scoreTablet = Math.max(0, scoreTablet - 0.5); // Only penalize for 2xl+ screens
  }

  // Determine the winning device class
  const maxScore = Math.max(scoreMobile, scoreTablet, scoreDesktop);
  let device: DeviceClass = 'unknown';

  if (maxScore === 0) {
    device = 'unknown';
  } else if (maxScore === scoreMobile) {
    device = 'phone';
  } else if (maxScore === scoreTablet) {
    device = 'tablet';
  } else {
    device = 'desktop';
  }

  // Calculate confidence score: how dominant is the winning classification
  const totalScore = scoreMobile + scoreTablet + scoreDesktop;
  const confidence = totalScore > 0 ? Math.min(1, maxScore / totalScore) : 0;

  deviceLogger.info('Device classification completed', {
    action: 'classify_device_complete',
    result: {
      device,
      confidence: Math.round(confidence * 100) / 100,
      scores: {
        mobile: Math.round(scoreMobile * 100) / 100,
        tablet: Math.round(scoreTablet * 100) / 100,
        desktop: Math.round(scoreDesktop * 100) / 100,
      },
    },
  });

  return { device, confidence };
}

/**
 * Main Vue composable for device detection with reactive updates
 * Automatically tracks viewport changes, orientation changes, and media query updates
 */

export function useDeviceDetection() {
  deviceLogger.debug('Initializing device detection composable', {
    action: 'device_detection_init',
  });

  // Reactive state for device capabilities - updates automatically
  const signals = ref<CapabilitySignals>(readCapabilities());
  const classification = computed(() => classifyDevice(signals.value));

  // Runtime environment detection (Tauri vs web browser)
  const isTauri = ref('__TAURI_INTERNALS__' in window);
  const runtime = computed<RuntimeEnvironment>(() =>
    isTauri.value ? 'tauri' : 'web',
  );

  // Device classification results
  const device = computed(() => classification.value.device);
  const confidence = computed(() => classification.value.confidence);

  // Convenient boolean flags for device types
  const isMobile = computed(() => device.value === 'phone');
  const isTablet = computed(() => device.value === 'tablet');
  const isDesktop = computed(() => device.value === 'desktop');

  // Environment + device combinations for specific use cases
  const isTauriMobile = computed(() => isTauri.value && isMobile.value); // Native mobile app
  const isTauriTablet = computed(() => isTauri.value && isTablet.value); // Native tablet app
  const isTauriDesktop = computed(() => isTauri.value && isDesktop.value); // Native desktop app

  const isWebMobile = computed(() => !isTauri.value && isMobile.value); // Mobile browser
  const isWebTablet = computed(() => !isTauri.value && isTablet.value); // Tablet browser
  const isWebDesktop = computed(() => !isTauri.value && isDesktop.value); // Desktop browser

  // Re-read capabilities when environment changes
  const updateSignals = () => {
    deviceLogger.debug('Updating device signals due to environment change', {
      action: 'update_signals',
      trigger: 'manual_or_event',
    });
    signals.value = readCapabilities();
  };

  // Media query listeners for reactive updates
  let mediaQueries: MediaQueryList[] = [];

  if (getCurrentInstance()) {
    onMounted(() => {
      deviceLogger.info('Setting up device detection event listeners', {
        action: 'event_listeners_setup',
      });

      // Watch for changes in key media queries that affect device classification
      const queries = [
        '(any-pointer: coarse)', // Primary input method changes
        '(any-hover: none)', // Hover capability changes
        '(display-mode: standalone)', // PWA installation state
      ];

      mediaQueries = queries.map((query) => {
        const mq = window.matchMedia(query);
        const handler = () => {
          deviceLogger.debug('Media query changed, updating signals', {
            action: 'media_query_change',
            query,
            matches: mq.matches,
          });
          updateSignals();
        };

        mq.addEventListener('change', handler);
        return mq;
      });

      // Listen for viewport and orientation changes
      const resizeHandler = () => {
        deviceLogger.debug('Viewport resize detected', {
          action: 'viewport_resize',
          newDimensions: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        });
        updateSignals();
      };

      const orientationHandler = () => {
        deviceLogger.debug('Orientation change detected', {
          action: 'orientation_change',
          orientation: (screen as any).orientation?.type || 'unknown',
        });
        updateSignals();
      };

      window.addEventListener('resize', resizeHandler);
      window.addEventListener('orientationchange', orientationHandler);
    });

    onUnmounted(() => {
      deviceLogger.debug('Cleaning up device detection event listeners', {
        action: 'event_listeners_cleanup',
      });

      // Clean up all event listeners to prevent memory leaks
      mediaQueries.forEach((mq) => {
        const handler = updateSignals;
        mq.removeEventListener('change', handler);
      });

      window.removeEventListener('resize', updateSignals);
      window.removeEventListener('orientationchange', updateSignals);
    });
  }

  return {
    // Raw capability signals for advanced use cases
    signals: readonly(signals),

    // Device classification with confidence score
    device: readonly(device),
    confidence: readonly(confidence),

    // Simple device type flags
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
    isDesktop: readonly(isDesktop),

    // Runtime environment
    isTauri: readonly(isTauri),
    runtime: readonly(runtime),

    // Specific environment + device combinations
    isTauriMobile: readonly(isTauriMobile),
    isTauriTablet: readonly(isTauriTablet),
    isTauriDesktop: readonly(isTauriDesktop),

    isWebMobile: readonly(isWebMobile),
    isWebTablet: readonly(isWebTablet),
    isWebDesktop: readonly(isWebDesktop),

    // Manual refresh function
    updateSignals,
  };
}

/**
 * Simplified composable for basic device detection
 * Use this when you only need device type without environment details
 */
export function useDevice() {
  const { device, isMobile, isTablet, isDesktop } = useDeviceDetection();

  return {
    device,
    isMobile,
    isTablet,
    isDesktop,
  };
}

/**
 * Composable focused on runtime environment (Tauri vs Web)
 * Use this when you need to distinguish between native app and browser contexts
 */
export function useRuntimeDevice() {
  const {
    runtime,
    isTauri,
    isTauriMobile,
    isTauriTablet,
    isTauriDesktop,
    isWebMobile,
    isWebTablet,
    isWebDesktop,
  } = useDeviceDetection();

  return {
    runtime,
    isTauri,
    isWeb: computed(() => !isTauri.value), // Convenience computed for web detection
    isTauriMobile,
    isTauriTablet,
    isTauriDesktop,
    isWebMobile,
    isWebTablet,
    isWebDesktop,
  };
}
