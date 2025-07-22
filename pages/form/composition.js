export function calculateBestImposition(
  productWidth,
  productHeight,
  productTotalCount = 1,
  bleed = 0,
  bigPaperPrice = 0,
  standardPaperPrice = 0
) {
  // 52机大规纸张
  const bigPaperSizes = [
    {
      label: "5开",
      printSizes: [[360, 490]],
      sheetSizes: ["370×502"]
    },
    {
      label: "6开",
      printSizes: [[360, 430]],
      sheetSizes: ["370×440"]
    },
    {
      label: "8开",
      printSizes: [[285, 430]],
      sheetSizes: ["295×440"]
    },
    {
      label: "9开",
      printSizes: [
        [284, 384],
        [237, 430],
        [210, 470]
      ],
      sheetSizes: ["294×394", "247×440", "220×480"]
    },
    {
      label: "10开",
      printSizes: [
        [226, 430],
        [284, 287],
        [260, 330]
      ],
      sheetSizes: ["236×440", "294×297", "270×340"]
    }
  ];

  // 52机标规纸张
  const standardPaperSizes = [
    {
      label: "5开",
      printSizes: [[320, 440]],
      sheetSizes: ["330×450"]
    },
    {
      label: "6开",
      printSizes: [[350, 380]],
      sheetSizes: ["360×390"]
    },
    {
      label: "7开",
      printSizes: [[250, 400]],
      sheetSizes: ["260×410"]
    },
    {
      label: "8开",
      printSizes: [[260, 380]],
      sheetSizes: ["270×390"]
    },
    {
      label: "9开",
      printSizes: [
        [250, 350],
        [220, 380],
        [185, 435]
      ],
      sheetSizes: ["260×360", "230×390", "195×445"]
    },
    {
      label: "10开",
      printSizes: [
        [206, 380],
        [250, 270],
        [220, 310]
      ],
      sheetSizes: ["216×390", "260×280", "230×320"]
    }
  ];

  const allGroups = [
    { name: "52机大规纸张", data: bigPaperSizes },
    { name: "52机标规纸张", data: standardPaperSizes }
  ];

  const options = [];

  // 加上出血
  const bleedWidth = productWidth + bleed;
  const bleedHeight = productHeight + bleed;

  for (const group of allGroups) {
    for (const { label, printSizes, sheetSizes } of group.data) {
      const sheetFactor = parseInt(label); // 5开 → 5
      for (let idx = 0; idx < printSizes.length; idx++) {
        const [pw, ph] = printSizes[idx];
        // 计算三种排版方式：横向、纵向、横纵混合
        // 横向排布（横x竖）
        let countH = Math.floor(pw / bleedWidth) * Math.floor(ph / bleedHeight);
        let remainingWidthH = pw % bleedWidth;
        let remainingHeightH = ph % bleedHeight;
        if (remainingWidthH >= bleedWidth || remainingHeightH >= bleedHeight) {
          countH += 1;
        }

        // 纵向排布（竖x横）
        let countV = Math.floor(pw / bleedHeight) * Math.floor(ph / bleedWidth);
        let remainingWidthV = pw % bleedHeight;
        let remainingHeightV = ph % bleedWidth;
        if (remainingWidthV >= bleedHeight || remainingHeightV >= bleedWidth) {
          countV += 1;
        }

        // 横纵混合（横+竖），例如：先按 bleedWidth 排，再用余下空间排 bleedHeight
        let countMix = 0;
        const colsH = Math.floor(pw / bleedWidth);
        const rowsH = Math.floor(ph / bleedHeight);
        const usedHeightH = rowsH * bleedHeight;
        const remainingHeight = ph - usedHeightH;
        countMix = colsH * rowsH;
        const extraRows = Math.floor(remainingHeight / bleedWidth);
        const extraCols = Math.floor(pw / bleedHeight);
        if (extraRows > 0 && extraCols > 0) {
          countMix += extraRows * extraCols;
        } else if (
          (pw - colsH * bleedWidth >= bleedHeight && ph >= bleedWidth) ||
          (ph - rowsH * bleedHeight >= bleedWidth && pw >= bleedHeight)
        ) {
          countMix += 1;
        }

        const maxCount = Math.max(countH, countV, countMix);

        if (maxCount === 0) continue;

        const blankArea = pw * ph - bleedWidth * bleedHeight * maxCount;
        const totalCountPerOriginalSheet = maxCount * sheetFactor;
        const requiredSheets = Math.ceil(
          productTotalCount / totalCountPerOriginalSheet
        );
        const fullSheetCount = Math.ceil(requiredSheets / sheetFactor);

        const unitPrice =
          group.name === "52机大规纸张" ? bigPaperPrice : standardPaperPrice;

        const printCost = fullSheetCount * unitPrice;

        // 计算剩余宽高
        let remainingW = 0;
        let remainingH = 0;
        let layoutType = "";
        if (maxCount === countH) {
          remainingW = pw % bleedWidth;
          remainingH = ph % bleedHeight;
          layoutType = "横向排布";
        } else if (maxCount === countV) {
          remainingW = pw % bleedHeight;
          remainingH = ph % bleedWidth;
          layoutType = "纵向排布";
        } else {
          remainingW = pw % bleedWidth;
          remainingH = remainingHeight;
          layoutType = "横纵混合排布";
        }

        options.push({
          kai: label,
          bestCount: maxCount,
          bestSheet: sheetSizes[idx] || sheetSizes[0],
          machineType: `${group.name} ${label}`,
          requiredSheets,
          fullSheetCount,
          blankArea,
          countPerSheet: totalCountPerOriginalSheet,
          printCost,
          paperPrice: unitPrice,
          remainingWidth: remainingW,
          remainingHeight: remainingH,
          layoutType
        });
      }
    }
  }

  if (options.length === 0) {
    return [
      {
        bestCount: 0,
        bestSheet: "尺寸过大，没有匹配",
        machineType: "尺寸过大，没有匹配",
        requiredSheets: 0,
        blankArea: Infinity,
        countPerSheet: 0,
        printCost: 0
      }
    ];
  }

  // 按印刷成本排序
  return options.sort((a, b) => {
    return a.printCost - b.printCost;
  });
}
