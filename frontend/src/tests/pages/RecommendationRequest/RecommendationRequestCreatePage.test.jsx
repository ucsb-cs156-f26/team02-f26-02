import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => ({
  ...(await importOriginal()),
  toast: vi.fn((message) => mockToast(message)),
}));

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal()),
  Navigate: vi.fn((props) => {
    mockNavigate(props);
    return null;
  }),
}));

describe("RecommendationRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = (props = {}) =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <RecommendationRequestCreatePage {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  const fillValidForm = () => {
    fireEvent.change(screen.getByLabelText("Requester Email"), {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Professor Email"), {
      target: { value: "professor@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "Graduate school application" },
    });
    fireEvent.change(screen.getByLabelText("Date Requested"), {
      target: { value: "2026-10-21T12:00:05" },
    });
    fireEvent.change(screen.getByLabelText("Date Needed"), {
      target: { value: "2026-11-01T12:00:05" },
    });
  };

  test("renders the creation form", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", {
        name: "Create New RecommendationRequest",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Professor Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  test("valid submission POSTs all fields and returns to the index page", async () => {
    const created = {
      id: 17,
      requesterEmail: "student@ucsb.edu",
      professorEmail: "professor@ucsb.edu",
      explanation: "Graduate school application",
      dateRequested: "2026-10-21T12:00:05",
      dateNeeded: "2026-11-01T12:00:05",
      done: true,
    };
    axiosMock.onPost("/api/RecommendationRequest/post").reply(201, created);

    renderPage();
    await screen.findByLabelText("Requester Email");
    fillValidForm();
    fireEvent.click(screen.getByRole("checkbox", { name: "Done" }));
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "student@ucsb.edu",
      professorEmail: "professor@ucsb.edu",
      explanation: "Graduate school application",
      dateRequested: "2026-10-21T12:00:05.000",
      dateNeeded: "2026-11-01T12:00:05.000",
      done: true,
    });
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/recommendationrequest",
      }),
    );
    expect(mockToast).toHaveBeenCalledWith(expect.stringContaining("id: 17"));
  });

  test("invalid submission shows errors without POST or navigation", async () => {
    renderPage();
    await screen.findByLabelText("Requester Email");
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findByText("Requester email is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Professor email is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();
    expect(axiosMock.history.post).toHaveLength(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("Storybook submission stays on the form", async () => {
    const created = {
      id: 18,
      requesterEmail: "student@ucsb.edu",
      professorEmail: "professor@ucsb.edu",
      explanation: "Graduate school application",
      dateRequested: "2026-10-21T12:00:05",
      dateNeeded: "2026-11-01T12:00:05",
      done: false,
    };
    axiosMock.onPost("/api/RecommendationRequest/post").reply(201, created);

    renderPage({ storybook: true });
    await screen.findByLabelText("Requester Email");
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    expect(axiosMock.history.post[0].params.done).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
  });
});
