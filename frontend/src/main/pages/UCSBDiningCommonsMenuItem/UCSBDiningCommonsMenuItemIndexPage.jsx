import { createElement } from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

export default function UCSBDiningCommonsMenuItemIndexPage() {
  // Stryker disable all : placeholder for future implementation
  return createElement(
    BasicLayout,
    null,
    createElement(
      "div",
      { className: "pt-2" },
      createElement("h1", null, "Index page not yet implemented"),
      createElement(
        "p",
        null,
        createElement(
          "a",
          { href: "/diningcommonsmenuitem/create" },
          "Create",
        ),
      ),
      createElement(
        "p",
        null,
        createElement(
          "a",
          { href: "/diningcommonsmenuitem/edit/1" },
          "Edit",
        ),
      ),
    ),
  );
}
