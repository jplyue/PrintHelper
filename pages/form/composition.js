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
        let bestOption = null;

        const tryOrientations = [
          { pw: pw, ph: ph, rotated: false },
          { pw: ph, ph: pw, rotated: true }
        ];

        for (const { pw: currPw, ph: currPh, rotated } of tryOrientations) {
          // 横向排布
          let countHMain =
            Math.floor(currPw / bleedWidth) * Math.floor(currPh / bleedHeight);
          let remainW_H = currPw % bleedWidth;
          let extraH =
            Math.floor(remainW_H / bleedHeight) *
            Math.floor(currPh / bleedWidth);
          let countH = countHMain + extraH;

          // 纵向排布
          let countVMain =
            Math.floor(currPw / bleedHeight) * Math.floor(currPh / bleedWidth);
          let remainW_V = currPw % bleedHeight;
          let extraV =
            Math.floor(remainW_V / bleedWidth) *
            Math.floor(currPh / bleedHeight);
          let countV = countVMain + extraV;

          // 横纵混合排布
          let countMix = 0;
          const colsH = Math.floor(currPw / bleedWidth);
          const rowsH = Math.floor(currPh / bleedHeight);
          const usedHeightH = rowsH * bleedHeight;
          const remainingHeight = currPh - usedHeightH;
          countMix = colsH * rowsH;
          const extraRows = Math.floor(remainingHeight / bleedWidth);
          const extraCols = Math.floor(currPw / bleedHeight);
          if (extraRows > 0 && extraCols > 0) {
            countMix += extraRows * extraCols;
          }

          const maxCount = Math.max(countH, countV, countMix);
          if (maxCount === 0) continue;

          const blankArea =
            currPw * currPh - bleedWidth * bleedHeight * maxCount;
          const totalCountPerOriginalSheet = maxCount * sheetFactor;
          const requiredSheets = Math.ceil(
            productTotalCount / totalCountPerOriginalSheet
          );
          const fullSheetCount = Math.ceil(requiredSheets / sheetFactor);

          const unitPrice =
            group.name === "52机大规纸张" ? bigPaperPrice : standardPaperPrice;
          const printCost = fullSheetCount * unitPrice;

          let remainingW = 0;
          let remainingH = 0;
          let layoutType = "";

          if (maxCount === countH) {
            remainingW = currPw % bleedWidth;
            remainingH = currPh % bleedHeight;
            layoutType = rotated ? "横向排布（旋转）" : "横向排布（原始）";
          } else if (maxCount === countV) {
            remainingW = currPw % bleedHeight;
            remainingH = currPh % bleedWidth;
            layoutType = rotated ? "纵向排布（旋转）" : "纵向排布（原始）";
          } else {
            remainingW = currPw % bleedWidth;
            remainingH = remainingHeight;
            layoutType = rotated
              ? "横纵混合排布（旋转）"
              : "横纵混合排布（原始）";
          }

          const candidateOption = {
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
          };

          if (!bestOption || candidateOption.bestCount > bestOption.bestCount) {
            bestOption = candidateOption;
          }
        }

        if (bestOption) {
          options.push(bestOption);
        }
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
