import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { http, HttpResponse } from "msw";
import UCSBOrganizationIndexPage from "main/pages/UCSBOrganization/UCSBOrganizationIndexPage";

export default {
  title: "pages/UCSBOrganization/UCSBOrganizationIndexPage",
  component: UCSBOrganizationIndexPage,
};

const Template = () => <UCSBOrganizationIndexPage storybook={true} />;

export const Empty = Template.bind({});
Empty.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/ucsborganization/all", () => {
      return HttpResponse.json([]);
    }),
  ],
};

export const ThreeItemsOrdinaryUser = Template.bind({});
ThreeItemsOrdinaryUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/ucsborganization/all", () => {
      return HttpResponse.json(ucsbOrganizationFixtures.threeOrganizations);
    }),
  ],
};

export const ThreeItemsAdminUser = Template.bind({});

let organizations = [...ucsbOrganizationFixtures.threeOrganizations];

ThreeItemsAdminUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/ucsborganization/all", () => {
      return HttpResponse.json(organizations);
    }),
    http.delete("/api/ucsborganization", ({ request }) => {
      const url = new URL(request.url);
      const orgCode = url.searchParams.get("orgCode");

      organizations = organizations.filter(
        (organization) => organization.orgCode !== orgCode,
      );

      return HttpResponse.text(`record ${orgCode} deleted`, {
        status: 200,
      });
    }),
  ],
};
