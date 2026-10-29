import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import RecommendationRequestIndexPage from "main/pages/RecommendationRequest/RecommendationRequestIndexPage";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import mockConsole from "tests/testutils/mockConsole";

describe("RecommendationRequestIndexPage", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "RecommendationRequestTable";

  function renderPage(currentUser, requests, backendTimeout = false) {
    axiosMock.reset();
    axiosMock.onGet("/api/currentUser").reply(200, currentUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    if (backendTimeout) {
      axiosMock.onGet("/api/RecommendationRequest/all").timeout();
    } else {
      axiosMock
        .onGet("/api/RecommendationRequest/all")
        .reply(() => [200, requests]);
    }

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <RecommendationRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  test("loads all records and lets admins create and edit", async () => {
    renderPage(
      apiCurrentUserFixtures.adminUser,
      recommendationRequestFixtures.threeRecommendationRequests,
    );

    expect(await screen.findByText("student1@ucsb.edu")).toBeInTheDocument();
    expect(screen.getByText("student2@ucsb.edu")).toBeInTheDocument();
    expect(screen.getByText("student3@ucsb.edu")).toBeInTheDocument();
    expect(screen.getByText("Create RecommendationRequest")).toHaveAttribute(
      "href",
      "/recommendationrequest/create",
    );
    expect(screen.getByText("Create RecommendationRequest")).toHaveStyle({
      float: "right",
    });
    expect(
      screen.getByTestId(testId + "-cell-row-0-col-Edit-button"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(testId + "-cell-row-0-col-Delete-button"),
    ).toBeInTheDocument();
    expect(
      axiosMock.history.get.some(
        (request) => request.url === "/api/RecommendationRequest/all",
      ),
    ).toBe(true);
  });

  test("regular users see records without create, edit, or delete", async () => {
    renderPage(
      apiCurrentUserFixtures.userOnly,
      recommendationRequestFixtures.threeRecommendationRequests,
    );

    expect(await screen.findByText("student1@ucsb.edu")).toBeInTheDocument();
    expect(screen.getByText("professor1@ucsb.edu")).toBeInTheDocument();
    expect(
      screen.queryByText("Create RecommendationRequest"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(testId + "-cell-row-0-col-Edit-button"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(testId + "-cell-row-0-col-Delete-button"),
    ).not.toBeInTheDocument();
  });

  test("deleting a record refreshes the list", async () => {
    const requests = [
      ...recommendationRequestFixtures.threeRecommendationRequests,
    ];
    renderPage(apiCurrentUserFixtures.adminUser, requests);
    axiosMock.onDelete("/api/RecommendationRequest").reply((config) => {
      requests.shift();
      return [
        200,
        {
          message:
            "RecommendationRequest with id " + config.params.id + " deleted",
        },
      ];
    });

    expect(await screen.findByText("student1@ucsb.edu")).toBeInTheDocument();
    fireEvent.click(
      screen.getByTestId(testId + "-cell-row-0-col-Delete-button"),
    );

    await waitFor(() =>
      expect(screen.queryByText("student1@ucsb.edu")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("student2@ucsb.edu")).toBeInTheDocument();
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
    expect(
      axiosMock.history.get.filter(
        (request) => request.url === "/api/RecommendationRequest/all",
      ).length,
    ).toBeGreaterThanOrEqual(2);
  });

  test("reports the GET endpoint when loading records fails", async () => {
    const restoreConsole = mockConsole();
    renderPage(apiCurrentUserFixtures.userOnly, [], true);

    await waitFor(() => {
      expect(console.error.mock.calls[0][0]).toMatch(
        "Error communicating with backend via GET on /api/RecommendationRequest/all",
      );
    });
    restoreConsole();
  });
});
