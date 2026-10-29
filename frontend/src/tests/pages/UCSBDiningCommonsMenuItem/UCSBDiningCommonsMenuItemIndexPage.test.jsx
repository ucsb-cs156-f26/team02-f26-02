import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import UCSBDiningCommonsMenuItemIndexPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemIndexPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return { ...originalModule, toast: (message) => mockToast(message) };
});

describe("UCSBDiningCommonsMenuItemIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });
  afterAll(() => axiosMock.restore());

  function renderPage() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  test("loads all database fields for an ordinary user without admin actions", async () => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/UCSBDiningCommonsMenuItem/all")
      .reply(200, ucsbDiningCommonsMenuItemFixtures.threeMenuItems);
    renderPage();
    await screen.findByText(
      ucsbDiningCommonsMenuItemFixtures.threeMenuItems[0].name,
    );
    ucsbDiningCommonsMenuItemFixtures.threeMenuItems.forEach((item, row) => {
      ["id", "diningCommonsCode", "name", "station"].forEach((field) => {
        expect(
          screen.getByTestId(
            `UCSBDiningCommonsMenuItemTable-cell-row-${row}-col-${field}`,
          ),
        ).toHaveTextContent(String(item[field]));
      });
    });
    expect(
      screen.queryByText("Create UCSBDiningCommonsMenuItem"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
  });

  test("shows an admin Create link and renders an empty table", async () => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock.onGet("/api/UCSBDiningCommonsMenuItem/all").reply(200, []);
    renderPage();
    const createLink = await screen.findByText(
      "Create UCSBDiningCommonsMenuItem",
    );
    expect(createLink).toHaveAttribute("href", "/diningcommonsmenuitem/create");
    expect(createLink).toHaveStyle({ float: "right" });
    expect(
      screen.getByRole("heading", { name: "UCSBDiningCommonsMenuItems" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Dining Commons Code")).toBeInTheDocument();
    expect(
      screen.queryByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-id"),
    ).not.toBeInTheDocument();
  });
  test("renders an empty table and reports a backend failure", async () => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/UCSBDiningCommonsMenuItem/all").timeout();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      renderPage();
      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith(
          "Error communicating with backend via GET on /api/UCSBDiningCommonsMenuItem/all",
        ),
      );
      expect(consoleError).toHaveBeenCalled();
      expect(screen.getByText("Dining Commons Code")).toBeInTheDocument();
      expect(
        screen.queryByTestId(
          "UCSBDiningCommonsMenuItemTable-cell-row-0-col-id",
        ),
      ).not.toBeInTheDocument();
    } finally {
      consoleError.mockRestore();
    }
  });

  test("admin deletion uses the menu item endpoint and refreshes the table", async () => {
    const items = ucsbDiningCommonsMenuItemFixtures.threeMenuItems;
    let remainingItems = items;
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/UCSBDiningCommonsMenuItem/all")
      .reply(() => [200, remainingItems]);
    axiosMock.onDelete("/api/UCSBDiningCommonsMenuItem").reply(() => {
      remainingItems = items.slice(1);
      return [200, { message: "Menu item deleted successfully" }];
    });
    renderPage();
    const deleteButton = await screen.findByTestId(
      "UCSBDiningCommonsMenuItemTable-cell-row-0-col-Delete-button",
    );
    expect(
      screen.getByTestId(
        "UCSBDiningCommonsMenuItemTable-cell-row-0-col-Edit-button",
      ),
    ).toBeInTheDocument();
    fireEvent.click(deleteButton);
    await waitFor(() => expect(axiosMock.history.delete).toHaveLength(1));
    expect(axiosMock.history.delete[0].url).toBe(
      "/api/UCSBDiningCommonsMenuItem",
    );
    expect(axiosMock.history.delete[0].params).toEqual({ id: items[0].id });
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith({
        message: "Menu item deleted successfully",
      }),
    );
    await waitFor(() =>
      expect(screen.queryByText(items[0].name)).not.toBeInTheDocument(),
    );
    expect(screen.getByText(items[1].name)).toBeInTheDocument();
  });
});
