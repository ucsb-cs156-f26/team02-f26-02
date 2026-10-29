import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import UCSBDiningCommonsMenuItemEditPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

const mockToast = vi.fn();
const mockNavigate = vi.fn();
vi.mock("react-toastify", async (importOriginal) => ({
  ...(await importOriginal()),
  toast: (message) => mockToast(message),
}));
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: () => ({ id: "1" }),
  useNavigate: () => mockNavigate,
  Navigate: (props) => {
    mockNavigate(props);
    return null;
  },
}));

describe("UCSBDiningCommonsMenuItemEditPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const item = ucsbDiningCommonsMenuItemFixtures.oneMenuItem;
  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/UCSBDiningCommonsMenuItem", { params: { id: "1" } })
      .reply(200, item);
  });
  afterAll(() => axiosMock.restore());

  test("shows the heading without a form when the backend fails", async () => {
    axiosMock
      .onGet("/api/UCSBDiningCommonsMenuItem", { params: { id: "1" } })
      .timeout();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    try {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBDiningCommonsMenuItemEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      expect(
        screen.getByRole("heading", { name: "Edit UCSBDiningCommonsMenuItem" }),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith(
          "Error communicating with backend via GET on /api/UCSBDiningCommonsMenuItem",
        ),
      );
      expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Update" }),
      ).not.toBeInTheDocument();
      expect(axiosMock.history.put).toHaveLength(0);
      expect(mockNavigate).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  test.each([
    ["Name", "", "Name is required."],
    ["Dining Commons Code", "   ", "Dining Commons Code must not be blank."],
    ["Station", "a".repeat(256), "Station must be at most 255 characters."],
  ])("does not save invalid %s", async (label, value, message) => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    fireEvent.change(await screen.findByLabelText(label), {
      target: { value },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(axiosMock.history.put).toHaveLength(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("Cancel discards changes and navigates back", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    fireEvent.change(await screen.findByLabelText("Name"), {
      target: { value: "Unsaved change" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
    expect(axiosMock.history.put).toHaveLength(0);
  });

  test.each([false, true])(
    "loads and updates all fields (storybook=%s)",
    async (storybook) => {
      const updated = {
        name: "Vegetable Curry",
        diningCommonsCode: "carrillo",
        station: "Entrees",
      };
      axiosMock
        .onPut("/api/UCSBDiningCommonsMenuItem")
        .reply(200, { id: item.id, ...updated });
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            {storybook ? (
              <UCSBDiningCommonsMenuItemEditPage storybook={true} />
            ) : (
              <UCSBDiningCommonsMenuItemEditPage />
            )}
          </MemoryRouter>
        </QueryClientProvider>,
      );
      expect(await screen.findByLabelText("Id")).toHaveValue(String(item.id));
      expect(screen.getByLabelText("Id")).toHaveAttribute("readonly");
      for (const [field, label] of [
        ["name", "Name"],
        ["diningCommonsCode", "Dining Commons Code"],
        ["station", "Station"],
      ]) {
        expect(screen.getByLabelText(label)).toHaveValue(item[field]);
        fireEvent.change(screen.getByLabelText(label), {
          target: { value: updated[field] },
        });
      }
      fireEvent.click(screen.getByRole("button", { name: "Update" }));
      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith(
          "UCSBDiningCommonsMenuItem Updated - id: 1 name: Vegetable Curry",
        ),
      );
      expect(axiosMock.history.put).toHaveLength(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
      expect(JSON.parse(axiosMock.history.put[0].data)).toEqual(updated);
      await waitFor(() =>
        expect(mockNavigate.mock.calls.map(([props]) => props)).toEqual(
          storybook ? [] : [{ to: "/diningcommonsmenuitem" }],
        ),
      );
    },
  );
});
