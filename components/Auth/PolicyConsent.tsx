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
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-required="true"
          className="mt-1 h-4 w-4 accent-primary"
          disabled={disabled}
        />
        <label htmlFor={id} className="text-sm text-slate-700">
          أوافق على{' '}
          <Link
            href="/policies"
            className="text-primary hover:text-secondary underline underline-offset-4"
          >
            سياسات وشروط منصة شق تعبان
          </Link>
        </label>
      </div>
      {errorMessage ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
