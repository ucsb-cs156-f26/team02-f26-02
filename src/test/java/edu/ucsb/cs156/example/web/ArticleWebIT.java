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
public class ArticleWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_article() throws Exception {
    setupUser(true);

    page.getByText("Articles").click();

    page.getByText("Create Article").click();
    assertThat(page.getByText("Create New Article")).isVisible();
    page.getByTestId("ArticlesForm-title").fill("Introduction to Java");
    page.getByTestId("ArticlesForm-url").fill("https://example.com/introduction-to-java");
    page.getByTestId("ArticlesForm-explanation").fill("An overview of Java programming basics.");
    page.getByTestId("ArticlesForm-email").fill("student@ucsb.edu");
    page.getByTestId("ArticlesForm-dateAdded").fill("2026-11-01T12:00");
    page.getByTestId("ArticlesForm-submit").click();

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title"))
        .hasText("Introduction to Java");
    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-url"))
        .hasText("https://example.com/introduction-to-java");
    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-explanation"))
        .hasText("An overview of Java programming basics.");
    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-email")).hasText("student@ucsb.edu");
    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-dateAdded"))
        .hasText("2026-11-01T12:00:00");

    page.getByTestId("ArticlesTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Article")).isVisible();
    page.getByTestId("ArticlesForm-explanation")
        .fill("An updated introduction to Java programming.");
    page.getByTestId("ArticlesForm-submit").click();

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-explanation"))
        .hasText("An updated introduction to Java programming.");

    page.getByTestId("ArticlesTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_article() throws Exception {
    setupUser(false);

    page.getByText("Articles").click();

    assertThat(page.getByText("Create Article")).not().isVisible();
    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).not().isVisible();
  }
}
