import { describe, expect, test } from "bun:test";
import {
  getPropsToInclude,
  isPartialReload,
  isPartialReloadFor,
  parseInertiaHeaders,
  shouldResetProp,
  shouldSkipOnceProp,
} from "../src/headers";

describe("parseInertiaHeaders", () => {
  test("parses X-Inertia header", () => {
    const request = new Request("http://localhost/", {
      headers: { "X-Inertia": "true" },
    });
    const headers = parseInertiaHeaders(request);
    expect(headers.isInertia).toBe(true);
  });

  test("returns false for missing X-Inertia header", () => {
    const request = new Request("http://localhost/");
    const headers = parseInertiaHeaders(request);
    expect(headers.isInertia).toBe(false);
  });

  test("parses X-Inertia-Version header", () => {
    const request = new Request("http://localhost/", {
      headers: { "X-Inertia-Version": "abc123" },
    });
    const headers = parseInertiaHeaders(request);
    expect(headers.version).toBe("abc123");
  });

  test("parses X-Inertia-Partial-Component header", () => {
    const request = new Request("http://localhost/", {
      headers: { "X-Inertia-Partial-Component": "Users/Index" },
    });
    const headers = parseInertiaHeaders(request);
    expect(headers.partialComponent).toBe("Users/Index");
  });

  test("parses X-Inertia-Partial-Data as comma-separated list", () => {
    const request = new Request("http://localhost/", {
      headers: { "X-Inertia-Partial-Data": "users, posts, comments" },
    });
    const headers = parseInertiaHeaders(request);
    expect(headers.partialData).toEqual(["users", "posts", "comments"]);
  });

  test("parses X-Inertia-Partial-Except as comma-separated list", () => {
    const request = new Request("http://localhost/", {
      headers: { "X-Inertia-Partial-Except": "auth,flash" },
    });
    const headers = parseInertiaHeaders(request);
    expect(headers.partialExcept).toEqual(["auth", "flash"]);
  });

  test("parses X-Inertia-Reset as comma-separated list", () => {
    const request = new Request("http://localhost/", {
      headers: { "X-Inertia-Reset": "results,filters" },
    });
    const headers = parseInertiaHeaders(request);
    expect(headers.resetProps).toEqual(["results", "filters"]);
  });

  test("parses X-Inertia-Error-Bag header", () => {
    const request = new Request("http://localhost/", {
      headers: { "X-Inertia-Error-Bag": "createUser" },
    });
    const headers = parseInertiaHeaders(request);
    expect(headers.errorBag).toBe("createUser");
  });

  test("parses X-Inertia-Except-Once-Props header", () => {
    const request = new Request("http://localhost/", {
      headers: { "X-Inertia-Except-Once-Props": "plans,config" },
    });
    const headers = parseInertiaHeaders(request);
    expect(headers.exceptOnceProps).toEqual(["plans", "config"]);
  });

  test("parses X-Inertia-Infinite-Scroll-Merge-Intent with append", () => {
    const request = new Request("http://localhost/", {
      headers: { "X-Inertia-Infinite-Scroll-Merge-Intent": "append" },
    });
    const headers = parseInertiaHeaders(request);
    expect(headers.scrollMergeIntent).toBe("append");
  });

  test("parses X-Inertia-Infinite-Scroll-Merge-Intent with prepend", () => {
    const request = new Request("http://localhost/", {
      headers: { "X-Inertia-Infinite-Scroll-Merge-Intent": "prepend" },
    });
    const headers = parseInertiaHeaders(request);
    expect(headers.scrollMergeIntent).toBe("prepend");
  });

  test("returns null for invalid scroll merge intent", () => {
    const request = new Request("http://localhost/", {
      headers: { "X-Inertia-Infinite-Scroll-Merge-Intent": "invalid" },
    });
    const headers = parseInertiaHeaders(request);
    expect(headers.scrollMergeIntent).toBeNull();
  });

  test("parses Purpose: prefetch header", () => {
    const request = new Request("http://localhost/", {
      headers: { Purpose: "prefetch" },
    });
    const headers = parseInertiaHeaders(request);
    expect(headers.isPrefetch).toBe(true);
  });

  test("returns false for non-prefetch Purpose", () => {
    const request = new Request("http://localhost/", {
      headers: { Purpose: "other" },
    });
    const headers = parseInertiaHeaders(request);
    expect(headers.isPrefetch).toBe(false);
  });

  test("handles empty comma-separated lists", () => {
    const request = new Request("http://localhost/", {
      headers: { "X-Inertia-Partial-Data": "" },
    });
    const headers = parseInertiaHeaders(request);
    expect(headers.partialData).toEqual([]);
  });
});

describe("isPartialReload", () => {
  test("returns true when partial component is set", () => {
    const headers = parseInertiaHeaders(
      new Request("http://localhost/", {
        headers: { "X-Inertia-Partial-Component": "Users" },
      })
    );
    expect(isPartialReload(headers)).toBe(true);
  });

  test("returns false when partial component is not set", () => {
    const headers = parseInertiaHeaders(new Request("http://localhost/"));
    expect(isPartialReload(headers)).toBe(false);
  });
});

describe("isPartialReloadFor", () => {
  test("returns true when component matches", () => {
    const headers = parseInertiaHeaders(
      new Request("http://localhost/", {
        headers: { "X-Inertia-Partial-Component": "Users/Index" },
      })
    );
    expect(isPartialReloadFor(headers, "Users/Index")).toBe(true);
  });

  test("returns false when component does not match", () => {
    const headers = parseInertiaHeaders(
      new Request("http://localhost/", {
        headers: { "X-Inertia-Partial-Component": "Users/Index" },
      })
    );
    expect(isPartialReloadFor(headers, "Posts/Index")).toBe(false);
  });
});

describe("getPropsToInclude", () => {
  const allProps = ["users", "posts", "auth", "flash", "errors"];

  test("returns all props when not a partial reload", () => {
    const headers = parseInertiaHeaders(new Request("http://localhost/"));
    const result = getPropsToInclude(headers, allProps, "Users/Index");
    expect(result).toEqual(allProps);
  });

  test("returns all props when component does not match", () => {
    const headers = parseInertiaHeaders(
      new Request("http://localhost/", {
        headers: { "X-Inertia-Partial-Component": "Posts/Index" },
      })
    );
    const result = getPropsToInclude(headers, allProps, "Users/Index");
    expect(result).toEqual(allProps);
  });

  test("filters to only specified props", () => {
    const headers = parseInertiaHeaders(
      new Request("http://localhost/", {
        headers: {
          "X-Inertia-Partial-Component": "Users/Index",
          "X-Inertia-Partial-Data": "users,posts",
        },
      })
    );
    const result = getPropsToInclude(headers, allProps, "Users/Index");
    expect(result).toContain("users");
    expect(result).toContain("posts");
    expect(result).toContain("errors"); // Always included
    expect(result).not.toContain("auth");
    expect(result).not.toContain("flash");
  });

  test("excludes specified props", () => {
    const headers = parseInertiaHeaders(
      new Request("http://localhost/", {
        headers: {
          "X-Inertia-Partial-Component": "Users/Index",
          "X-Inertia-Partial-Except": "auth,flash",
        },
      })
    );
    const result = getPropsToInclude(headers, allProps, "Users/Index");
    expect(result).toContain("users");
    expect(result).toContain("posts");
    expect(result).toContain("errors");
    expect(result).not.toContain("auth");
    expect(result).not.toContain("flash");
  });

  test("except takes precedence over only", () => {
    const headers = parseInertiaHeaders(
      new Request("http://localhost/", {
        headers: {
          "X-Inertia-Partial-Component": "Users/Index",
          "X-Inertia-Partial-Data": "users,posts,auth",
          "X-Inertia-Partial-Except": "auth",
        },
      })
    );
    const result = getPropsToInclude(headers, allProps, "Users/Index");
    expect(result).toContain("users");
    expect(result).toContain("posts");
    expect(result).not.toContain("auth");
  });
});

describe("shouldSkipOnceProp", () => {
  test("returns true when prop is in except list", () => {
    const headers = parseInertiaHeaders(
      new Request("http://localhost/", {
        headers: { "X-Inertia-Except-Once-Props": "plans,config" },
      })
    );
    expect(shouldSkipOnceProp(headers, "plans")).toBe(true);
    expect(shouldSkipOnceProp(headers, "config")).toBe(true);
  });

  test("returns false when prop is not in except list", () => {
    const headers = parseInertiaHeaders(
      new Request("http://localhost/", {
        headers: { "X-Inertia-Except-Once-Props": "plans" },
      })
    );
    expect(shouldSkipOnceProp(headers, "config")).toBe(false);
  });
});

describe("shouldResetProp", () => {
  test("returns true when prop is in reset list", () => {
    const headers = parseInertiaHeaders(
      new Request("http://localhost/", {
        headers: { "X-Inertia-Reset": "results,filters" },
      })
    );
    expect(shouldResetProp(headers, "results")).toBe(true);
    expect(shouldResetProp(headers, "filters")).toBe(true);
  });

  test("returns false when prop is not in reset list", () => {
    const headers = parseInertiaHeaders(
      new Request("http://localhost/", {
        headers: { "X-Inertia-Reset": "results" },
      })
    );
    expect(shouldResetProp(headers, "filters")).toBe(false);
  });
});
