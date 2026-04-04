export const getFriendlyError = (err) => {
  const msg = err?.message || String(err) || "An unknown error occurred.";
  
  if (msg.includes('Unexpected token') || msg.includes('JSON')) {
    return 'The AI returned an invalid format. Please try generating again.';
  }
  if (msg.includes('Failed to fetch')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  if (msg.toLowerCase().includes('rate limit')) {
    return 'You are generating too fast! Please wait a moment and try again.';
  }
  if (msg.includes('AI returned unexpected format')) {
    return 'The AI got confused by the content. Try adjusting your prompt or adding more details.';
  }
  if (msg.includes('Failed to parse file:')) {
    if (msg.includes('mammoth') || msg.includes('pdf')) {
      return 'We had trouble reading this file. Please make sure it is a standard text document.';
    }
    return 'There was an issue parsing your file. Please check for unusual formatting or save as plain text.';
  }
  
  // Clean up ugly backend prefixes
  let cleaned = msg
    .replace('AI generation failed: ', '')
    .replace('Regeneration failed: ', '')
    .replace('Failed to parse file: ', '');
  
  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};
