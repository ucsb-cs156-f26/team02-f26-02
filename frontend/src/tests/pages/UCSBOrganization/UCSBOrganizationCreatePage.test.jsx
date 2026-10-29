import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("UCSBOrganizationCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = () => {
    const queryClient = new QueryClient();

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders without crashing", async () => {
    renderPage();

    expect(
      await screen.findByLabelText("Organization Code"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Short Organization Name"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Organization Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Inactive")).toBeInTheDocument();
  });

  test("submits valid data and redirects to /ucsborganization", async () => {
    const organization = {
      orgCode: "TESTORG",
      orgTranslationShort: "Test Org",
      orgTranslation: "Test Organization",
      inactive: false,
    };

    axiosMock.onPost("/api/ucsborganization/post").reply(200, organization);

    renderPage();

    fireEvent.change(await screen.findByLabelText("Organization Code"), {
      target: { value: organization.orgCode },
    });

    fireEvent.change(screen.getByLabelText("Short Organization Name"), {
      target: { value: organization.orgTranslationShort },
    });

    fireEvent.change(screen.getByLabelText("Organization Name"), {
      target: { value: organization.orgTranslation },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
    });

    expect(axiosMock.history.post[0].params).toEqual(organization);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "New UCSBOrganization Created - orgCode: TESTORG",
      );
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/ucsborganization",
      });
    });
  });

  test("invalid form does not submit to backend", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findByText("Organization Code is required."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Short Organization Name is required."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Organization Name is required."),
    ).toBeInTheDocument();

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
