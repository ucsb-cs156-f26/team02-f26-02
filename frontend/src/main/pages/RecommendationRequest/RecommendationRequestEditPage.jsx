import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { Navigate, useParams } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function RecommendationRequestEditPage({ storybook = false }) {
  const { id } = useParams();

  const { data: recommendationRequest } = useBackend(
    [`/api/RecommendationRequest?id=${id}`],
    {
      method: "GET",
      url: "/api/RecommendationRequest",
      params: { id },
    },
  );

  const mutation = useBackendMutation(
    (request) => ({
      url: "/api/RecommendationRequest",
      method: "PUT",
      params: { id },
      data: {
        requesterEmail: request.requesterEmail,
        professorEmail: request.professorEmail,
        explanation: request.explanation,
        dateRequested: request.dateRequested,
        dateNeeded: request.dateNeeded,
        done: request.done,
      },
    }),
    {
      onSuccess: (updatedRequest) =>
        toast(`RecommendationRequest Updated - id: ${updatedRequest.id}`),
    },
    [`/api/RecommendationRequest?id=${id}`],
  );

  if (mutation.isSuccess && !storybook) {
    return <Navigate to="/recommendationrequest" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit RecommendationRequest</h1>
        {recommendationRequest && (
          <RecommendationRequestForm
            initialContents={recommendationRequest}
            submitAction={(data) => mutation.mutate(data)}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
