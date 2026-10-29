import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
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

describe("ArticlesCreatePage tests", () => {
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

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /articles", async () => {
    const queryClient = new QueryClient();
    const article = {
      id: 3,
      title: "Testing Spring Boot Applications",
      url: "https://example.com/testing-spring-boot",
      explanation:
        "A guide to writing tests for Spring Boot controllers and services.",
      email: "student3@ucsb.edu",
      dateAdded: "2026-10-03T14:00:00",
    };

    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText("Title");
    const urlInput = screen.getByLabelText("URL");
    const explanationInput = screen.getByLabelText("Explanation");
    const emailInput = screen.getByLabelText("Email");
    const dateAddedInput = screen.getByLabelText("Date Added (iso format)");

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(titleInput, { target: { value: article.title } });
    fireEvent.change(urlInput, { target: { value: article.url } });
    fireEvent.change(explanationInput, {
      target: { value: article.explanation },
    });
    fireEvent.change(emailInput, { target: { value: article.email } });
    fireEvent.change(dateAddedInput, {
      target: { value: "2026-10-03T14:00" },
    });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      title: article.title,
      url: article.url,
      explanation: article.explanation,
      email: article.email,
      dateAdded: "2026-10-03T14:00",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New article Created - id: 3 title: Testing Spring Boot Applications",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });
});
