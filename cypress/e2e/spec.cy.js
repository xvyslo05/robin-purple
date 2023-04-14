/*
  3. Automate your test scenarios in Cypress so that you won't have to test them manually next
time we make some changes to the app. If you don't have the time to write all the tests, don't worry.
However, make sure to submit at least a few Cypress tests that you consider to be the most
important.

and 

4. Write several Cypress tests in which you will use selected functions (cy.fixture, cy.intercept,
cy.request) and make appropriate assertions. For this task, you don’t have to necessarily use the
mock form.

cy.fixture() -> used as a import -> more readable than using cy.fixture(), by documentation it is a valid usage
cy.intercept() -> used to intercept the form submit request and check the data
cy.request() -> not used, but I would use it to check the form submit via API and then checking it in the administration -> see the it.skip() test as a proposal
*/

import * as formFixtures from "../fixtures/formFixtures.json";

describe("Robin - Intro task", () => {
  beforeEach(() => {
    cy.visit(formFixtures.env.formUrl);
  });

  function randomDepositNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
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
    if (firstName) cy.getById("lastname").type(firstName); // name bug reported in bugs.txt file
    if (phoneNumber) cy.getById("phone").type(phoneNumber);
    if (email) cy.getById("email").type(email);
    if (depositValue) cy.getById("deposit").type(depositValue);
    if (emailCheckbox) cy.getById("iAgreeDemo").check();
  }

  function submitFormAndCheckData({
    firstName,
    lastName,
    phoneNumber,
    country,
    platform,
    accountType,
    leverage,
    currency,
    depositValue,
  }) {
    cy.intercept("POST", formFixtures.env.submitUrl).as("formSubmit");
    cy.submitForm();
    cy.wait("@formSubmit")
      .its("request.body")
      .then((body) => {
        if (firstName) expect(body).to.include(`firstname=${firstName}`); // name bug reported in bugs.txt file
        if (lastName) expect(body).to.include(`lastname=${lastName}`);
        if (phoneNumber) expect(body).to.include(`phone=${phoneNumber}`);
        if (platform) expect(body).to.include(`platform=${platform}`);
        if (country) expect(body).to.include(`country=${country}`); // country bug reported in bugs.txt file
        if (accountType) expect(body).to.include(`accountType=${accountType}`);
        if (leverage) expect(body).to.include(`leverage=${leverage}`);
        if (currency) expect(body).to.include(`currency=${currency}`);
        if (depositValue) expect(body).to.include(`deposit=${depositValue}`);
        expect(body).to.include(`iAgreeDemo=on`);

        // if(email) expect(body).to.include(`email=${email}`);
        // TODO: not checking email because of missing @ in the email payload in submit request. This will need some workaround
      });
  }

  it("Check form mandatory fields cannot be blank", () => {
    const depositValue = randomDepositNumber(
      formFixtures.minDeposit,
      formFixtures.maxDeposit
    );

    trySubmitWithoutMandatoryData();
    cy.getById("lastname").type(formFixtures.user.firstName); // name bug reported in bugs.txt file

    trySubmitWithoutMandatoryData();
    cy.getById("phone").type(formFixtures.user.phoneNumber);

    trySubmitWithoutMandatoryData();
    cy.getById("email").type(formFixtures.user.email);

    trySubmitWithoutMandatoryData();
    cy.getById("deposit").type(depositValue);

    trySubmitWithoutMandatoryData();
    cy.getById("iAgreeDemo").check();

    submitFormAndCheckData({
      lastName: formFixtures.user.firstName,
      phoneNumber: formFixtures.user.phoneNumber,
      depositValue: depositValue,
    });
  });

  it("Check that firstName is in correct format", () => {
    fillMandatoryData({
      phoneNumber: formFixtures.user.phoneNumber,
      email: formFixtures.user.email,
      depositValue: randomDepositNumber(),
      emailCheckbox: true,
    });

    cy.getById("lastname").type(123);
    trySubmitWithoutMandatoryData();
  });

  it("Check that phoneNumber is in correct format", () => {
    fillMandatoryData({
      firstName: formFixtures.user.firstName,
      email: formFixtures.user.email,
      depositValue: randomDepositNumber(
        formFixtures.minDeposit,
        formFixtures.maxDeposit
      ),
      emailCheckbox: true,
    });

    cy.getById("phone").type("abc");
    trySubmitWithoutMandatoryData();
  });

  it("Check that email is in correct format", () => {
    fillMandatoryData({
      firstName: formFixtures.user.firstName,
      phoneNumber: formFixtures.user.phoneNumber,
      depositValue: randomDepositNumber(
        formFixtures.minDeposit,
        formFixtures.maxDeposit
      ),
      emailCheckbox: true,
    });

    cy.getById("email").type("foo");
    trySubmitWithoutMandatoryData();

    cy.getById("email").clear().type("@foo");
    trySubmitWithoutMandatoryData();

    cy.getById("email").clear().type("foo@");
    trySubmitWithoutMandatoryData();

    cy.getById("email").clear().type("foo@bar");
    trySubmitWithoutMandatoryData();

    cy.getById("email").clear().type("foo@bar.b");
    trySubmitWithoutMandatoryData();
  });

  it("Check that depositValue is in correct format", () => {
    fillMandatoryData({
      firstName: formFixtures.user.firstName,
      phoneNumber: formFixtures.user.phoneNumber,
      email: formFixtures.user.email,
      emailCheckbox: true,
    });

    cy.getById("deposit").type("abc");
    trySubmitWithoutMandatoryData();

    cy.getById("deposit").type(-22);
    trySubmitWithoutMandatoryData();

    cy.getById("deposit").type(
      randomDepositNumber(1, formFixtures.minDeposit - 1)
    );
    trySubmitWithoutMandatoryData();

    cy.getById("deposit")
      .clear()
      .type(
        randomDepositNumber(
          formFixtures.maxDeposit + 1,
          Number.MAX_SAFE_INTEGER
        )
      );
    trySubmitWithoutMandatoryData();
  });

  it("Check that lastName is in correct format", () => {
    fillMandatoryData({
      firstName: formFixtures.user.firstName,
      phoneNumber: formFixtures.user.phoneNumber,
      email: formFixtures.user.email,
      depositValue: randomDepositNumber(
        formFixtures.minDeposit,
        formFixtures.maxDeposit
      ),
      emailCheckbox: true,
    });

    cy.getById("firstname").type(123); // name bug reported in bugs.txt file
    trySubmitWithoutMandatoryData();
  });

  it("Happy path scenario", () => {
    const depositValue = randomDepositNumber(
      formFixtures.minDeposit,
      formFixtures.maxDeposit
    );

    fillMandatoryData({
      firstName: formFixtures.user.firstName,
      phoneNumber: formFixtures.user.phoneNumber,
      email: formFixtures.user.email,
      depositValue,
      emailCheckbox: true,
    });

    cy.getById("firstname").type(formFixtures.user.lastName); // name bug reported in bugs.txt file
    cy.getById("countryLabel").type(formFixtures.user.country); // country bug reported in bugs.txt file

    cy.getById("platform").select(formFixtures.product.platform[0]); // possibility to enhance this and all selects with a random number between the range of the options
    cy.getById("accountType").select(formFixtures.product.accountType[0]);
    cy.getById("leverage").select(formFixtures.product.leverage[0]);
    cy.getById("currency").select(formFixtures.product.currency[0]);

    submitFormAndCheckData({
      lastName: formFixtures.user.firstName,
      phoneNumber: formFixtures.user.phoneNumber,
      depositValue: depositValue,
      firstName: formFixtures.user.lastName,
      currency: formFixtures.product.currency[0],
      country: formFixtures.user.country, // country bug reported in bugs.txt file
    });
  });

  it.skip("Send form directly via API", () => {
    const depositValue = randomDepositNumber(
      formFixtures.minDeposit,
      formFixtures.maxDeposit
    );

    cy.request({
      method: "POST",
      url: formFixtures.env.submitUrl,
      body: {
        lastname: formFixtures.user.firstName,
        phone: formFixtures.user.phoneNumber,
        email: formFixtures.user.email,
        deposit: depositValue,
        iAgreeDemo: "on",
        platform: formFixtures.product.platform[0],
        accountType: formFixtures.product.accountType[0],
        leverage: formFixtures.product.leverage[0],
        currency: formFixtures.product.currency[0],
      },
    })
      .then((response) => {
        expect(response.status).to.eq(200);
      })
      .then(() => {
        cy.request({
          method: "GET",
          url: formFixtures.env.adminUrl,
          headers: {
            authorization: `Basic ${formFixtures.env.adminCredentials}`,
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.include({
            lastname: formFixtures.user.firstName,
            phone: formFixtures.user.phoneNumber,
            email: formFixtures.user.email,
            deposit: depositValue,
            platform: formFixtures.product.platform[0],
            accountType: formFixtures.product.accountType[0],
            leverage: formFixtures.product.leverage[0],
            currency: formFixtures.product.currency[0],
          });
        });
      });
  });
});
