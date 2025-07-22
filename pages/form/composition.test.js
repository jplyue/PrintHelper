import { describe, it, expect } from "vitest";
import { calculateBestImposition } from "./composition";

describe("calculateBestImposition", () => {
  it("should return a result with bestCount > 0 for common size", () => {
    const { bestCount, bestSheet, machineType } = calculateBestImposition(
      100,
      100
    );
    expect(bestCount).toBeGreaterThan(0);
    expect(typeof bestSheet).toBe("string");
    expect(typeof machineType).toBe("string");
  });

  it("should handle large product sizes", () => {
    const { bestCount } = calculateBestImposition(500, 700);
    expect(bestCount).toBeGreaterThanOrEqual(0);
  });

  it("should detect offset layout when beneficial", () => {
    const result = calculateBestImposition(260, 280);
    expect(result.bestCount).toBeGreaterThan(0);
    expect(result.machineType).toMatch(/52机/);
  });

  it("should return a known machine type and sheet format", () => {
    const result = calculateBestImposition(300, 400);
    expect(result.machineType).toMatch(/52机/);
    expect(result.bestSheet).toMatch(/×/);
  });

  it("should consider both 52机大规纸张 and 52机标规纸张 types", () => {
    const allPrintSizes = [
      // 52机大规纸张
      { type: "big", label: "5开", size: [360, 490] },
      { type: "big", label: "6开", size: [360, 430] },
      { type: "big", label: "8开", size: [285, 430] },
      { type: "big", label: "9开", size: [284, 384] },
      { type: "big", label: "9开", size: [237, 430] },
      { type: "big", label: "9开", size: [210, 470] },
      { type: "big", label: "10开", size: [226, 430] },
      { type: "big", label: "10开", size: [284, 287] },
      { type: "big", label: "10开", size: [260, 330] },

      // 52机标规纸张
      { type: "standard", label: "5开", size: [320, 440] },
      { type: "standard", label: "6开", size: [350, 380] },
      { type: "standard", label: "7开", size: [250, 400] },
      { type: "standard", label: "8开", size: [260, 380] },
      { type: "standard", label: "9开", size: [250, 350] },
      { type: "standard", label: "9开", size: [220, 380] },
      { type: "standard", label: "9开", size: [185, 435] },
      { type: "standard", label: "10开", size: [206, 380] },
      { type: "standard", label: "10开", size: [250, 270] },
      { type: "standard", label: "10开", size: [220, 310] }
    ];

    allPrintSizes.forEach(({ type, label, size }) => {
      const [w, h] = size;
      const key = `${w}x${h}`;
      const expectedMachineType =
        type === "big" ? "52机大规纸张" : "52机标规纸张";
      const expectedOpen = label.replace("开", "");

      const { bestCount, bestSheet, machineType } = calculateBestImposition(
        w,
        h
      );
      console.log(`Product ${key} -> ${bestCount}-${bestSheet}-${machineType}`);
      expect(machineType).toContain(expectedMachineType);
      expect(machineType).toMatch(new RegExp(`${expectedOpen}开`));
    });
  });
});

it("should return fallback machine type and sheet when no layout possible", () => {
  const result = calculateBestImposition(2000, 2000); // 非常大的尺寸，无法拼版
  expect(result).toEqual({
    bestCount: 0,
    bestSheet: "尺寸过大，没有匹配",
    machineType: "尺寸过大，没有匹配"
  });
});

it.only("should calculate correct totalCost for given product size and bleed", () => {
  const productWidth = 37;
  const productHeight = 22;
  const bleed = 3;
  const bigPaperPrice = 1.56;
  const standardPaperPrice = 1.21;
  const productCount = 1000;

  const results = calculateBestImposition(productWidth, productHeight, bleed);

  const costedResults = results.map(opt => {
    const numberOfSheets = Math.ceil(productCount / opt.bestCount);
    const paperPrice = opt.machineType.includes("大规")
      ? bigPaperPrice
      : standardPaperPrice;
    const totalCost = numberOfSheets * paperPrice;
    return { ...opt, numberOfSheets, paperPrice, totalCost };
  });

  // 检查至少一个结果是存在的
  expect(costedResults.length).toBeGreaterThan(1);
  costedResults.forEach(opt => {
    expect(typeof opt.bestSheet).toBe("string");
    expect(typeof opt.machineType).toBe("string");
    expect(opt.totalCost).toBeGreaterThan(0);
  });
});
