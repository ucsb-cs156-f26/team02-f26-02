const menuItemReviewFixtures = {
  oneMenuItemReview: {
    id: 1,
    itemId: 12,
    reviewerEmail: "user@ucsb.edu",
    stars: 5,
    dateReviewed: "2026-10-03T00:00:00",
    comments: "This menu item tastes amazing!",
  },
  threeMenuItemReviews: [
    {
      id: 1,
      itemId: 12,
      reviewerEmail: "user@ucsb.edu",
      stars: 5,
      dateReviewed: "2026-10-03T00:00:00",
      comments: "This menu item tastes amazing!",
    },
    {
      id: 2,
      itemId: 15,
      reviewerEmail: "user2@ucsb.edu",
      stars: 3,
      dateReviewed: "2026-10-05T00:00:00",
      comments: "This menu item tastes okay.",
    },
    {
      id: 3,
      itemId: 15,
      reviewerEmail: "user3@ucsb.edu",
      stars: 1,
      dateReviewed: "2026-10-06T00:00:00",
      comments: "This menu item tastes bad.",
    },
  ],
};

export { menuItemReviewFixtures };
