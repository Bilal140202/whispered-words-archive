
import React from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const CapsuleDatePicker: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div>
      <label className="block mb-1 font-serif text-sm">Unlock Date &amp; Time</label>
      <input
        type="datetime-local"
        value={value}
        min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)}
        onChange={e => onChange(e.target.value)}
        className="rounded border px-3 py-2 w-full bg-white/90 font-serif"
        required
      />
    </div>
  );
};

export default CapsuleDatePicker;
