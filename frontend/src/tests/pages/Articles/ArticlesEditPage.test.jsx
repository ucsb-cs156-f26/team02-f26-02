import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

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
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("ArticlesEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Article");
      expect(
        screen.queryByTestId("ArticlesForm-title"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        title: "Introduction to Java",
        explanation: "Learn Java basics",
        url: "https://example.com/java",
        email: "student@ucsb.edu",
        dateAdded: "2026-10-01T12:00:00",
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: "17",
        title: "Introduction to React",
        explanation: "Learn React components",
        url: "https://example.com/react",
        email: "editor@ucsb.edu",
        dateAdded: "2026-10-02T13:30",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-id");

      const idField = screen.getByTestId("ArticlesForm-id");
      const titleField = screen.getByTestId("ArticlesForm-title");
      const explanationField = screen.getByTestId("ArticlesForm-explanation");
      const urlField = screen.getByTestId("ArticlesForm-url");
      const emailField = screen.getByTestId("ArticlesForm-email");
      const dateAddedField = screen.getByTestId("ArticlesForm-dateAdded");
      const submitButton = screen.getByTestId("ArticlesForm-submit");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(titleField).toBeInTheDocument();
      expect(titleField).toHaveValue("Introduction to Java");
      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("Learn Java basics");

      expect(urlField).toHaveValue("https://example.com/java");
      expect(emailField).toHaveValue("student@ucsb.edu");
      expect(dateAddedField).toHaveValue("2026-10-01T12:00");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(titleField, {
        target: { value: "Introduction to React" },
      });
      fireEvent.change(explanationField, {
        target: { value: "Learn React components" },
      });
      fireEvent.change(urlField, {
        target: { value: "https://example.com/react" },
      });
      fireEvent.change(emailField, { target: { value: "editor@ucsb.edu" } });
      fireEvent.change(dateAddedField, {
        target: { value: "2026-10-02T13:30" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: Introduction to React",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
        title: "Introduction to React",
        explanation: "Learn React components",
        url: "https://example.com/react",
        email: "editor@ucsb.edu",
        dateAdded: "2026-10-02T13:30",
      }); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-id");

      const idField = screen.getByTestId("ArticlesForm-id");
      const titleField = screen.getByTestId("ArticlesForm-title");
      const explanationField = screen.getByTestId("ArticlesForm-explanation");
      const urlField = screen.getByTestId("ArticlesForm-url");
      const emailField = screen.getByTestId("ArticlesForm-email");
      const dateAddedField = screen.getByTestId("ArticlesForm-dateAdded");
      const submitButton = screen.getByTestId("ArticlesForm-submit");

      expect(idField).toHaveValue("17");
      expect(titleField).toHaveValue("Introduction to Java");
      expect(explanationField).toHaveValue("Learn Java basics");
      expect(urlField).toHaveValue("https://example.com/java");
      expect(emailField).toHaveValue("student@ucsb.edu");
      expect(dateAddedField).toHaveValue("2026-10-01T12:00");

      expect(submitButton).toBeInTheDocument();

      fireEvent.change(titleField, {
        target: { value: "Introduction to React" },
      });
      fireEvent.change(explanationField, {
        target: { value: "Learn React components" },
      });

      fireEvent.change(urlField, {
        target: { value: "https://example.com/react" },
      });
      fireEvent.change(emailField, { target: { value: "editor@ucsb.edu" } });
      fireEvent.change(dateAddedField, {
        target: { value: "2026-10-02T13:30" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: Introduction to React",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/articles" });
    });
  });
});
