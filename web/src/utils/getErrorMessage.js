// Server error responses come in two shapes depending on where they
// originate: a route's own deliberate response is flat ({ error: 'string' }),
// but an error that falls through uncaught (e.g. a Multer file-size limit)
// lands in the global error handler instead, whose shape is nested
// ({ error: { message, type } }). Passing the wrong shape straight into
// toast.error() renders a raw object as text and crashes the page (React
// throws "Objects are not valid as a React child") — this always returns a
// plain string instead, whichever shape the response actually used.
export function getErrorMessage(error, fallback = 'Something went wrong') {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data.error === 'string') return data.error;
  if (data.error && typeof data.error.message === 'string') return data.error.message;
  if (typeof data.message === 'string') return data.message;
  return fallback;
}
