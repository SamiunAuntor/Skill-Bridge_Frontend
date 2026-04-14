"use client";

import { Eye, EyeOff } from "lucide-react";

type PasswordVisibilityToggleProps = {
  visible: boolean;
  onToggle: () => void;
};

export default function PasswordVisibilityToggle({
  visible,
  onToggle,
}: PasswordVisibilityToggleProps) {
  const Icon = visible ? EyeOff : Eye;

  return (
    <button
      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-on-surface-variant transition-colors hover:text-primary"
      type="button"
      aria-label={visible ? "Hide password" : "Show password"}
      onClick={onToggle}
    >
      <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
    </button>
  );
}
