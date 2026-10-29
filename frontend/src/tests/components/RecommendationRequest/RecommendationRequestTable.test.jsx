import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return { ...originalModule, useNavigate: () => mockedNavigate };
});

const testId = "RecommendationRequestTable";
const expectedColumns = [
  ["Id", "id", "1"],
  ["Requester Email", "requesterEmail", "student1@ucsb.edu"],
  ["Professor Email", "professorEmail", "professor1@ucsb.edu"],
  ["Explanation", "explanation", "Applying to graduate school"],
  ["Date Requested", "dateRequested", "2026-10-21T12:00:00"],
  ["Date Needed", "dateNeeded", "2026-11-01T12:00:00"],
  ["Done", "done", "No"],
];

function renderTable({
  recommendationRequests = recommendationRequestFixtures.threeRecommendationRequests,
  currentUser = currentUserFixtures.userOnly,
} = {}) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RecommendationRequestTable
          recommendationRequests={recommendationRequests}
          currentUser={currentUser}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("RecommendationRequestTable", () => {
  beforeEach(() => mockedNavigate.mockClear());

  test("shows all database fields with readable headers and boolean values", () => {
    renderTable();

    expectedColumns.forEach(([header, field, value]) => {
      expect(screen.getByTestId(`${testId}-header-${field}`)).toHaveTextContent(
        header,
      );
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toHaveTextContent(value);
    });
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-done`),
    ).toHaveTextContent("Yes");
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );
  });

  test("shows headers but no rows when the list is empty", () => {
    renderTable({ recommendationRequests: [] });

    expectedColumns.forEach(([, field]) => {
      expect(
        screen.getByTestId(`${testId}-header-${field}`),
      ).toBeInTheDocument();
    });
    expect(screen.queryByTestId(`${testId}-row-0`)).not.toBeInTheDocument();
  });

  test("ordinary users cannot edit or delete rows", () => {
    renderTable();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("admins see Edit and Delete buttons", () => {
    renderTable({ currentUser: currentUserFixtures.adminUser });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).toHaveClass("btn-primary");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).toHaveClass("btn-danger");
  });

  test("Edit navigates to the selected RecommendationRequest", async () => {
    renderTable({ currentUser: currentUserFixtures.adminUser });

    fireEvent.click(screen.getByTestId(`${testId}-cell-row-1-col-Edit-button`));
    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith(
        "/recommendationrequest/edit/2",
      ),
    );
  });

  test("Delete calls the RecommendationRequest API with the selected id", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/RecommendationRequest")
      .reply(200, { message: "RecommendationRequest deleted" });

    renderTable({ currentUser: currentUserFixtures.adminUser });
    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-1-col-Delete-button`),
    );

    await waitFor(() => expect(axiosMock.history.delete).toHaveLength(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });
    axiosMock.restore();
  });
});
