import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to re-stub useState for these tests since composables use the real one
vi.stubGlobal("useState", (key, init) => {
  return { value: init ? init() : undefined };
});

describe("Composables", () => {
  describe("states.ts", () => {
    let states;

    beforeEach(async () => {
      states = await import("../app/composables/states.ts");
    });

    it("useCounter returns ref with initial value 0", () => {
      const counter = states.useCounter();
      expect(counter.value).toBe(0);
    });

    it("useColor returns ref with initial value pink", () => {
      const color = states.useColor();
      expect(color.value).toBe("pink");
    });

    it("useNavToggle returns ref with initial value false", () => {
      const toggle = states.useNavToggle();
      expect(toggle.value).toBe(false);
    });

    it("useSimpleCounter accepts custom initial value", () => {
      const counter = states.useSimpleCounter(42);
      expect(counter.value).toBe(42);
    });

    it("useTranslateToggle returns ref with initial value false", () => {
      const toggle = states.useTranslateToggle();
      expect(toggle.value).toBe(false);
    });
  });
});
