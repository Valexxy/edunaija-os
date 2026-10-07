// Telegram WebApp (TMA) Client Bridge
// Provides zero-friction integration when Next.js PWA runs inside Telegram

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          start_param?: string; // Referral code passed via t.me/bot?startapp=CHISOM-7X
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
        };
        isExpanded: boolean;
        expand: () => void;
        close: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        ready: () => void;
        HapticFeedback: {
          impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
          notificationOccurred: (type: "error" | "success" | "warning") => void;
          selectionChanged: () => void;
        };
        openLink: (url: string) => void;
        openTelegramLink: (url: string) => void;
      };
    };
  }
}

export const getTelegramWebApp = () => {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const initTelegramMiniApp = () => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.ready();
    tg.expand();
    try {
      tg.setHeaderColor("#050508");
      tg.setBackgroundColor("#050508");
    } catch {
      // Ignored if unsupported in older Telegram clients
    }
  }
};

export const triggerTmaHaptic = (style: "light" | "medium" | "heavy" | "error" | "success" | "warning" = "light") => {
  const tg = getTelegramWebApp();
  if (tg?.HapticFeedback) {
    if (style === "error" || style === "success" || style === "warning") {
      tg.HapticFeedback.notificationOccurred(style);
    } else {
      tg.HapticFeedback.impactOccurred(style);
    }
  }
};
