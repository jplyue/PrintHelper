<template>
  <view class="container">
    <form @submit="handleSubmit">
      <view class="section-title">商家设定</view>
      <view class="form-item input-group">
        <view style="flex: 1">
          <text class="label">四色起步价：</text>
          <input
            class="input"
            v-model="formData.fourColorInit"
            placeholder="请输入起步价"
          />
        </view>
        <view style="flex: 1; margin-left: 30rpx">
          <text class="label">四色单价：</text>
          <input
            class="input"
            v-model="formData.fourColorSingle"
            placeholder="请输入单价"
          />
        </view>
      </view>
      <view class="form-item input-group">
        <view style="flex: 1">
          <text class="label">黑色起步价：</text>
          <input
            class="input"
            v-model="formData.blackInit"
            placeholder="请输入起步价"
          />
        </view>
        <view style="flex: 1; margin-left: 30rpx">
          <text class="label">黑色单价：</text>
          <input
            class="input"
            v-model="formData.blackSingle"
            placeholder="请输入单价"
          />
        </view>
      </view>
      <view class="form-item input-group">
        <view style="flex: 1">
          <text class="label">大规纸张单价：</text>
          <input
            class="input"
            v-model="formData.bigPaperPrice"
            placeholder="请输入大规纸张价格"
          />
        </view>
        <view style="flex: 1; margin-left: 30rpx">
          <text class="label">标规纸张单价：</text>
          <input
            class="input"
            v-model="formData.standardPaperPrice"
            placeholder="请输入标规纸张价格"
          />
        </view>
      </view>

      <view class="form-item">
        <text class="label">运费：</text>
        {{ formData.shippingFee }}
      </view>

      <view class="form-item">
        <text class="label">人工：</text>
        <input
          class="input"
          v-model="formData.labourCost"
          placeholder="请输入人工费用"
        />
      </view>

      <view class="form-item">
        <text class="label">打样：</text>
        <input
          class="input"
          v-model="formData.exampleFee"
          placeholder="请输入打样费用"
        />
      </view>

      <view class="section-title">用户设定</view>
      <view class="form-item">
        <text class="label">颜色选择：</text>
        <radio-group @change="onColorChange">
          <label>
            <radio value="四色" :checked="formData.colorType === '四色'" />
            四色
          </label>
          <label style="margin-left: 30rpx">
            <radio value="黑色" :checked="formData.colorType === '黑色'" /> 黑色
          </label>
        </radio-group>
      </view>
      <view class="form-item">
        <text class="label">成品宽度：</text>
        <input
          class="input"
          v-model="formData.productWidth"
          placeholder="请输入成品宽度"
        />
      </view>
      <view class="form-item">
        <text class="label">成品高度：</text>
        <input
          class="input"
          v-model="formData.productHeight"
          placeholder="请输入成品高度"
        />
      </view>
      <view class="form-item">
        <text class="label">成品数量：</text>
        <input
          class="input"
          v-model="formData.productCount"
          placeholder="请输入成品数量"
        />
      </view>
      <view class="form-item">
        <text class="label">出血(mm)：</text>
        <input
          class="input"
          v-model="formData.bleed"
          placeholder="请输入出血尺寸"
        />
      </view>
      <!-- <view class="form-item">
        <text class="label">起步价：</text>
        <view>
          <span class="label-price">{{ formData.beginPrice }}</span>
        </view>
      </view>
      <view class="form-item">
        <text class="label">单价：</text>
        <view>
          <span class="label-price">{{ formData.singlePrice }}</span>
        </view>
      </view> -->

      <view class="form-item">
        <text class="label">备注：</text>
        <textarea
          class="textarea"
          v-model="formData.note"
          placeholder="请输入备注"
        ></textarea>
      </view>

      <button form-type="submit" type="primary">提交参数显示报价</button>

      <view class="result-block">
        <view class="form-item" style="margin-bottom: 20rpx">
          成品尺寸：{{ formData.productWidth }}mm ×
          {{ formData.productHeight }}mm
        </view>
        <view class="form-item">
          <text class="label">纸张单价：</text>
          <view>
            大规纸张：{{ formData.bigPaperPrice }} 元，标规纸张：{{
              formData.standardPaperPrice
            }}
            元
          </view>
        </view>

        <view>
          <view class="form-item section-title">综合纸张结果</view>
          <view class="table">
            <view class="table-header table-row">
              <view class="table-cell">序号</view>
              <view class="table-cell">纸张类型</view>
              <view class="table-cell">开数</view>
              <view class="table-cell">拼数</view>
              <view class="table-cell">小张纸数量</view>
              <view class="table-cell">全开纸数量</view>
              <view class="table-cell">排版方向</view>
              <view class="table-cell">剩余长x宽</view>
              <view class="table-cell">纸张价格</view>
              <view class="table-cell">价格</view>
            </view>
            <view
              class="table-row"
              v-for="(option, index) in sortedMergedResults"
              :key="'combined-' + index"
            >
              <view class="table-cell">{{ index + 1 }}</view>
              <view class="table-cell">{{ option.machineType }}</view>
              <view class="table-cell">{{ option.kai }}</view>
              <view class="table-cell">{{ option.bestCount }}</view>
              <view class="table-cell">
                {{ Math.ceil(formData.productCount / option.bestCount) }}
              </view>
              <view class="table-cell">
                {{
                  Math.ceil(
                    Math.ceil(formData.productCount / option.bestCount) /
                      parseInt(option.kai)
                  )
                }}
              </view>
              <view class="table-cell">{{ option.layoutType || "" }}</view>
              <view class="table-cell"
                >{{ option.remainingHeight }}x{{ option.remainingWidth }}</view
              >
              <view class="table-cell">{{ option.printCost?.toFixed(2) }}</view>
              <view class="table-cell">{{ option.productionCost }}</view>
            </view>
          </view>
        </view>
      </view>
    </form>
  </view>
</template>

<script setup>
import { reactive, watch, computed } from "vue";
import "./form.css";
import { calculateBestImposition } from "./composition";

const defaultData = {
  colorType: "四色",
  blackInit: "100",
  blackSingle: "0.03",
  fourColorInit: "200",
  fourColorSingle: "0.05"
};

const formData = reactive({
  colorType: defaultData.colorType,
  fourColorInit: defaultData.fourColorInit,
  fourColorSingle: defaultData.fourColorSingle,
  blackInit: defaultData.blackInit,
  blackSingle: defaultData.blackSingle,
  beginPrice: defaultData.fourColorInit,
  singlePrice: defaultData.fourColorSingle,
  impositionSize: "",
  bigPaperPrice: "1.56",
  standardPaperPrice: "1.21",
  shippingFee: "0",
  labourCost: "2000",
  exampleFee: "1000",
  numberOfSheets: "0",
  note: "",
  sheetSize: "",
  impositionCount: "",
  productionCost: "",
  pricesExcludetax: "",
  ClientPrice: "",
  productWidth: "22",
  productHeight: "37",
  machineType: "",
  productCount: "2000",
  bleed: "3",
  resultOptions: []
});

watch(
  () => formData.productCount,
  newCount => {
    formData.shippingFee = getE(Number(newCount));
  }
);

// 监听 fourColorInit, fourColorSingle, blackInit, blackSingle, colorType 的变化，动态更新 a, b
watch(
  () => [
    formData.fourColorInit,
    formData.fourColorSingle,
    formData.blackInit,
    formData.blackSingle,
    formData.colorType
  ],
  () => {
    if (formData.colorType === "四色") {
      formData.beginPrice = formData.fourColorInit;
      formData.singlePrice = formData.fourColorSingle;
    } else if (formData.colorType === "黑色") {
      formData.beginPrice = formData.blackInit;
      formData.singlePrice = formData.blackSingle;
    }
  }
);

const onColorChange = e => {
  formData.colorType = e.detail.value;

  if (formData.colorType === "四色") {
    formData.beginPrice = formData.fourColorInit;
    formData.singlePrice = formData.fourColorSingle;
  } else if (formData.colorType === "黑色") {
    formData.beginPrice = formData.blackInit;
    formData.singlePrice = formData.blackSingle;
  }
};

/**
 * 计算生产成本
 * @param {Object} params
 * @param {number} productCount - 最终成品数量（非纸张数量）
 * @param {number} beginPrice
 * @param {number} singlePrice
 * @param {number} impositionSize
 * @param {number} paperPrice
 * @param {number} shippingFee
 * @param {number} labourCost
 * @param {number} exampleFee
 */
function calculateProductionCost({
  productCount, // 最终成品数量（非纸张数量）
  beginPrice,
  singlePrice,
  impositionSize,
  paperPrice,
  shippingFee,
  labourCost,
  exampleFee
}) {
  let cost = 0;
  if (productCount >= 1000) {
    //(productCount / impositionSize) * paperPrice
    cost =
      ((productCount - 1000) * singlePrice +
        beginPrice +
        paperPrice +
        shippingFee +
        labourCost +
        exampleFee) *
      1.05;
  } else {
    cost =
      (beginPrice + paperPrice + shippingFee + labourCost + exampleFee) * 1.05;
  }
  return Math.ceil(cost * 100) / 100;
}

const handleSubmit = () => {
  const productWidth = Number(formData.productWidth || 0);
  const productHeight = Number(formData.productHeight || 0);
  const bleed = Number(formData.bleed || 0);
  const bigPaperPrice = Number(formData.bigPaperPrice || 0);
  const standardPaperPrice = Number(formData.standardPaperPrice || 0);
  const productCount = Number(formData.productCount || 0);

  const bestOptions = calculateBestImposition(
    productWidth,
    productHeight,
    productCount,
    bleed,
    bigPaperPrice,
    standardPaperPrice
  );

  formData.resultOptions = bestOptions.map(opt => {
    const countPerFullSheet = opt.bestCount * parseInt(opt.kai);
    const numberOfSheets = Math.ceil(productCount / countPerFullSheet);
    const productionCost = calculateProductionCost({
      productCount: productCount,
      beginPrice: Number(formData.beginPrice),
      singlePrice: Number(formData.singlePrice),
      impositionSize: parseInt(opt.kai),
      paperPrice: opt.paperPrice,
      shippingFee: Number(formData.shippingFee),
      labourCost: Number(formData.labourCost),
      exampleFee: Number(formData.exampleFee)
    });

    return {
      ...opt,
      numberOfSheets,
      printCost: numberOfSheets * opt.paperPrice,
      productionCost,
      layoutDirection: opt.layoutDirection || "正向排版"
    };
  });

  const cheapest = bestOptions.reduce((prev, curr) =>
    prev.totalCost <= curr.totalCost ? prev : curr
  );
  formData.impositionCount = cheapest.bestCount;
  formData.sheetSize = cheapest.bestSheet;
  formData.machineType = cheapest.machineType;
  formData.numberOfSheets = Math.ceil(productCount / cheapest.bestCount);

  const numberOfSheets = Number(formData.numberOfSheets || 0);
  const beginPrice = Number(formData.beginPrice || 0);
  const singlePrice = Number(formData.singlePrice || 0);
  const impositionSize = Number(formData.impositionSize || 1);
  const paperPrice = cheapest.paperPrice;
  const shippingFee = Number(formData.shippingFee || 0);
  const labourCost = Number(formData.labourCost || 0);
  const exampleFee = Number(formData.exampleFee || 0);

  let A = 0;
  if (numberOfSheets >= 1000) {
    A =
      ((numberOfSheets - 1000) * singlePrice +
        beginPrice +
        (numberOfSheets / impositionSize) * paperPrice +
        shippingFee +
        labourCost +
        exampleFee) *
      1.05;
  } else {
    A =
      (beginPrice +
        (numberOfSheets / impositionSize) * paperPrice +
        shippingFee +
        labourCost +
        exampleFee) *
      1.05;
  }
  let B = A * 1.3;
  let C = B - A < 200 ? (A + 200) * 1.13 : B * 1.13;

  const roundUp2 = num => Math.ceil(num * 100) / 100;

  formData.productionCost = roundUp2(A).toFixed(2);
  formData.pricesExcludetax = roundUp2(B).toFixed(2);
  formData.ClientPrice = roundUp2(C).toFixed(2);

  uni.showToast({
    title: "提交成功",
    icon: "success"
  });
};

function getE(n) {
  if (n <= 1000) return 100;
  if (n <= 2000) return 200;
  if (n <= 4000) return 400;
  if (n <= 10000) return 800;
  if (n > 10000) return 800;
  return 0; // 超过范围默认值
}

const sortedMergedResults = computed(() => {
  return [...formData.resultOptions].sort((a, b) => {
    const getKaiValue = val => {
      const num = parseInt(val);
      return isNaN(num) ? 0 : num;
    };

    // 先按 machineType 分组排序
    const typeA = a.machineType.includes("大规") ? 0 : 1;
    const typeB = b.machineType.includes("大规") ? 0 : 1;
    if (typeA !== typeB) {
      return typeA - typeB;
    }

    // 同一类型下按开数从大到小排序
    return getKaiValue(a.kai) - getKaiValue(b.kai);
  });
});
</script>
