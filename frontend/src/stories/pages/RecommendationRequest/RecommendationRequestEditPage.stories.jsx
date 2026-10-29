import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";

export default {
  title: "pages/RecommendationRequest/RecommendationRequestEditPage",
  component: RecommendationRequestEditPage,
};

const Template = () => <RecommendationRequestEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
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
    http.get("/api/RecommendationRequest", () => {
      return HttpResponse.json(
        recommendationRequestFixtures.oneRecommendationRequest,
        { status: 200 },
      );
    }),
    http.put("/api/RecommendationRequest", async ({ request }) => {
      const updates = await request.json();
      return HttpResponse.json(
        {
          ...recommendationRequestFixtures.oneRecommendationRequest,
          ...updates,
        },
        { status: 200 },
      );
    }),
  ],
};
