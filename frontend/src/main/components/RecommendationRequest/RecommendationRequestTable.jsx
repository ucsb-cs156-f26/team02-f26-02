import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import { hasRole } from "main/utils/useCurrentUser";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

export default function RecommendationRequestTable({
  recommendationRequests,
  currentUser,
}) {
  const navigate = useNavigate();
  const testIdPrefix = "RecommendationRequestTable";

  const editCallback = (cell) => {
    navigate(`/recommendationrequest/edit/${cell.row.original.id}`);
  };

  // Stryker disable all : query-cache invalidation is handled by useBackendMutation
  const deleteMutation = useBackendMutation(
    (cell) => ({
      url: "/api/RecommendationRequest",
      method: "DELETE",
      params: { id: cell.row.original.id },
    }),
    { onSuccess: (message) => toast(message) },
    ["/api/RecommendationRequest/all"],
  );
  // Stryker restore all

  const deleteCallback = (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    { header: "Id", accessorKey: "id" },
    { header: "Requester Email", accessorKey: "requesterEmail" },
    { header: "Professor Email", accessorKey: "professorEmail" },
    { header: "Explanation", accessorKey: "explanation" },
    { header: "Date Requested", accessorKey: "dateRequested" },
    { header: "Date Needed", accessorKey: "dateNeeded" },
    {
      header: "Done",
      accessorKey: "done",
      cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, testIdPrefix));
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, testIdPrefix),
    );
  }

  return (
    <OurTable
      data={recommendationRequests}
      columns={columns}
      testid={testIdPrefix}
    />
  );
}
