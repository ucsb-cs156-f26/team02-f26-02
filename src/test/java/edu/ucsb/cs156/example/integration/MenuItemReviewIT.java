package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.MenuItemReview;
import edu.ucsb.cs156.example.repositories.MenuItemReviewRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class MenuItemReviewIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired MenuItemReviewRepository menuItemReviewRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {

    // arrange: Create a mock MenuItemReview
    LocalDateTime ldt1 = LocalDateTime.parse("2026-10-12T00:00:00");

    MenuItemReview menuItemReview =
        MenuItemReview.builder()
            .itemId(5)
            .reviewerEmail("reviewer@ucsb.edu")
            .stars(3)
            .dateReviewed(ldt1)
            .comments("Tastes okay.")
            .build();

    menuItemReviewRepository.save(menuItemReview);

    // act: Get the MenuItemReview using the GET endpoint
    MvcResult response =
        mockMvc
            .perform(get("/api/menuitemreview?id=" + menuItemReview.getId()))
            .andExpect(status().isOk())
            .andReturn();

    // assert: Test that the created MenuItemReview was able to be retrived using GET
    String expectedJson = mapper.writeValueAsString(menuItemReview);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_menuitemreview() throws Exception {

    // arrange: Create a mock MenuItemReview
    LocalDateTime ldt1 = LocalDateTime.parse("2026-10-08T00:00:00");

    MenuItemReview menuItemReview1 =
        MenuItemReview.builder()
            .id(1L)
            .itemId(1)
            .reviewerEmail("user@ucsb.edu")
            .stars(5)
            .dateReviewed(ldt1)
            .comments("Tastes great!")
            .build();

    // act: Create a MenuItemReview using the POST endpoint
    MvcResult response =
        mockMvc
            .perform(
                post("/api/menuitemreview/post")
                    .param("itemId", "1")
                    .param("reviewerEmail", "user@ucsb.edu")
                    .param("stars", "5")
                    .param("dateReviewed", "2026-10-08T00:00:00")
                    .param("comments", "Tastes great!")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert: Test that the MenuItemReview was created correctly
    String expectedJson = mapper.writeValueAsString(menuItemReview1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }
}
