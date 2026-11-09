// Stable backend error codes -> translation keys.
// The API returns `{ detail, code }` so the UI never has to display server-side
// English: the code is mapped onto a translated message in the active language.
export const API_ERROR_KEYS = {
  invalid_email: 'apiErrorInvalidEmail',
  department_required: 'apiErrorDepartmentRequired',
  department_not_found: 'apiErrorDepartmentNotFound',
  patient_not_found: 'apiErrorPatientNotFound',
  name_required: 'apiErrorNameRequired',
  duplicate_ticket: 'apiErrorDuplicateTicket',
  no_waiting_patients: 'apiErrorNoWaitingPatients',
  only_waiting_can_be_called: 'apiErrorOnlyWaitingCanBeCalled',
  only_waiting_can_be_started: 'apiErrorOnlyWaitingCanBeStarted',
  ticket_closed: 'apiErrorTicketClosed',
  ticket_not_cancellable: 'apiErrorTicketNotCancellable',
  invalid_booking_details: 'apiErrorInvalidBookingDetails',
};

export const apiErrorKey = (code) => (code ? API_ERROR_KEYS[code] || null : null);

// Best translation key for an axios error: the backend's stable code wins,
// otherwise the caller's fallback key is used.
export const errorKeyFromResponse = (error, fallbackKey) =>
  apiErrorKey(error?.response?.data?.code) || fallbackKey;

// Interpolation params that belong to an error payload (e.g. the duplicate ticket).
export const apiErrorParams = (data) => (data?.ticket ? { ticket: data.ticket } : undefined);
