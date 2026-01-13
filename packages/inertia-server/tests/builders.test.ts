import { describe, expect, test } from "bun:test";
import { deepMergedProp, isBuilder, mergedProp, prop } from "../src/builders";
import { BUILDER_STATE } from "../src/types";

describe("prop()", () => {
	test("returns a PropBuilder", () => {
		const builder = prop<string>();
		expect(isBuilder(builder)).toBe(true);
		expect(builder[BUILDER_STATE].type).toBe("prop");
	});

	test("prop().once() returns PropBuilder with once type", () => {
		const builder = prop<string>().once();
		expect(builder[BUILDER_STATE].type).toBe("once");
	});

	test("prop().once() with options stores expiresAt", () => {
		const expiresAt = Date.now() + 3600000;
		const builder = prop<string>().once({ expiresAt });
		expect(builder[BUILDER_STATE].once?.expiresAt).toBe(expiresAt);
	});

	test("prop().deferred() returns DeferredBuilder", () => {
		const builder = prop<string>().deferred();
		expect(builder[BUILDER_STATE].type).toBe("deferred");
		expect(builder[BUILDER_STATE].deferredGroup).toBe("default");
	});

	test("prop().deferred() with custom group", () => {
		const builder = prop<string>().deferred("sidebar");
		expect(builder[BUILDER_STATE].deferredGroup).toBe("sidebar");
	});

	test("prop().optional() returns PropBuilder with isOptional flag", () => {
		const builder = prop<string>().optional();
		expect(builder[BUILDER_STATE].isOptional).toBe(true);
	});

	test("prop().always() returns PropBuilder with isAlways flag", () => {
		const builder = prop<string>().always();
		expect(builder[BUILDER_STATE].isAlways).toBe(true);
	});

	test("prop().once() returns OnceBuilder", () => {
		const builder = prop<string>().once({ expiresAt: 123 });
		const meta = builder[BUILDER_STATE];
		expect(meta.type).toBe("once");
		expect(meta.once?.expiresAt).toBe(123);
	});

	test("prop().once().deferred() chains correctly", () => {
		const builder = prop<string>().once({ expiresAt: 123 }).deferred("sidebar");
		const meta = builder[BUILDER_STATE];
		expect(meta.type).toBe("deferred");
		expect(meta.deferredGroup).toBe("sidebar");
		expect(meta.isDeferredOnce).toBe(true);
	});

	test("prop().always() and optional() are mutually exclusive - last wins", () => {
		const builder1 = prop<string>().optional().always();
		expect(builder1[BUILDER_STATE].isOptional).toBe(true);
		expect(builder1[BUILDER_STATE].isAlways).toBe(true);
	});
});

describe("mergedProp()", () => {
	test("mergedProp() returns MergeBuilder", () => {
		const builder = mergedProp<string[]>();
		expect(builder[BUILDER_STATE].type).toBe("merge");
	});

	test("mergedProp() defaults to append direction", () => {
		const builder = mergedProp<string[]>();
		expect(builder[BUILDER_STATE].mergeDirection).toBe("append");
	});

	test("mergedProp().append() sets append direction", () => {
		const builder = mergedProp<string[]>().append();
		expect(builder[BUILDER_STATE].mergeDirection).toBe("append");
	});

	test("mergedProp().prepend() sets prepend direction", () => {
		const builder = mergedProp<string[]>().prepend();
		expect(builder[BUILDER_STATE].mergeDirection).toBe("prepend");
	});

	test("mergedProp() with matchOn option", () => {
		const builder = mergedProp<{ id: number }[]>({ matchOn: "id" });
		expect(builder[BUILDER_STATE].mergeOptions?.matchOn).toBe("id");
	});

	test("mergedProp().scroll() adds scroll config", () => {
		const builder = mergedProp<string[]>().scroll({ pageName: "page" });
		expect(builder[BUILDER_STATE].scrollOptions?.pageName).toBe("page");
	});

	test("mergedProp() chains multiple modifiers", () => {
		const builder = mergedProp<{ id: number }[]>({ matchOn: "id" })
			.prepend()
			.scroll({ pageName: "p" });

		const meta = builder[BUILDER_STATE];
		expect(meta.mergeDirection).toBe("prepend");
		expect(meta.mergeOptions?.matchOn).toBe("id");
		expect(meta.scrollOptions?.pageName).toBe("p");
	});
});

describe("deepMergedProp()", () => {
	test("deepMergedProp() returns DeepMergeBuilder", () => {
		const builder = deepMergedProp<object>();
		expect(builder[BUILDER_STATE].type).toBe("deepMerge");
	});

	test("deepMergedProp() defaults to append direction", () => {
		const builder = deepMergedProp<object>();
		expect(builder[BUILDER_STATE].mergeDirection).toBe("append");
	});

	test("deepMergedProp().append() sets append direction", () => {
		const builder = deepMergedProp<object>().append();
		expect(builder[BUILDER_STATE].mergeDirection).toBe("append");
	});

	test("deepMergedProp().prepend() sets prepend direction", () => {
		const builder = deepMergedProp<object>().prepend();
		expect(builder[BUILDER_STATE].mergeDirection).toBe("prepend");
	});

	test("deepMergedProp() with matchOn option", () => {
		const builder = deepMergedProp<{ data: { id: number } }>({
			matchOn: "data.id",
		});
		expect(builder[BUILDER_STATE].mergeOptions?.matchOn).toBe("data.id");
	});

	test("deepMergedProp().scroll() adds scroll config", () => {
		const builder = deepMergedProp<object>().scroll({ pageName: "page" });
		expect(builder[BUILDER_STATE].scrollOptions?.pageName).toBe("page");
	});

	test("deepMergedProp() chains multiple modifiers", () => {
		const builder = deepMergedProp<{ data: { id: number } }>({
			matchOn: "data.id",
		})
			.prepend()
			.scroll({ pageName: "p" });

		const meta = builder[BUILDER_STATE];
		expect(meta.mergeDirection).toBe("prepend");
		expect(meta.mergeOptions?.matchOn).toBe("data.id");
		expect(meta.scrollOptions?.pageName).toBe("p");
	});
});

describe("isBuilder()", () => {
	test("returns true for builders", () => {
		expect(isBuilder(prop<string>())).toBe(true);
		expect(isBuilder(mergedProp<string[]>())).toBe(true);
		expect(isBuilder(deepMergedProp<object>())).toBe(true);
		expect(isBuilder(prop<string>().once())).toBe(true);
		expect(isBuilder(prop<string>().deferred())).toBe(true);
	});

	test("returns false for non-builders", () => {
		expect(isBuilder(null)).toBe(false);
		expect(isBuilder(undefined)).toBe(false);
		expect(isBuilder("string")).toBe(false);
		expect(isBuilder(42)).toBe(false);
		expect(isBuilder({})).toBe(false);
		expect(isBuilder([])).toBe(false);
	});
});
