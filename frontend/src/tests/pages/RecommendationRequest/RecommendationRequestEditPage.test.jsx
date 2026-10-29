import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => ({
  ...(await importOriginal()),
  toast: vi.fn((message) => mockToast(message)),
}));

describe("RecommendationRequestEditPage", () => {
  let axiosMock;
  const original = recommendationRequestFixtures.oneRecommendationRequest;

  const renderPage = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={["/previous", "/recommendationrequest/edit/1"]}
          initialIndex={1}
        >
          <Routes>
            <Route path="/previous" element={<div>Previous page</div>} />
            <Route
              path="/recommendationrequest/edit/:id"
              element={<RecommendationRequestEditPage />}
            />
            <Route
              path="/recommendationrequest"
              element={<div>RecommendationRequest index</div>}
            />
          </Routes>
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
      .onGet("/api/RecommendationRequest", { params: { id: "1" } })
      .reply(200, original);
    mockToast.mockClear();
  });

  afterEach(() => {
    axiosMock.restore();
  });

  test("loads the selected record into the edit form", async () => {
    renderPage();

    expect(
      await screen.findByText("Edit RecommendationRequest"),
    ).toBeInTheDocument();
    await screen.findByTestId("RecommendationRequestForm-id");
    expect(screen.getByTestId("RecommendationRequestForm-id")).toHaveValue("1");
    expect(
      screen.getByTestId("RecommendationRequestForm-requesterEmail"),
    ).toHaveValue("student1@ucsb.edu");
    expect(
      screen.getByTestId("RecommendationRequestForm-professorEmail"),
    ).toHaveValue("professor1@ucsb.edu");
    expect(
      screen.getByTestId("RecommendationRequestForm-explanation"),
    ).toHaveValue("Applying to graduate school");
    expect(
      screen.getByTestId("RecommendationRequestForm-dateRequested"),
    ).toHaveValue("2026-10-21T12:00");
    expect(
      screen.getByTestId("RecommendationRequestForm-dateNeeded"),
    ).toHaveValue("2026-11-01T12:00");
    expect(
      screen.getByTestId("RecommendationRequestForm-done"),
    ).not.toBeChecked();
    expect(
      screen.getByTestId("RecommendationRequestForm-submit"),
    ).toHaveTextContent("Update");
  });

  test("sends valid changes to PUT and returns to the index", async () => {
    axiosMock.onPut("/api/RecommendationRequest").reply(200, {
      ...original,
      explanation: "Applying for a fellowship",
      done: true,
    });
    renderPage();

    const explanation = await screen.findByTestId(
      "RecommendationRequestForm-explanation",
    );
    fireEvent.change(explanation, {
      target: { value: "Applying for a fellowship" },
    });
    fireEvent.click(screen.getByTestId("RecommendationRequestForm-done"));
    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    expect(
      await screen.findByText("RecommendationRequest index"),
    ).toBeInTheDocument();
    expect(axiosMock.history.put).toHaveLength(1);
    expect(axiosMock.history.put[0].params).toEqual({ id: "1" });
    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
      requesterEmail: "student1@ucsb.edu",
      professorEmail: "professor1@ucsb.edu",
      explanation: "Applying for a fellowship",
      dateRequested: "2026-10-21T12:00:00",
      dateNeeded: "2026-11-01T12:00:00",
      done: true,
    });
    expect(mockToast).toHaveBeenCalledWith(
      "RecommendationRequest Updated - id: 1",
    );
  });

  test("does not save invalid changes", async () => {
    renderPage();

    const email = await screen.findByTestId(
      "RecommendationRequestForm-requesterEmail",
    );
    fireEvent.change(email, { target: { value: "invalid" } });
    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(axiosMock.history.put).toHaveLength(0);
    expect(screen.getByText("Edit RecommendationRequest")).toBeInTheDocument();
  });

  test("cancel returns to the previous page without saving", async () => {
    renderPage();

    await screen.findByTestId("RecommendationRequestForm-cancel");
    fireEvent.click(screen.getByTestId("RecommendationRequestForm-cancel"));

    await waitFor(() =>
      expect(screen.getByText("Previous page")).toBeInTheDocument(),
    );
    expect(axiosMock.history.put).toHaveLength(0);
  });
});
