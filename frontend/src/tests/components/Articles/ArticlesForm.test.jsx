import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import ArticlesForm from "main/components/Articles/ArticlesForm";
import { articlesFixtures } from "fixtures/articlesFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ArticlesForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Title",
    "URL",
    "Explanation",
    "Email",
    "Date Added (iso format)",
  ];
  const testId = "ArticlesForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm initialContents={articlesFixtures.oneArticle[0]} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();
  });

  test("submits correctly with a valid ISO date", async () => {
    const submitAction = vi.fn();
    const article = articlesFixtures.oneArticle[0];

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

    for (const field of ["title", "url", "explanation", "email", "dateAdded"]) {
      fireEvent.change(screen.getByTestId(`${testId}-${field}`), {
        target: { value: article[field] },
      });
    }
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(submitAction).toHaveBeenCalled());
    expect(submitAction.mock.calls[0][0].dateAdded).toBe(
      screen.getByTestId(`${testId}-dateAdded`).value,
    );
    expect(
      screen.queryByText(/Date added is required/),
    ).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Title is required/);
    expect(screen.getByText(/URL is required/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required/)).toBeInTheDocument();
    expect(screen.getByText(/Email is required/)).toBeInTheDocument();
    expect(screen.getByText(/Date added is required/)).toBeInTheDocument();

    for (const field of ["title", "url", "explanation", "email"]) {
      const input = screen.getByTestId(`${testId}-${field}`);
      fireEvent.change(input, { target: { value: "a".repeat(256) } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Max length 255 characters/),
        ).toBeInTheDocument();
      });

      fireEvent.change(input, { target: { value: "a".repeat(255) } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/Max length 255 characters/),
        ).not.toBeInTheDocument();
      });
    }
  });
});
