package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.example.entities.UCSBOrganization;
import edu.ucsb.cs156.example.repositories.UCSBOrganizationRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class UCSBOrganizationIT {

  @Autowired UCSBOrganizationRepository ucsbOrganizationRepository;

  @Autowired MockMvc mockMvc;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_create_organization() throws Exception {

    // Act: Create an organization through the API
    mockMvc
        .perform(
            post("/api/ucsborganization/post")
                .param("orgCode", "TEST")
                .param("orgTranslationShort", "Test Org")
                .param("orgTranslation", "Test Organization")
                .param("inactive", "false")
                .with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.orgCode").value("TEST"))
        .andExpect(jsonPath("$.orgTranslationShort").value("Test Org"));

    // Assert: Verify the organization was saved in the database
    UCSBOrganization saved = ucsbOrganizationRepository.findById("TEST").orElseThrow();

    assertEquals("Test Organization", saved.getOrgTranslation());
    assertFalse(saved.getInactive());
  }
}
