
import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import LetterForm from "@/components/LetterForm";

interface AddLetterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}
const AddLetterSheet: React.FC<AddLetterSheetProps> = ({ open, onOpenChange, onSubmit }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-w-xl mx-auto w-full shadow-diary px-0 py-6 bg-white rounded-t-2xl border-t-2 border-pink-200 animate-fade-in">
        <h3 className="font-handwritten text-3xl text-center text-pink-400 mb-3 drop-shadow-sm tracking-wide">
          Compose Your Letter
        </h3>
        <LetterForm onSubmit={onSubmit} />
        <div className="text-xs mt-4 text-gray-400 text-center">
          Letters are instantly visible to everyone.
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddLetterSheet;
