// form.test.ts
import { reactive, watch } from "vue";
import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import Form from "./form.vue"; // 根据你实际路径调整

(globalThis as any).uni = {
  showToast: vi.fn(),
  navigateTo: vi.fn()
  // 根据你用到的 uni 方法继续 mock
};

describe("Form.vue", () => {
  it("renders correctly", () => {
    const wrapper = mount(Form);
    expect(wrapper.exists()).toBe(true);
  });

  describe("Form.vue", () => {
    it("initializes with default values", () => {
      const wrapper = mount(Form);

      // 假设这些值是默认的
      expect(Number(wrapper.vm.formData.fourColorInit)).toBeGreaterThan(0);
      expect(Number(wrapper.vm.formData.fourColorSingle)).toBeGreaterThan(0);
      expect(Number(wrapper.vm.formData.numberOfSheets)).toBeGreaterThan(0);
    });
  });

  it("computes ClientPrice after submit", async () => {
    const wrapper = mount(Form);
    await wrapper.find('input[placeholder="请输入纸张数量"]').setValue("1000");
    await wrapper.find('input[placeholder="请输入纸张开数"]').setValue("2");
    await wrapper.find("button").trigger("submit");

    // 结果区域应该渲染了报价
    expect(wrapper.text()).toMatch(/报价ClientPrice：/);
  });
});
