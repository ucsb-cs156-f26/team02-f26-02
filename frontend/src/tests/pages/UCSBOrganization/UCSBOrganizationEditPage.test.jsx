import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((message) => mockToast(message)),
  };
});

const mockNavigate = vi.fn();
const mockGoBack = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({ id: "ENGR" })),
    useNavigate: () => mockGoBack,
    Navigate: vi.fn((props) => {
      mockNavigate(props);
      return null;
    }),
  };
});

describe("UCSBOrganizationEditPage tests", () => {
  let axiosMock;

  const originalOrganization = {
    orgCode: "ENGR",
    orgTranslationShort: "Engineering",
    orgTranslation: "College of Engineering",
    inactive: false,
  };

  const updatedOrganization = {
    orgCode: "ENGR",
    orgTranslationShort: "Engineering Updated",
    orgTranslation: "Updated College of Engineering",
    inactive: true,
  };

  const renderPage = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    axiosMock
      .onGet("/api/ucsborganization", { params: { orgCode: "ENGR" } })
      .reply(200, originalOrganization);

    axiosMock.onPut("/api/ucsborganization").reply(200, updatedOrganization);

    mockToast.mockClear();
    mockNavigate.mockClear();
    mockGoBack.mockClear();
  });

  afterEach(() => {
    axiosMock.restore();
  });

  test("renders the edit page with existing organization data", async () => {
    renderPage();

    const orgCode = await screen.findByTestId("UCSBOrganizationForm-orgCode");

    expect(screen.getByText("Edit UCSBOrganization")).toBeInTheDocument();
    expect(orgCode).toHaveValue("ENGR");
    expect(orgCode).toBeDisabled();

    expect(
      screen.getByTestId("UCSBOrganizationForm-orgTranslationShort"),
    ).toHaveValue("Engineering");

    expect(
      screen.getByTestId("UCSBOrganizationForm-orgTranslation"),
    ).toHaveValue("College of Engineering");

    expect(
      screen.getByTestId("UCSBOrganizationForm-inactive"),
    ).not.toBeChecked();

    expect(screen.getByTestId("UCSBOrganizationForm-submit")).toHaveTextContent(
      "Update",
    );
  });

  test("updates the organization when clicking Update", async () => {
    renderPage();

    await screen.findByTestId("UCSBOrganizationForm-orgCode");

    fireEvent.change(
      screen.getByTestId("UCSBOrganizationForm-orgTranslationShort"),
      { target: { value: "Engineering Updated" } },
    );

    fireEvent.change(
      screen.getByTestId("UCSBOrganizationForm-orgTranslation"),
      { target: { value: "Updated College of Engineering" } },
    );

    fireEvent.click(screen.getByTestId("UCSBOrganizationForm-inactive"));
    fireEvent.click(screen.getByTestId("UCSBOrganizationForm-submit"));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "UCSBOrganization Updated - orgCode: ENGR",
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/ucsborganization",
    });

    expect(axiosMock.history.put).toHaveLength(1);
    expect(axiosMock.history.put[0].params).toEqual({
      orgCode: "ENGR",
    });

    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
      orgTranslationShort: "Engineering Updated",
      orgTranslation: "Updated College of Engineering",
      inactive: true,
    });
  });

  test("does not submit when required fields are empty", async () => {
    renderPage();

    await screen.findByTestId("UCSBOrganizationForm-orgCode");

    fireEvent.change(
      screen.getByTestId("UCSBOrganizationForm-orgTranslationShort"),
      { target: { value: "" } },
    );

    fireEvent.change(
      screen.getByTestId("UCSBOrganizationForm-orgTranslation"),
      { target: { value: "" } },
    );

    fireEvent.click(screen.getByTestId("UCSBOrganizationForm-submit"));

    expect(
      await screen.findByText("Short Organization Name is required."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Organization Name is required."),
    ).toBeInTheDocument();

    expect(axiosMock.history.put).toHaveLength(0);
  });

  test("Cancel returns to previous page without saving", async () => {
    renderPage();

    await screen.findByTestId("UCSBOrganizationForm-orgCode");

    fireEvent.click(screen.getByTestId("UCSBOrganizationForm-cancel"));

    expect(mockGoBack).toHaveBeenCalledWith(-1);
    expect(axiosMock.history.put).toHaveLength(0);
  });

  test("does not display the form when backend request fails", async () => {
    axiosMock.resetHandlers();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/ucsborganization").reply(500);

    const restoreConsole = mockConsole();

    try {
      renderPage();

      await screen.findByText("Edit UCSBOrganization");

      await waitFor(() => {
        expect(
          axiosMock.history.get.some(
            (request) => request.url === "/api/ucsborganization",
          ),
        ).toBe(true);
      });

      expect(
        screen.queryByTestId("UCSBOrganizationForm-orgCode"),
      ).not.toBeInTheDocument();
    } finally {
      restoreConsole();
    }
  });
});
