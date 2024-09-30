import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label }) => {
  return (
    <div className="flex items-center space-x-2">
      {label && <Label>{label}</Label>}
      <Input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-8 p-0 border-none"
      />
      <Input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-24"
      />
    </div>
  )
}