import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { Navigate, useParams } from "react-router";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBOrganizationEditPage({ storybook = false }) {
  const { id } = useParams();

  const {
    data: organization,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/ucsborganization?orgCode=${id}`],
    {
      // Stryker disable next-line all : GET is the default
      method: "GET",
      url: "/api/ucsborganization",
      params: {
        orgCode: id,
      },
    },
  );

  const objectToAxiosPutParams = (organization) => ({
    url: "/api/ucsborganization",
    method: "PUT",
    params: {
      orgCode: organization.orgCode,
    },
    data: {
      orgTranslationShort: organization.orgTranslationShort,
      orgTranslation: organization.orgTranslation,
      inactive: organization.inactive,
    },
  });

  const onSuccess = (organization) => {
    toast(`UCSBOrganization Updated - orgCode: ${organization.orgCode}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/ucsborganization?orgCode=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate({ ...data, orgCode: id });
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/ucsborganization" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit UCSBOrganization</h1>
        {organization && (
          <UCSBOrganizationForm
            initialContents={organization}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
