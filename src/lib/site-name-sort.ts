/** Leading "12. Site name" → 12; otherwise null. */
export function leadingIndexFromSiteName(name: string): number | null {
  const m = /^\s*(\d+)\s*\./.exec(name);
  return m ? Number(m[1]) : null;
}

/** Sort by leading index (1., 2., … 10.) then by name. */
export function compareSiteNamesNatural(a: string, b: string): number {
  const na = leadingIndexFromSiteName(a);
  const nb = leadingIndexFromSiteName(b);
  if (na !== null && nb !== null && na !== nb) {
    return na - nb;
  }
  if (na !== null && nb === null) {
    return -1;
  }
  if (na === null && nb !== null) {
    return 1;
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function sortSitesByDisplayName<T extends { name: string }>(sites: T[]): T[] {
  return [...sites].sort((a, b) => compareSiteNamesNatural(a.name, b.name));
}
