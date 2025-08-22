"use client";



interface SelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function Selector({ value, onChange, required = false }: SelectorProps) {
  const options = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 items-center w-full">
      <label className="text-white text-sm font-rh-sans font-light text-center">
        Attendees
      </label>
      <div className="flex gap-4 col-span-2 w-full">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              w-full h-12 
              border border-white 
              font-rh-sans font-light text-white
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50,
              'text-white hover:bg-[#333333]',
              ${value !== option.value 
                ? 'bg-transparent hover:bg-[#333333]' 
                : 'bg-[#242424] hover:bg-[#333333]'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
      {required && !value && (
        <p className="text-red-400 text-xs mt-1">Please select number of attendees</p>
      )}
    </div>
  );
}