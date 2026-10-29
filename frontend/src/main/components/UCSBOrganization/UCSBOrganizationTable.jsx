import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

export default function UCSBOrganizationTable({
  organizations,
  currentUser,
  testIdPrefix = "UCSBOrganizationTable",
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/ucsborganizations/edit/${cell.row.original.orgCode}`);
  };

  const columns = [
    {
      header: "Organization Code",
      accessorKey: "orgCode",
    },
    {
      header: "Short Organization Name",
      accessorKey: "orgTranslationShort",
    },
    {
      header: "Organization Name",
      accessorKey: "orgTranslation",
    },
    {
      header: "Inactive",
      accessorKey: "inactive",
      cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, testIdPrefix));
  }

  return (
    <OurTable data={organizations} columns={columns} testid={testIdPrefix} />
  );
}
