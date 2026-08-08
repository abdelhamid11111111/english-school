"use client";

import { useCallback, useState } from "react";
import type {
  ContactFormErrors,
  ContactFormValues,
  SubmitState,
} from "@/types";

const EMPTY: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  course: "",
  message: "",
};

// Deliberately permissive: the only thing worth rejecting client-side is a
// string that cannot possibly be an address. Stricter regexes reject valid
// addresses (apostrophes, new TLDs, +tags) and cost real signups.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Digits, spaces and the usual separators; 7+ digits total.
const PHONE = /^[+\d][\d\s().-]{6,}$/;

function validate(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "We'll need something to call you.";
  } else if (values.name.trim().length < 2) {
    errors.name = "That looks a little short.";
  }

  if (!values.email.trim()) {
    errors.email = "An email address, so we can reply.";
  } else if (!EMAIL.test(values.email.trim())) {
    errors.email = "That address doesn't look complete.";
  }

  // Phone is optional — only validated when something was typed.
  if (values.phone.trim() && !PHONE.test(values.phone.trim())) {
    errors.phone = "Digits only, with or without a country code.";
  }

  if (!values.course) {
    errors.course = "Pick the closest one — we can change it later.";
  }

  if (values.message.trim().length < 10) {
    errors.message = "A sentence or two about your goal is plenty.";
  }

  return errors;
}

/**
 * Contact form state machine.
 *
 * Validation timing follows the "reward early, punish late" rule:
 *
 * - a field is **never** marked invalid while it is being typed for the first
 *   time — errors only appear after `blur` or after a submit attempt;
 * - once a field *has* an error it re-validates on every keystroke, so the
 *   message disappears the moment it's fixed rather than at the next blur.
 *
 * The submit is a stub that resolves after a beat. Wire it to a Route Handler
 * or a Server Action; nothing else in the component needs to change.
 */
export function useContactForm() {
  const [values, setValues] = useState<ContactFormValues>(EMPTY);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof ContactFormValues, boolean>>
  >({});
  const [status, setStatus] = useState<SubmitState>("idle");

  const setField = useCallback(
    (field: keyof ContactFormValues, value: string) => {
      setValues((current) => {
        const next = { ...current, [field]: value };
        // Live re-validation, but only for fields already showing an error.
        setErrors((currentErrors) =>
          currentErrors[field]
            ? { ...currentErrors, [field]: validate(next)[field] }
            : currentErrors,
        );
        return next;
      });
    },
    [],
  );

  const blurField = useCallback((field: keyof ContactFormValues) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setValues((current) => {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]: validate(current)[field],
      }));
      return current;
    });
  }, []);

  const submit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const found = validate(values);
      setErrors(found);
      setTouched({
        name: true,
        email: true,
        phone: true,
        course: true,
        message: true,
      });

      if (Object.values(found).some(Boolean)) {
        setStatus("error");
        return;
      }

      setStatus("submitting");
      try {
        // TODO: replace with a POST to your Route Handler / Server Action.
        await new Promise((resolve) => setTimeout(resolve, 1100));
        setStatus("success");
        setValues(EMPTY);
        setTouched({});
      } catch {
        setStatus("error");
      }
    },
    [values],
  );

  const reset = useCallback(() => {
    setValues(EMPTY);
    setErrors({});
    setTouched({});
    setStatus("idle");
  }, []);

  /** An error is only *shown* once the field has been blurred or submitted. */
  const errorFor = useCallback(
    (field: keyof ContactFormValues) =>
      touched[field] ? errors[field] : undefined,
    [errors, touched],
  );

  return { values, status, setField, blurField, submit, reset, errorFor };
}
