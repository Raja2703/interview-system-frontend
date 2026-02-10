export const getErrorMessage = (error: any) => {
  // 1. Check if it's a standard API error response
  const details = error?.response?.data?.details;

  if (details) {
    // If 'details' is an object (like your screenshot), loop through its keys
    // e.g. keys might be "common", "interviewer", "interviewee"
    for (const stepKey in details) {
      const stepErrors = details[stepKey];

      // Case A: The step error is just a string (e.g., interviewee: "This step is required")
      if (typeof stepErrors === "string") {
        return `${stepKey}: ${stepErrors}`;
      }

      // Case B: The step error is an object of fields (e.g., common: { bio: ["Too short"] })
      if (typeof stepErrors === "object" && stepErrors !== null) {
        for (const fieldKey in stepErrors) {
          const fieldError = stepErrors[fieldKey];

          // If it's an array of messages (Django/DRF style), take the first one
          if (Array.isArray(fieldError)) {
            return `${fieldKey}: ${fieldError[0]}`;
          }
          // If it's a single string
          if (typeof fieldError === "string") {
            return `${fieldKey}: ${fieldError}`;
          }
        }
      }
    }
  }

  // 2. Fallback to generic error message from backend
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  // 3. Fallback to standard Axios error message
  return error.message || "An unexpected error occurred";
};