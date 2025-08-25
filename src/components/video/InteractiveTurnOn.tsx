import { TurnOnPhone } from "../svg/TurnOnPhone";

export default function InteractiveTurnOn({ action }: { action: () => void }) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
    <div className="text-center space-y-8">
      <div className="mx-auto max-w-3xl w-1/2">
        <TurnOnPhone className="w-full h-full" />
      </div>
      <div className="space-y-4">
        <p className="text-lg font-rh-sans font-light opacity-80">
          This Video Is Horizontal
        </p>
        <button onClick={action} className="text-lg font-rh-sans font-light opacity-80 hover:opacity-100 transition-opacity">
           Click to Enter Experience
        </button>
      </div>
    </div>
  </div>
  );
}