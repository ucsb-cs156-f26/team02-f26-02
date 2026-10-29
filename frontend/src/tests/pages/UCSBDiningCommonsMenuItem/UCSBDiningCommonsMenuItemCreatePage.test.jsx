import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBDiningCommonsMenuItemCreatePage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemCreatePage";
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

describe("UCSBDiningCommonsMenuItemCreatePage tests", () => {
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

  afterAll(() => axiosMock.restore());

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
    });
  });

  test.each([false, true])(
    "submits to the menu item endpoint (storybook=%s)",
    async (storybook) => {
      const queryClient = new QueryClient();
      const menuItem = {
        id: 3,
        name: "Baked Pesto Pasta with Chicken",
        diningCommonsCode: "ortega",
        station: "Entree Specials",
      };

      axiosMock
        .onPost("/api/UCSBDiningCommonsMenuItem/post")
        .reply(200, menuItem);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            {storybook ? (
              <UCSBDiningCommonsMenuItemCreatePage storybook={true} />
            ) : (
              <UCSBDiningCommonsMenuItemCreatePage />
            )}
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await waitFor(() => {
        expect(screen.getByLabelText("Name")).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText("Name");
      expect(nameInput).toBeInTheDocument();

      const diningCommonsCodeInput = screen.getByLabelText(
        "Dining Commons Code",
      );
      expect(diningCommonsCodeInput).toBeInTheDocument();

      const createButton = screen.getByText("Create");
      expect(createButton).toBeInTheDocument();

      fireEvent.change(nameInput, {
        target: { value: "Baked Pesto Pasta with Chicken" },
      });
      fireEvent.change(diningCommonsCodeInput, {
        target: { value: "ortega" },
      });
      fireEvent.change(screen.getByLabelText("Station"), {
        target: { value: "Entree Specials" },
      });
      fireEvent.click(createButton);

      await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

      expect(axiosMock.history.post[0].params).toEqual({
        name: "Baked Pesto Pasta with Chicken",
        diningCommonsCode: "ortega",
        station: "Entree Specials",
      });

      // assert - check that the toast was called with the expected message
      expect(mockToast).toBeCalledWith(
        "New UCSBDiningCommonsMenuItem Created - id: 3 name: Baked Pesto Pasta with Chicken",
      );
      await waitFor(() => {
        expect(mockNavigate.mock.calls.map(([props]) => props)).toEqual(
          storybook ? [] : [{ to: "/diningcommonsmenuitem" }],
        );
      });
      expect(Boolean(screen.queryByRole("button", { name: "Create" }))).toBe(
        storybook,
      );
    },
  );
});
