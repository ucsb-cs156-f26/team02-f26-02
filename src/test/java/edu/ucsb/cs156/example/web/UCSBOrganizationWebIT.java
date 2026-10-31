package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class UCSBOrganizationWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_edit_delete_organization() throws Exception {
    setupUser(true);

    page.navigate("http://localhost:8080/ucsborganization");

    page.getByText("Create UCSBOrganization").click();

    page.getByTestId("UCSBOrganizationForm-orgCode").fill("TEST");
    page.getByTestId("UCSBOrganizationForm-orgTranslationShort").fill("Test Org");
    page.getByTestId("UCSBOrganizationForm-orgTranslation").fill("Test Organization");
    page.getByTestId("UCSBOrganizationForm-submit").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).hasText("TEST");

    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Edit-button").click();

    page.getByTestId("UCSBOrganizationForm-orgTranslation").fill("Updated Organization");
    page.getByTestId("UCSBOrganizationForm-submit").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslation"))
        .hasText("Updated Organization");

    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_organization() throws Exception {
    setupUser(false);

    page.navigate("http://localhost:8080/ucsborganization");

    assertThat(page.getByText("Create UCSBOrganization")).not().isVisible();
  }
}
