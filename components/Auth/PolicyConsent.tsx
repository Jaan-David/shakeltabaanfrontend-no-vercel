'use client';

import Link from 'next/link';
import React from 'react';

interface PolicyConsentProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  errorMessage?: string;
  disabled?: boolean;
}

export default function PolicyConsent({
  id = 'policy-consent',
  checked,
  onChange,
  errorMessage,
  disabled = false,
}: PolicyConsentProps) {
  return (
    <div className="flex flex-col gap-2 text-right" dir="rtl">
      <div className="flex flex-row-reverse items-start justify-end gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-required="true"
          className="mt-1 h-4 w-4 shrink-0 accent-primary"
          disabled={disabled}
        />
        <label htmlFor={id} className="text-sm leading-6 text-slate-700">
          أوافق على{' '}
          <Link
            href="/policies"
            className="font-medium text-primary underline underline-offset-4 transition-colors duration-200 hover:text-secondary hover:decoration-2"
          >
            سياسات وشروط منصة شق تعبان
          </Link>
        </label>
      </div>
      {errorMessage ? (
        <p className="text-sm text-red-500" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
