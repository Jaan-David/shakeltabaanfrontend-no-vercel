export interface PolicyAcceptanceInfo {
  accepted: boolean;
  acceptedAt?: string | null;
}

const normalizeBoolean = (value: unknown): boolean => {
  if (value === true) return true;
  if (value === false || value === undefined || value === null) return false;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return false;
};

const getValue = (record: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    if (key in record) return record[key];
  }
  return undefined;
};

export const getPolicyAcceptanceInfo = (user: unknown): PolicyAcceptanceInfo => {
  if (!user || typeof user !== 'object') {
    return { accepted: false };
  }

  const record = user as Record<string, unknown>;

  const acceptedValue = getValue(record, [
    'acceptedPolicies',
    'policyAccepted',
    'policiesAccepted',
    'hasAcceptedPolicies',
    'acceptedTerms',
  ]);

  const acceptedAtValue = getValue(record, [
    'acceptedPoliciesAt',
    'policyAcceptedAt',
    'policiesAcceptedAt',
    'acceptedTermsAt',
    'acceptedAt',
  ]);

  return {
    accepted: normalizeBoolean(acceptedValue),
    acceptedAt: typeof acceptedAtValue === 'string' ? acceptedAtValue : null,
  };
};

export const hasAcceptedPolicies = (user: unknown): boolean => {
  return getPolicyAcceptanceInfo(user).accepted;
};
