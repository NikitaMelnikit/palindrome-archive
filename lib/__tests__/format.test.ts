import { describe, expect, it } from "vitest";
import {
  buildIdentifier,
  formatAccession,
  formatCoordinates,
  formatDate,
  formatDateArchival,
  formatDt,
  isPalindrome,
  mirrorCode,
} from "@/lib/format";

describe("formatting", () => {
  it("formats dates without locale or time-zone dependence", () => {
    expect(formatDate("2026-09-22")).toBe("22 SEP 2026");
    expect(formatDate("2019-03-04T23:59:00Z")).toBe("04 MAR 2019");
    expect(formatDateArchival("2113-09-22")).toBe("22 · IX · 2113");
  });

  it("formats accession numbers and temporal offsets", () => {
    expect(formatAccession(7)).toBe("007");
    expect(formatDt(87)).toBe("+087y");
    expect(formatDt(-75)).toBe("−075y");
    expect(formatDt(0)).toBe("±000y");
  });

  it("formats archive coordinates", () => {
    expect(formatCoordinates({ psi: 0.412, lambda: 4.31, dt: 87 })).toBe("ψ 0.412 · λ 04.31 · Δt +087y");
  });
});

describe("identifiers", () => {
  it("builds palindromic identifiers", () => {
    expect(buildIdentifier("OB", 21)).toBe("OB-2112-BO");
    expect(buildIdentifier("PL", 10)).toBe("PL-1001-LP");
    expect(buildIdentifier("LT", 1)).toBe("LT-0110-TL");
    for (const code of ["OB", "PL", "EV", "SG", "DC", "LT"]) {
      for (let n = 1; n <= 99; n++) expect(isPalindrome(buildIdentifier(code, n))).toBe(true);
    }
  });

  it("mirrors codes and detects palindromes", () => {
    expect(mirrorCode("SG")).toBe("GS");
    expect(isPalindrome("404")).toBe(true);
    expect(isPalindrome("405")).toBe(false);
  });
});
