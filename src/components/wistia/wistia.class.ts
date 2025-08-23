export class WistiaVideo {
    private wistiaWindow: Window & {
      Wistia?: { api: (id: string) => { pause: () => void; play: () => void } };
    };
    private id: string;
  
    constructor(id: string) {
      this.id = id;
      this.wistiaWindow = window as Window & {
        Wistia?: { api: (id: string) => { pause: () => void; play: () => void } };
      };
    }
  
    public pause() {
      if (this.wistiaWindow.Wistia) {
        const video = this.wistiaWindow.Wistia.api(this.id);
        if (video) {
          video.pause();
        }
      }
    }
  
    public play() {
      if (this.wistiaWindow.Wistia) {
        const video = this.wistiaWindow.Wistia.api(this.id);
        if (video) {
          video.play();
        }
      }
    }
  }