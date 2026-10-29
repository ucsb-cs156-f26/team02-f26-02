import { createElement } from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

export default function UCSBDiningCommonsMenuItemEditPage() {
  // Stryker disable all : placeholder for future implementation
  return createElement(
    BasicLayout,
    null,
    createElement(
      "div",
      { className: "pt-2" },
      createElement("h1", null, "Edit page not yet implemented"),
    ),
  );
}
