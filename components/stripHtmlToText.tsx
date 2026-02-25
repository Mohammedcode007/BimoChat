
/**
 * Strip HTML tags safely and return plain text.
 * - Removes <script> and <style>
 * - Converts <br> and </p> to line breaks
 * - Removes remaining tags
 * - Decodes basic HTML entities
 */
export const stripHtmlToText = (input: string): string => {
  const s = String(input || "");

  // Remove <script> blocks
  const noScripts = s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");

  // Remove <style> blocks
  const noStyles = noScripts.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");

  // Convert <br> and </p> to new lines
  const withBreaks = noStyles
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n");

  // Remove all remaining HTML tags
  const textOnly = withBreaks.replace(/<[^>]+>/g, "");

  // Decode basic HTML entities
  return textOnly
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
};