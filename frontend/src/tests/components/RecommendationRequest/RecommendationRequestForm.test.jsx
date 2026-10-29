import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return { ...originalModule, useNavigate: () => mockedNavigate };
});

const renderForm = (props = {}) =>
  render(
    <Router>
      <RecommendationRequestForm submitAction={vi.fn()} {...props} />
    </Router>,
  );

describe("RecommendationRequestForm", () => {
  beforeEach(() => mockedNavigate.mockClear());

  test("create mode shows every editable field without an id", () => {
    renderForm();

    expect(screen.queryByLabelText("Id")).not.toBeInTheDocument();
    for (const field of [
      "requesterEmail",
      "professorEmail",
      "explanation",
      "dateRequested",
      "dateNeeded",
      "done",
      "submit",
      "cancel",
    ]) {
      expect(
        screen.getByTestId(`RecommendationRequestForm-${field}`),
      ).toBeInTheDocument();
    }
    expect(screen.getByLabelText("Requester Email")).toHaveAttribute(
      "type",
      "email",
    );
    expect(screen.getByLabelText("Professor Email")).toHaveAttribute(
      "type",
      "email",
    );
    expect(screen.getByLabelText("Explanation")).toBeInTheDocument();
    expect(screen.getByLabelText("Date Requested")).toHaveAttribute(
      "type",
      "datetime-local",
    );
    expect(screen.getByLabelText("Date Needed")).toHaveAttribute(
      "type",
      "datetime-local",
    );
    expect(screen.getByRole("checkbox", { name: "Done" })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  test("edit mode prepopulates fields and shows a read-only id", () => {
    renderForm({
      initialContents: recommendationRequestFixtures.oneRecommendationRequest,
      buttonLabel: "Update",
    });

    expect(screen.getByLabelText("Id")).toHaveValue("1");
    expect(screen.getByTestId("RecommendationRequestForm-id")).toBeDisabled();
    expect(screen.getByLabelText("Id")).toBeDisabled();
    expect(screen.getByLabelText("Requester Email")).toHaveValue(
      "student1@ucsb.edu",
    );
    expect(screen.getByLabelText("Professor Email")).toHaveValue(
      "professor1@ucsb.edu",
    );
    expect(screen.getByLabelText("Explanation")).toHaveValue(
      "Applying to graduate school",
    );
    expect(screen.getByLabelText("Date Requested")).toHaveValue(
      "2026-10-21T12:00",
    );
    expect(screen.getByLabelText("Date Needed")).toHaveValue(
      "2026-11-01T12:00",
    );
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
  });

  test("required fields show errors instead of submitting an empty form", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findByText("Requester email is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Professor email is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();
    expect(screen.getByText("Date requested is required.")).toBeInTheDocument();
    expect(screen.getByText("Date needed is required.")).toBeInTheDocument();
    expect(submitAction).not.toHaveBeenCalled();
  });

  test("invalid emails and an earlier needed date show validation errors", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("Requester Email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByLabelText("Professor Email"), {
      target: { value: "also-not-an-email" },
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "Graduate application" },
    });
    fireEvent.change(screen.getByLabelText("Date Requested"), {
      target: { value: "2026-11-01T12:00" },
    });
    fireEvent.change(screen.getByLabelText("Date Needed"), {
      target: { value: "2026-10-21T12:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findAllByText("Enter a valid email address."),
    ).toHaveLength(2);
    expect(
      screen.getByText("Date needed must be after date requested."),
    ).toBeInTheDocument();
  });

  test.each(["extra student@ucsb.edu", "student@ucsb.edu extra"])(
    "rejects an email with extra characters: %s",
    async (email) => {
      renderForm();
      fireEvent.change(screen.getByLabelText("Requester Email"), {
        target: { value: email },
      });
      fireEvent.click(screen.getByRole("button", { name: "Create" }));
      expect(
        await screen.findByText("Enter a valid email address."),
      ).toBeInTheDocument();
    },
  );

  test("rejects a whitespace-only explanation and equal dates", async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "   " },
    });
    fireEvent.change(screen.getByLabelText("Date Requested"), {
      target: { value: "2026-11-01T12:00" },
    });
    fireEvent.change(screen.getByLabelText("Date Needed"), {
      target: { value: "2026-11-01T12:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(
      await screen.findByText("Explanation is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Date needed must be after date requested."),
    ).toBeInTheDocument();
  });

  test("valid values are passed to submitAction", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    fireEvent.change(screen.getByLabelText("Requester Email"), {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Professor Email"), {
      target: { value: "professor@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "Graduate application" },
    });
    fireEvent.change(screen.getByLabelText("Date Requested"), {
      target: { value: "2026-10-21T12:00" },
    });
    fireEvent.change(screen.getByLabelText("Date Needed"), {
      target: { value: "2026-11-01T12:00" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Done" }));
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() =>
      expect(submitAction).toHaveBeenCalledWith(
        expect.objectContaining({
          requesterEmail: "student@ucsb.edu",
          professorEmail: "professor@ucsb.edu",
          explanation: "Graduate application",
          dateRequested: "2026-10-21T12:00",
          dateNeeded: "2026-11-01T12:00",
          done: true,
        }),
        expect.anything(),
      ),
    );
  });

  test("cancel returns to the previous page", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
