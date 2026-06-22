import { calculateRank, getRankProgress } from "./rankCalculator";

describe("rankCalculator", () => {
  it("calculates basic rank", () => {
    expect(calculateRank(0)).toBe("MIEMBRO_BASICO");
    expect(calculateRank(49)).toBe("MIEMBRO_BASICO");
  });

  it("calculates middle rank", () => {
    expect(calculateRank(50)).toBe("MIEMBRO_CUSQUISPE");
    expect(calculateRank(199)).toBe("MIEMBRO_CUSQUISPE");
  });

  it("calculates top rank", () => {
    expect(calculateRank(200)).toBe("MIEMBRO_MILAR_CUSQUISPE");
  });

  it("returns progress to next rank", () => {
    expect(getRankProgress(10)).toMatchObject({
      rank: "MIEMBRO_BASICO",
      nextRank: "MIEMBRO_CUSQUISPE",
      pointsToNext: 40,
      progressPercent: 20,
    });
  });
});
