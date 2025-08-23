declare module 'dom-event-simulate' {
  export function domEvent(
    element: HTMLElement,
    eventType: string,
    options?: {
      clientX?: number;
      clientY?: number;
      keyCode?: number;
      key?: string;
      data?: any;
    }
  ): void;
}
