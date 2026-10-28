import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBOrganizationForm tests", () => {
  const testId = "UCSBOrganizationForm";

  const expectedHeaders = [
    "Organization Code",
    "Short Organization Name",
    "Organization Name",
    "Inactive",
  ];

  test("renders correctly with no initialContents", () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    expect(screen.getByText("Create")).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-orgCode`)).toBeEnabled();
    expect(screen.getByTestId(`${testId}-inactive`)).not.toBeChecked();
  });

  test("renders correctly with initialContents", () => {
    render(
      <Router>
        <UCSBOrganizationForm
          initialContents={ucsbOrganizationFixtures.oneOrganization}
          buttonLabel="Update"
        />
      </Router>,
    );

    expect(screen.getByText("Update")).toBeInTheDocument();

    expect(screen.getByTestId(`${testId}-orgCode`)).toBeDisabled();
    expect(screen.getByTestId(`${testId}-orgCode`)).toHaveValue("ENGR");

    expect(screen.getByTestId(`${testId}-orgTranslationShort`)).toHaveValue(
      "Engineering",
    );

    expect(screen.getByTestId(`${testId}-orgTranslation`)).toHaveValue(
      "College of Engineering",
    );
  });

  test("Cancel button navigates back", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    fireEvent.click(screen.getByTestId(`${testId}-cancel`));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(-1);
    });
  });

  test("validates required fields", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Organization Code is required."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Short Organization Name is required."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Organization Name is required."),
    ).toBeInTheDocument();
  });

  test("submits valid form data", async () => {
    const submitAction = vi.fn();

    render(
      <Router>
        <UCSBOrganizationForm submitAction={submitAction} />
      </Router>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-orgCode`), {
      target: { value: "ENGR" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-orgTranslationShort`), {
      target: { value: "Engineering" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-orgTranslation`), {
      target: { value: "College of Engineering" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-inactive`));
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith(
        {
          orgCode: "ENGR",
          orgTranslationShort: "Engineering",
          orgTranslation: "College of Engineering",
          inactive: true,
        },
        expect.anything(),
      );
    });
  });
});
