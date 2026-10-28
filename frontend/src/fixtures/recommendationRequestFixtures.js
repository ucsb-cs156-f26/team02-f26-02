const recommendationRequestFixtures = {
  oneRecommendationRequest: {
    id: 1,
    requesterEmail: "student1@ucsb.edu",
    professorEmail: "professor1@ucsb.edu",
    explanation: "Applying to graduate school",
    dateRequested: "2026-10-21T12:00:00",
    dateNeeded: "2026-11-01T12:00:00",
    done: false,
  },

  threeRecommendationRequests: [
    {
      id: 1,
      requesterEmail: "student1@ucsb.edu",
      professorEmail: "professor1@ucsb.edu",
      explanation: "Applying to graduate school",
      dateRequested: "2026-10-21T12:00:00",
      dateNeeded: "2026-11-01T12:00:00",
      done: false,
    },
    {
      id: 2,
      requesterEmail: "student2@ucsb.edu",
      professorEmail: "professor2@ucsb.edu",
      explanation: "Applying for a scholarship",
      dateRequested: "2026-10-22T09:30:00",
      dateNeeded: "2026-11-15T17:00:00",
      done: true,
    },
    {
      id: 3,
      requesterEmail: "student3@ucsb.edu",
      professorEmail: "professor3@ucsb.edu",
      explanation: "Applying for an internship",
      dateRequested: "2026-10-23T14:00:00",
      dateNeeded: "2026-12-01T12:00:00",
      done: false,
    },
  ],
};

export { recommendationRequestFixtures };