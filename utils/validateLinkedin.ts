const isValidLinkedInProfile = (url: string) => {
  try {
    const parsed = new URL(url);

    // Allow linkedin.com or www.linkedin.com
    const isLinkedIn =
      parsed.hostname === "linkedin.com" ||
      parsed.hostname === "www.linkedin.com";

    // Must be a profile URL
    const isProfile = parsed.pathname.startsWith("/in/");

    return isLinkedIn && isProfile;
  } catch {
    return false;
  }
};

export default isValidLinkedInProfile;