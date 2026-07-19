export function compareFingerprints(
  fingerprintA: string,
  fingerprintB: string
): number {
  const minLength = Math.min(fingerprintA.length, fingerprintB.length);

  if (minLength === 0) {
    return 0;
  }

  let matches = 0;

  for (let i = 0; i < minLength; i++) {
    if (fingerprintA[i] === fingerprintB[i]) {
      matches++;
    }
  }

  return matches / minLength;
}