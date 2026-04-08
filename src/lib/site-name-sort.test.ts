import { describe, expect, it } from "vitest";

import {
  compareSiteNamesNatural,
  leadingIndexFromSiteName,
  sortSitesByDisplayName,
} from "@/lib/site-name-sort";

describe("leadingIndexFromSiteName", () => {
  it("parses leading number before dot", () => {
    expect(leadingIndexFromSiteName("1. Alpha")).toBe(1);
    expect(leadingIndexFromSiteName("  12. Site name")).toBe(12);
  });

  it("returns null when no leading index", () => {
    expect(leadingIndexFromSiteName("Alpha")).toBeNull();
    expect(leadingIndexFromSiteName("1x. No")).toBeNull();
  });
});

describe("compareSiteNamesNatural", () => {
  it("orders numeric prefixes before lexicographic string-only", () => {
    expect(compareSiteNamesNatural("2. B", "10. A")).toBeLessThan(0);
    expect(compareSiteNamesNatural("1. A", "2. B")).toBeLessThan(0);
  });

  it("uses localeCompare with numeric for unindexed names", () => {
    expect(compareSiteNamesNatural("site2", "site10")).toBeLessThan(0);
  });
});

describe("sortSitesByDisplayName", () => {
  it("returns a new sorted array without mutating original", () => {
    const sites = [{ name: "2. Second" }, { name: "1. First" }, { name: "Zoo" }];
    const sorted = sortSitesByDisplayName(sites);
    expect(sorted.map((s) => s.name)).toEqual(["1. First", "2. Second", "Zoo"]);
    expect(sites[0].name).toBe("2. Second");
  });
});
