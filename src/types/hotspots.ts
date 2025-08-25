export type Hotspot = {
  id: string;
  label?: string;     // opcional: texto dentro do botão
  href: string;
  x: number; y: number; w: number; h: number; // em px do design
  target?: "_blank" | "_self";
};

// base do design onde você pegou as coordenadas
export const DESIGN_W = 1920;
export const DESIGN_H = 1080;

// exemplo aproximado dos 3 botões do seu frame
export const HOTSPOTS: Hotspot[] = [
  { id: "rsvp",           label: "RSVP",            href: "/rsvp",            x: 760, y: 280, w: 400, h: 70 },
  { id: "book",           label: "BOOK A TABLE",    href: "/book-a-table",    x: 700, y: 430, w: 520, h: 70 },
  { id: "cancel-plans",   label: "CANCEL OTHER PLANS", href: "/cancel",       x: 620, y: 580, w: 680, h: 70 },
];
