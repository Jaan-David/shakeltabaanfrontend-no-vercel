import { API_ENDPOINTS, Api } from '../api/endpoints';

export interface PolicyAcceptancePayload {
  acceptedPolicies: boolean;
  acceptedPoliciesAt: string;
}

export interface PolicyAcceptanceResponse {
  status: string;
  message?: string;
  data?: {
    user?: Record<string, unknown>;
  };
}

export const updatePolicyAcceptance = async (
  token: string,
  payload: PolicyAcceptancePayload
): Promise<PolicyAcceptanceResponse> => {
  const acceptedAt = payload.acceptedPoliciesAt;

  const formData = new FormData();
  formData.append('acceptedPolicies', String(payload.acceptedPolicies));
  formData.append('acceptedPoliciesAt', acceptedAt);
  formData.append('policyAccepted', String(payload.acceptedPolicies));
  formData.append('policyAcceptedAt', acceptedAt);
  formData.append('policiesAccepted', String(payload.acceptedPolicies));
  formData.append('policiesAcceptedAt', acceptedAt);
  formData.append('acceptedTerms', String(payload.acceptedPolicies));
  formData.append('acceptedTermsAt', acceptedAt);

  const formResponse = await fetch(`${Api}${API_ENDPOINTS.AUTH.UPDATE_PROFILE}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const formContentType = formResponse.headers.get('content-type');
  const formDataResponse = formContentType && formContentType.includes('application/json')
    ? await formResponse.json()
    : { status: formResponse.ok ? 'success' : 'error' };

  if (formResponse.ok) {
    return formDataResponse as PolicyAcceptanceResponse;
  }

  const jsonResponse = await fetch(`${Api}${API_ENDPOINTS.AUTH.UPDATE_PROFILE}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      acceptedPolicies: payload.acceptedPolicies,
      acceptedPoliciesAt: acceptedAt,
      policyAccepted: payload.acceptedPolicies,
      policyAcceptedAt: acceptedAt,
      policiesAccepted: payload.acceptedPolicies,
      policiesAcceptedAt: acceptedAt,
      acceptedTerms: payload.acceptedPolicies,
      acceptedTermsAt: acceptedAt,
    }),
  });

  const jsonContentType = jsonResponse.headers.get('content-type');
  const jsonData = jsonContentType && jsonContentType.includes('application/json')
    ? await jsonResponse.json()
    : { status: jsonResponse.ok ? 'success' : 'error' };

  if (!jsonResponse.ok) {
    const message = (jsonData as { message?: string })?.message || 'فشل تحديث موافقة السياسات';
    throw new Error(message);
  }

  return jsonData as PolicyAcceptanceResponse;
};
