/**
 * Maps sales-offer font dropdown value to CSS for PDF (SalesOffer) and form preview.
 *
 * Helvetica Neue Light / Ultra Light: prefer @font-face names in globals.css
 * ("Helvetica Neue Light", "Helvetica Neue Ultra Light"). Those faces are already
 * the correct weight — use fontWeight 400, not 100/300 (avoids faux-bold and
 * wrong fallbacks). Inter + sans-serif stack follows if .otf fails to load.
 */
export function resolvePdfTypography(rawFont) {
  const name = (rawFont ?? "").trim();
  const key = name.toLowerCase().replace(/\s+/g, " ");

  if (!name) {
    return {
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontWeight: undefined,
    };
  }

  const sansFallback =
    'Inter, "Helvetica Neue", "Helvetica Neue LT Pro", Helvetica, Arial, sans-serif';

  // Match dropdown + @font-face naming (with/without space before "Light")
  if (
    key === "helvetica neue ultralight" ||
    key === "helvetica neue ultra light"
  ) {
    return {
      fontFamily: `"Helvetica Neue Ultra Light", ${sansFallback}`,
      fontWeight: 400,
    };
  }
  if (key === "helvetica neue light") {
    return {
      fontFamily: `"Helvetica Neue Light", ${sansFallback}`,
      fontWeight: 400,
    };
  }
  if (key === "proxima nova light") {
    return {
      fontFamily: `"Proxima Nova Light", ${sansFallback}`,
      fontWeight: 400,
    };
  }
  if (key === "marlide display regular") {
    return {
      fontFamily: `"Marlide Display Regular", ${sansFallback}`,
      fontWeight: 400,
    };
  }

  return {
    fontFamily: `"${name.replace(/"/g, "")}", ui-sans-serif, system-ui, sans-serif`,
    fontWeight: undefined,
  };
}
