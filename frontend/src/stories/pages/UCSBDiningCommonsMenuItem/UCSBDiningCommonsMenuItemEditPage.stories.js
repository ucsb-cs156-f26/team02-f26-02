import { createElement } from "react";
import { Navigate, Route, Routes } from "react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import { http, HttpResponse } from "msw";
import UCSBDiningCommonsMenuItemEditPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage";

export default {
  title: "pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage",
  component: UCSBDiningCommonsMenuItemEditPage,
};

const Template = () =>
  createElement(
    Routes,
    null,
    createElement(Route, {
      path: "/",
      element: createElement(Navigate, { to: "/diningcommonsmenuitem/edit/1" }),
    }),
    createElement(Route, {
      path: "/diningcommonsmenuitem/edit/:id",
      element: createElement(UCSBDiningCommonsMenuItemEditPage, {
        storybook: true,
      }),
    }),
  );

export const Default = Template.bind({});
Default.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () =>
        HttpResponse.json(apiCurrentUserFixtures.adminUser),
      ),
      http.get("/api/systemInfo", () =>
        HttpResponse.json(systemInfoFixtures.showingNeither),
      ),
      http.get("/api/UCSBDiningCommonsMenuItem", () =>
        HttpResponse.json(ucsbDiningCommonsMenuItemFixtures.oneMenuItem),
      ),
      http.put("/api/UCSBDiningCommonsMenuItem", async ({ request }) => {
        const data = await request.json();
        return HttpResponse.json({
          ...data,
          id: Number(new URL(request.url).searchParams.get("id")),
        });
      }),
    ],
  },
};
