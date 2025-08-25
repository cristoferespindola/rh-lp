export const ACTIONS = [
  { id: "rsvp", label: "RSVP", href: "/rsvp" },
  { id: "book", label: "BOOK A TABLE", href: "/book-a-table" },
  { id: "cancel-plans", label: "CANCEL OTHER PLANS", href: "/cancel" },
];

export default function VideoActions() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
      <div className="flex flex-col items-center justify-center gap-4">
        {ACTIONS.map(action => (
          <a
            href={action.href}
            key={action.id}
            className="text-white flex flex-col items-center justify-center"
          >
            <span className="text-2xl font-rh-sans font-light">{action.label}</span>
            <span className="text-lg font-rh-sans font-light">Click here</span>
          </a>
        ))}
      </div>
    </div>
  );
}
