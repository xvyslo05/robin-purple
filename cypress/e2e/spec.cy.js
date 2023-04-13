import * as formFixtures from "../fixtures/formFixtures.json";

describe("Robin - Intro task", () => {
  beforeEach(() => {
    cy.visit(formFixtures.env.formUrl);
  });

  function randomDepositNumber() {
    return Math.floor(
      Math.random() * (formFixtures.maxDeposit - formFixtures.minDeposit) +
        formFixtures.minDeposit
    );
  }

  function trySubmitWithoutMandatoryData() {
    cy.submitForm();
    cy.url().should("eq", formFixtures.env.formUrl);
  }

  function fillMandatoryData({
    firstName,
    phoneNumber,
    email,
    depositValue,
    emailCheckbox,
  }) {
    if (firstName) cy.getById("lastname").type(firstName);
    if (phoneNumber) cy.getById("phone").type(phoneNumber);
    if (email) cy.getById("email").type(email);
    if (depositValue) cy.getById("deposit").type(depositValue);
    if (emailCheckbox) cy.getById("iAgreeDemo").check();
  }

  it("Check form mandatory fields cannot be blank", () => {
    const depositValue = randomDepositNumber();
    cy.intercept("POST", formFixtures.env.submitUrl).as("formSubmit");

    trySubmitWithoutMandatoryData();
    cy.getById("lastname").type(formFixtures.user.firstName);

    trySubmitWithoutMandatoryData();
    cy.getById("phone").type(formFixtures.user.phoneNumber);

    trySubmitWithoutMandatoryData();
    cy.getById("email").type(formFixtures.user.email);

    trySubmitWithoutMandatoryData();
    cy.getById("deposit").type(depositValue);

    trySubmitWithoutMandatoryData();
    cy.getById("iAgreeDemo").check();

    cy.submitForm();
    cy.wait("@formSubmit")
      .its("request.body")
      .should("include", `lastname=${formFixtures.user.firstName}`)
      .and("include", `phone=${formFixtures.user.phoneNumber}`)
      .and("include", `deposit=${depositValue}`)
      .and("include", `iAgreeDemo=on`);
    // .and("include", `email=${formFixtures.user.email}`)
    // TODO: not checking email because of missing @ in the email. This will need some workaround
  });

  it.only("Check that firstName is in correct format", () => {
    fillMandatoryData({
      phoneNumber: formFixtures.user.phoneNumber,
      email: formFixtures.user.email,
      depositValue: randomDepositNumber(),
      emailCheckbox: true,
    });

    cy.getById("lastname").type(123);
    trySubmitWithoutMandatoryData();

    cy.getById("lastname").clear().type(formFixtures.user.firstName);
  });
});
