import React from "react";
import UCSBOrganizationTable from "main/components/UCSBOrganization/UCSBOrganizationTable";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

export default {
  title: "Components/UCSBOrganization/UCSBOrganizationTable",
  component: UCSBOrganizationTable,
};

const Template = (args) => <UCSBOrganizationTable {...args} />;

export const Empty = Template.bind({});
Empty.args = {
  organizations: [],
  currentUser: { roles: [] },
};

export const ThreeOrganizations = Template.bind({});
ThreeOrganizations.args = {
  organizations: ucsbOrganizationFixtures.threeOrganizations,
  currentUser: { roles: [] },
};
