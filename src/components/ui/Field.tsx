"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_FLUID } from "@/lib/motion";
import { cn } from "@/lib/cn";

interface BaseFieldProps {
  label: string;
  name: string;
  value: string;
  error?: string;
  required?: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}

interface InputFieldProps extends BaseFieldProps {
  type?: "text" | "email" | "tel";
  autoComplete?: string;
}

/**
 * Text input with a floating label.
 *
 * The label is the only element that moves: it scales down and lifts into the
 * field's top padding when the input is focused or filled. Because it's a real
 * `<label htmlFor>`, clicking it still focuses the input and screen readers
 * still announce it — unlike a placeholder-as-label, which vanishes the moment
 * typing starts and leaves the user with an unlabelled box.
 *
 * Focus is drawn with an animated underline that scales from the centre, plus
 * a ring colour change. Both are `transform`/`color` only.
 */
export function InputField({
  label,
  name,
  value,
  error,
  required,
  type = "text",
  autoComplete,
  onChange,
  onBlur,
}: InputFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <FieldShell
      id={id}
      label={label}
      lifted={lifted}
      focused={focused}
      error={error}
      errorId={errorId}
    >
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onFocus={() => setFocused(true)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          setFocused(false);
          onBlur();
        }}
        className="text-ink w-full bg-transparent pt-6 pb-2 text-[0.9375rem] outline-none"
      />
    </FieldShell>
  );
}

interface SelectFieldProps extends BaseFieldProps {
  options: readonly { value: string; label: string }[];
}

export function SelectField({
  label,
  name,
  value,
  error,
  required,
  options,
  onChange,
  onBlur,
}: SelectFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [focused, setFocused] = useState(false);

  return (
    <FieldShell
      id={id}
      label={label}
      // A select always shows something, so the label is always lifted.
      lifted
      focused={focused}
      error={error}
      errorId={errorId}
    >
      <select
        id={id}
        name={name}
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onFocus={() => setFocused(true)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          setFocused(false);
          onBlur();
        }}
        className={cn(
          "w-full appearance-none bg-transparent pt-6 pr-8 pb-2 text-[0.9375rem] outline-none",
          value ? "text-ink" : "text-ink-soft",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ink-soft pointer-events-none absolute right-0 bottom-3 size-4"
      >
        <path d="m5.5 9.25 6.5 6 6.5-6" />
      </svg>
    </FieldShell>
  );
}

interface TextareaFieldProps extends BaseFieldProps {
  rows?: number;
}

export function TextareaField({
  label,
  name,
  value,
  error,
  required,
  rows = 4,
  onChange,
  onBlur,
}: TextareaFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <FieldShell
      id={id}
      label={label}
      lifted={lifted}
      focused={focused}
      error={error}
      errorId={errorId}
    >
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onFocus={() => setFocused(true)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          setFocused(false);
          onBlur();
        }}
        className="text-ink w-full resize-none bg-transparent pt-6 pb-2 text-[0.9375rem] leading-relaxed outline-none"
      />
    </FieldShell>
  );
}

/* -------------------------------------------------------------------------- */

interface FieldShellProps {
  id: string;
  label: string;
  lifted: boolean;
  focused: boolean;
  error?: string;
  errorId: string;
  children: React.ReactNode;
}

function FieldShell({
  id,
  label,
  lifted,
  focused,
  error,
  errorId,
  children,
}: FieldShellProps) {
  return (
    <div className="w-full">
      <div className="relative">
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-0 origin-left transition-all duration-500 ease-fluid",
            lifted
              ? "text-micro top-0 scale-100 tracking-[0.16em] uppercase"
              : "top-6 text-[0.9375rem] tracking-normal normal-case",
            error ? "text-danger" : focused ? "text-accent-ink" : "text-ink-soft",
          )}
        >
          {label}
        </label>

        {children}

        {/* Baseline rule + focus underline that grows from the centre. */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 bottom-0 block h-px transition-colors duration-500 ease-fluid",
            error ? "bg-danger/40" : "bg-ink/15",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 bottom-0 block h-[1.5px] origin-center transition-transform duration-700 ease-fluid",
            error ? "bg-danger" : "bg-ink",
            focused || error ? "scale-x-100" : "scale-x-0",
          )}
        />
      </div>

      {/* Error message. Animating height as well as opacity stops the form
          jumping as messages appear and clear. */}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            key="error"
            id={errorId}
            role="alert"
            initial={{ height: 0, opacity: 0, y: -4 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: EASE_FLUID }}
            className="text-danger overflow-hidden text-[0.8125rem]"
          >
            <span className="block pt-2">{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
