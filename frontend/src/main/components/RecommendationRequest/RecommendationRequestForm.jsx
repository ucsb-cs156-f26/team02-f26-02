import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function RecommendationRequestForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm({ defaultValues: { done: false, ...initialContents } });
  const navigate = useNavigate();
  const testIdPrefix = "RecommendationRequestForm";
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return (
    <Form noValidate onSubmit={handleSubmit(submitAction)}>
      {initialContents && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">Id</Form.Label>
          <Form.Control
            id="id"
            data-testid={`${testIdPrefix}-id`}
            type="text"
            {...register("id")}
            value={initialContents.id}
            disabled
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label htmlFor="requesterEmail">Requester Email</Form.Label>
        <Form.Control
          id="requesterEmail"
          data-testid={`${testIdPrefix}-requesterEmail`}
          type="email"
          isInvalid={Boolean(errors.requesterEmail)}
          {...register("requesterEmail", {
            required: "Requester email is required.",
            pattern: {
              value: emailPattern,
              message: "Enter a valid email address.",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.requesterEmail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="professorEmail">Professor Email</Form.Label>
        <Form.Control
          id="professorEmail"
          data-testid={`${testIdPrefix}-professorEmail`}
          type="email"
          isInvalid={Boolean(errors.professorEmail)}
          {...register("professorEmail", {
            required: "Professor email is required.",
            pattern: {
              value: emailPattern,
              message: "Enter a valid email address.",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.professorEmail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="explanation">Explanation</Form.Label>
        <Form.Control
          id="explanation"
          data-testid={`${testIdPrefix}-explanation`}
          as="textarea"
          rows={3}
          isInvalid={Boolean(errors.explanation)}
          {...register("explanation", {
            validate: (value) =>
              Boolean(value.trim()) || "Explanation is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.explanation?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateRequested">Date Requested</Form.Label>
        <Form.Control
          id="dateRequested"
          data-testid={`${testIdPrefix}-dateRequested`}
          type="datetime-local"
          step="1"
          isInvalid={Boolean(errors.dateRequested)}
          {...register("dateRequested", {
            required: "Date requested is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateRequested?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateNeeded">Date Needed</Form.Label>
        <Form.Control
          id="dateNeeded"
          data-testid={`${testIdPrefix}-dateNeeded`}
          type="datetime-local"
          step="1"
          isInvalid={Boolean(errors.dateNeeded)}
          {...register("dateNeeded", {
            required: "Date needed is required.",
            validate: (value) =>
              new Date(value) > new Date(getValues("dateRequested")) ||
              "Date needed must be after date requested.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateNeeded?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          id="done"
          data-testid={`${testIdPrefix}-done`}
          type="checkbox"
          label="Done"
          {...register("done")}
        />
      </Form.Group>

      <Button type="submit" data-testid={`${testIdPrefix}-submit`}>
        {buttonLabel}
      </Button>
      <Button
        variant="secondary"
        onClick={() => navigate(-1)}
        data-testid={`${testIdPrefix}-cancel`}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default RecommendationRequestForm;
