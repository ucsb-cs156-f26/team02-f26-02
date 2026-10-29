import { createElement } from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import UCSBDiningCommonsMenuItemCreatePage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemCreatePage";

export default {
  title: "pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemCreatePage",
  component: UCSBDiningCommonsMenuItemCreatePage,
};

const Template = () =>
  createElement(UCSBDiningCommonsMenuItemCreatePage, { storybook: true });

export const Default = Template.bind({});
Default.parameters = {
  msw: {
    handlers: [
      http.get("/api/currentUser", () => {
        return HttpResponse.json(apiCurrentUserFixtures.adminUser, {
          status: 200,
        });
      }),
      http.get("/api/systemInfo", () => {
        return HttpResponse.json(systemInfoFixtures.showingNeither, {
          status: 200,
        });
      }),
      http.post("/api/UCSBDiningCommonsMenuItem/post", ({ request }) => {
        const params = new URL(request.url).searchParams;
        return HttpResponse.json(
          {
            id: 1,
            diningCommonsCode: params.get("diningCommonsCode"),
            name: params.get("name"),
            station: params.get("station"),
          },
          { status: 200 },
        );
      }),
    ],
  },
};
