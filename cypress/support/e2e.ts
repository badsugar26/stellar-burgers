Cypress.on('uncaught:exception', (err, runnable) => {
  console.log('Uncaught exception:', err.message);
  return false;
});

// Очистка перед тестом
beforeEach(() => {
  // cy.clearCookies();
  // cy.clearLocalStorage();
});
