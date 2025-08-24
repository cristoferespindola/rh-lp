declare global {
  interface Window {
    Vimeo: {
      Player: new (element: HTMLElement | string, options?: any) => VimeoPlayer;
    };
  }
}

interface VimeoPlayer {
  play(): Promise<void>;
  pause(): Promise<void>;
  requestFullscreen(): Promise<void>;
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback?: (data: any) => void): void;
}

export {};
