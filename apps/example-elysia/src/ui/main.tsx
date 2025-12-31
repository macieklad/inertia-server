import "@vitejs/plugin-react/preamble";
import { createInertiaApp } from "@inertiajs/react";
import { createElement } from "react";
import { createRoot } from "react-dom/client";

createInertiaApp({
  resolve: async (name) => {
    const pages = import.meta.glob("./pages/**/*.tsx");
    const importPage = pages[`./pages/${name}.tsx`];

    if (!importPage) {
      throw new Error(`Page not found: ${name}`);
    }

    const module = (await importPage()) as { default: React.ComponentType };
    return module.default;
  },
  setup({ el, App, props }) {
    createRoot(el).render(createElement(App, props));
  },
});
