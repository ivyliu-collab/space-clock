import { useCallback, useRef, useState } from "react";

interface PipState {
  isSupported: boolean;
  isOpen: boolean;
  pipWindow: Window | null;
}

/**
 * Hook to manage Document Picture-in-Picture API with window.open fallback.
 */
export function usePictureInPicture() {
  const [state, setState] = useState<PipState>({
    isSupported: typeof window !== "undefined" && "documentPictureInPicture" in window,
    isOpen: false,
    pipWindow: null,
  });
  const popupRef = useRef<Window | null>(null);

  const copyStyles = useCallback((targetDoc: Document) => {
    // Copy all stylesheets
    for (const sheet of document.styleSheets) {
      try {
        if (sheet.href) {
          const link = targetDoc.createElement("link");
          link.rel = "stylesheet";
          link.href = sheet.href;
          targetDoc.head.appendChild(link);
        } else if (sheet.cssRules) {
          const style = targetDoc.createElement("style");
          for (const rule of sheet.cssRules) {
            style.textContent += rule.cssText + "\n";
          }
          targetDoc.head.appendChild(style);
        }
      } catch {
        // Cross-origin stylesheet, skip
      }
    }

    // Copy Google Fonts link
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      const clone = link.cloneNode(true) as HTMLLinkElement;
      targetDoc.head.appendChild(clone);
    });

    // Set viewport and background
    const meta = targetDoc.createElement("meta");
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1.0";
    targetDoc.head.appendChild(meta);

    targetDoc.body.style.background = "linear-gradient(135deg, #FDFCFB 0%, #E2EBFF 100%)";
    targetDoc.body.style.margin = "0";
    targetDoc.body.style.fontFamily = "'Quicksand', sans-serif";
    targetDoc.body.style.minHeight = "100vh";
  }, []);

  const openPip = useCallback(async (): Promise<{ container: HTMLElement; win: Window } | null> => {
    // Try Document PiP API first
    if ("documentPictureInPicture" in window) {
      try {
        const dpip = (window as any).documentPictureInPicture;
        const pipWin: Window = await dpip.requestWindow({
          width: 280,
          height: 200,
        });

        copyStyles(pipWin.document);

        const container = pipWin.document.createElement("div");
        container.id = "pip-root";
        pipWin.document.body.appendChild(container);

        pipWin.addEventListener("pagehide", () => {
          setState({ isSupported: true, isOpen: false, pipWindow: null });
        });

        setState({ isSupported: true, isOpen: true, pipWindow: pipWin });
        return { container, win: pipWin };
      } catch (e) {
        console.warn("Document PiP failed, falling back to window.open", e);
      }
    }

    // Fallback: window.open
    const popup = window.open(
      "",
      "ding-pip",
      "width=300,height=220,top=100,left=" + (window.screen.width - 340) + ",toolbar=no,menubar=no,scrollbars=no,resizable=yes"
    );

    if (!popup) {
      console.error("Popup blocked");
      return null;
    }

    popupRef.current = popup;
    popup.document.title = "Ding! - 工作中";
    copyStyles(popup.document);

    const container = popup.document.createElement("div");
    container.id = "pip-root";
    popup.document.body.appendChild(container);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        setState((s) => ({ ...s, isOpen: false, pipWindow: null }));
      }
    }, 500);

    setState({ isSupported: false, isOpen: true, pipWindow: popup });
    return { container, win: popup };
  }, [copyStyles]);

  const closePip = useCallback(() => {
    if (state.pipWindow && !state.pipWindow.closed) {
      state.pipWindow.close();
    }
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    setState((s) => ({ ...s, isOpen: false, pipWindow: null }));
  }, [state.pipWindow]);

  return {
    ...state,
    openPip,
    closePip,
  };
}
