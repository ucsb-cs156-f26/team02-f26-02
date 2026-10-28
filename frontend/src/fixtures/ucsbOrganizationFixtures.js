const ucsbOrganizationFixtures = {
  oneOrganization: {
    orgCode: "ENGR",
    orgTranslationShort: "Engineering",
    orgTranslation: "College of Engineering",
    inactive: false,
  },

  threeOrganizations: [
    {
      orgCode: "ENGR",
      orgTranslationShort: "Engineering",
      orgTranslation: "College of Engineering",
      inactive: false,
    },
    {
      orgCode: "LS",
      orgTranslationShort: "Letters and Science",
      orgTranslation: "College of Letters and Science",
      inactive: false,
    },
    {
      orgCode: "CCS",
      orgTranslationShort: "Creative Studies",
      orgTranslation: "College of Creative Studies",
      inactive: true,
    },
  ],
};

export { ucsbOrganizationFixtures };
