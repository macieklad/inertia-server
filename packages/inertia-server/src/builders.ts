/**
 * Inertia.js Prop Builders
 *
 * Composable builder system for defining page props with type-safe chaining.
 */

import type {
  AnyBuilder,
  DeepMergeBuilder,
  DeferredBuilder,
  DeferredOnceBuilder,
  MergeBuilder,
  MergePropOptions,
  OnceBuilder,
  OncePropOptions,
  PropBuilder,
  PropBuilderState,
  ScrollPropOptions,
} from "./types";
import { BUILDER_LAZY, BUILDER_STATE, BUILDER_TYPE } from "./types";

// =============================================================================
// Public API
// =============================================================================

/**
 * Creates a basic prop builder.
 *
 * @example
 * ```ts
 * prop<string>()                    // Basic prop
 * prop<User>().once()               // Cached prop
 * prop<Analytics>().deferred()      // Deferred prop
 * prop<Heavy>().optional()          // Only included when explicitly requested
 * prop<Auth>().always()             // Always included, even in partial reloads
 * ```
 */
export function prop<T>(): PropBuilder<T> {
  const meta: PropBuilderState = { type: "prop" };

  const createPropBuilder = (currentMeta: PropBuilderState): PropBuilder<T> => {
    return createBuilder<T, PropBuilder<T>>(
      currentMeta,
      {
        once(opts?: OncePropOptions): OnceBuilder<T> {
          return createOnceBuilder({
            ...currentMeta,
            type: "once",
            once: opts,
          });
        },
        deferred(group = "default"): DeferredBuilder<T> {
          const deferredMeta: PropBuilderState = {
            ...currentMeta,
            type: "deferred",
            deferredGroup: group,
          };

          return createBuilder<T, DeferredBuilder<T>>(
            deferredMeta,
            {
              once(opts?: OncePropOptions): DeferredOnceBuilder<T> {
                return createBuilder<T, DeferredOnceBuilder<T>>(
                  {
                    ...deferredMeta,
                    once: opts,
                    isDeferredOnce: true,
                  },
                  {},
                  true
                );
              },
            },
            true
          );
        },
        optional(): PropBuilder<T> {
          return createPropBuilder({ ...currentMeta, isOptional: true });
        },
        always(): PropBuilder<T> {
          return createPropBuilder({ ...currentMeta, isAlways: true });
        },
      },
      false
    );
  };

  const createOnceBuilder = (currentMeta: PropBuilderState): OnceBuilder<T> => {
    return createBuilder<T, OnceBuilder<T>>(
      currentMeta,
      {
        deferred(group = "default"): DeferredOnceBuilder<T> {
          return createBuilder<T, DeferredOnceBuilder<T>>(
            {
              ...currentMeta,
              type: "deferred",
              deferredGroup: group,
              isDeferredOnce: true,
            },
            {},
            true
          );
        },
      },
      true
    );
  };

  return createPropBuilder(meta);
}

/**
 * Creates a merge prop builder for array merging on navigation.
 *
 * @param opts - Merge options including matchOn for item matching
 *
 * @example
 * ```ts
 * mergedProp<Post[]>({ matchOn: "id" })           // Append (default)
 * mergedProp<Post[]>({ matchOn: "id" }).prepend() // Prepend
 * mergedProp<Post[]>({ matchOn: "id" }).scroll({ pageName: "page" })
 * ```
 */
export function mergedProp<T>(opts?: MergePropOptions): MergeBuilder<T> {
  const meta: PropBuilderState = {
    type: "merge",
    mergeOptions: opts,
    mergeDirection: "append",
  };

  const createMergeBuilder = (
    currentMeta: PropBuilderState
  ): MergeBuilder<T> => {
    return createBuilder<T, MergeBuilder<T>>(
      currentMeta,
      {
        append(): MergeBuilder<T> {
          return createMergeBuilder({
            ...currentMeta,
            mergeDirection: "append",
          });
        },
        prepend(): MergeBuilder<T> {
          return createMergeBuilder({
            ...currentMeta,
            mergeDirection: "prepend",
          });
        },
        scroll(scrollOpts: ScrollPropOptions): MergeBuilder<T> {
          return createMergeBuilder({
            ...currentMeta,
            scrollOptions: scrollOpts,
          });
        },
      },
      false
    );
  };

  return createMergeBuilder(meta);
}

/**
 * Creates a deep merge prop builder for nested object merging.
 *
 * @param opts - Merge options including matchOn for nested item matching
 *
 * @example
 * ```ts
 * deepMergedProp<Conversations>({ matchOn: "data.id" })
 * deepMergedProp<Conversations>({ matchOn: "data.id" }).prepend()
 * deepMergedProp<Conversations>({ matchOn: "data.id" }).scroll({ pageName: "page" })
 * ```
 */
export function deepMergedProp<T>(
  opts?: MergePropOptions
): DeepMergeBuilder<T> {
  const meta: PropBuilderState = {
    type: "deepMerge",
    mergeOptions: opts,
    mergeDirection: "append",
  };

  const createDeepMergeBuilder = (
    currentMeta: PropBuilderState
  ): DeepMergeBuilder<T> => {
    return createBuilder<T, DeepMergeBuilder<T>>(
      currentMeta,
      {
        append(): DeepMergeBuilder<T> {
          return createDeepMergeBuilder({
            ...currentMeta,
            mergeDirection: "append",
          });
        },
        prepend(): DeepMergeBuilder<T> {
          return createDeepMergeBuilder({
            ...currentMeta,
            mergeDirection: "prepend",
          });
        },
        scroll(scrollOpts: ScrollPropOptions): DeepMergeBuilder<T> {
          return createDeepMergeBuilder({
            ...currentMeta,
            scrollOptions: scrollOpts,
          });
        },
      },
      false
    );
  };

  return createDeepMergeBuilder(meta);
}

/**
 * Type guard to check if a value is an Inertia prop builder.
 */
export function isBuilder(value: unknown): value is AnyBuilder {
  return typeof value === "object" && value !== null && BUILDER_STATE in value;
}

// =============================================================================
// Internal Implementation
// =============================================================================

/**
 * Creates a builder object with the given metadata.
 */
function createBuilder<T, B extends AnyBuilder<T>>(
  meta: PropBuilderState,
  methods: Omit<
    B,
    typeof BUILDER_STATE | typeof BUILDER_TYPE | typeof BUILDER_LAZY
  >,
  isLazy: boolean
): B {
  return {
    [BUILDER_STATE]: meta,
    [BUILDER_TYPE]: undefined as T,
    [BUILDER_LAZY]: isLazy,
    ...methods,
  } as B;
}
