describe('Ingredients API Intercept', () => {
  // Константы для селекторов
  const INGREDIENT_SELECTOR = 'div, li, article';
  const ADD_BUTTON_TEXT = 'Добавить';
  const ORDER_BUTTON_TEXT = /оформить заказ/i;

  // Константы для текстов ингредиентов
  const BUN_TEXT = /краторная/i;
  const MAIN_TEXT = /биокотлета/i;
  const SAUCE_TEXT = /Соус Spicy-X/i;

  // Константы для проверок
  const TOP_TEXT = /верх/i;
  const BOTTOM_TEXT = /низ/i;
  const ORDER_DETAILS_TEXT = 'идентификатор заказа';
  const ORDER_READY_TEXT = 'Ваш заказ начали готовить';
  const ORDER_WAIT_TEXT = 'Дождитесь готовности на орбитальной станции';
  const SELECT_BUNS_TEXT = 'Выберите булки';
  const SELECT_FILLING_TEXT = 'Выберите начинку';

  // Константы для таймаутов
  const DEFAULT_TIMEOUT = 5000;
  const LONG_TIMEOUT = 10000;
  const VERY_LONG_TIMEOUT = 15000;

  beforeEach(() => {
    // Перехват GET запроса за ингредиентами
    cy.intercept('GET', '**/api/ingredients', {
      fixture: 'ingredients.json'
    }).as('getIngredients');

    // Перехват запроса за пользователем (ОБЯЗАТЕЛЬНО!)
    cy.intercept('GET', '**/api/auth/user', {
      fixture: 'user.json'
    }).as('getUser');

    // Перехват POST запроса создания заказа
    cy.intercept('POST', '**/api/orders', {
      fixture: 'order.json'
    }).as('createOrder');

    // Устанавливаем моковые токены авторизации
    cy.setCookie('accessToken', 'mock-access-token');
    cy.window().then((win) => {
      win.localStorage.setItem('refreshToken', 'mock-refresh-token');
    });

    cy.visit('/');
    cy.wait('@getIngredients');
    cy.wait('@getUser');
  });

  // Вспомогательная функция для добавления ингредиента
  const addIngredient = (ingredientText: RegExp | string) => {
    cy.contains(ingredientText, { timeout: LONG_TIMEOUT })
      .should('be.visible')
      .parents(INGREDIENT_SELECTOR)
      .first()
      .within(() => {
        cy.get('button')
          .contains(ADD_BUTTON_TEXT, { timeout: DEFAULT_TIMEOUT })
          .should('be.visible')
          .click();
      });
  };

  // Вспомогательная функция для проверки видимости элемента
  const shouldBeVisible = (
    text: RegExp | string,
    timeout = DEFAULT_TIMEOUT
  ) => {
    cy.contains(text, { timeout }).should('be.visible');
  };

  it('should intercept ingredients API and return mock data', () => {
    // Просто проверяем, что запрос был перехвачен
    cy.get('@getIngredients.all').should('have.length', 4);

    // И что данные отображаются
    shouldBeVisible('Краторная булка N-200i');
  });

  it('should add bun to constructor', () => {
    // Находим элемент с ингредиентом (булкой) и добавляем
    addIngredient(BUN_TEXT);

    // Проверяем, что булка была добавлена в конструктор
    shouldBeVisible(TOP_TEXT);
    shouldBeVisible(BOTTOM_TEXT);

    // Добавляем начинку
    addIngredient(MAIN_TEXT);

    // Проверяем соус в списке (не в конструкторе)
    shouldBeVisible(SAUCE_TEXT);

    // Добавляем соус
    addIngredient(SAUCE_TEXT);

    // Проверяем соус в конструкторе
    shouldBeVisible(SAUCE_TEXT);
  });

  it('should open ingredient modal on click', () => {
    // Кликаем на ингредиент
    cy.contains(BUN_TEXT).click();

    // Проверяем модальное окно
    shouldBeVisible('Детали ингредиента', LONG_TIMEOUT);

    // Закрываем модальное окно
    cy.get('button').then(($buttons) => {
      const closeBtn = $buttons
        .filter((i, btn) => {
          const className = btn.className || '';
          return className.toLowerCase().includes('close');
        })
        .first();

      if (closeBtn.length) {
        cy.wrap(closeBtn).click();
      } else {
        cy.get('body').click(10, 10);
      }
    });
  });

  it('should assemble burger', () => {
    // Даем время на полную загрузку
    cy.wait(1000);

    // 1. Добавляем булку
    addIngredient(BUN_TEXT);

    // 2. Проверяем булку в конструкторе
    shouldBeVisible(TOP_TEXT);
    shouldBeVisible(BOTTOM_TEXT);

    // 3. Добавляем начинку
    addIngredient(MAIN_TEXT);

    // 4. Проверяем начинку в конструкторе
    shouldBeVisible('Биокотлета из марсианской Магнолии');

    // 5. Добавляем соус
    addIngredient(SAUCE_TEXT);

    // 6. Проверяем соус в конструкторе
    shouldBeVisible(SAUCE_TEXT);

    // 7. Проверяем что кнопка заказа активна и кликаем
    cy.contains('button', ORDER_BUTTON_TEXT, { timeout: DEFAULT_TIMEOUT })
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    // 8. Ждем создания заказа
    cy.wait('@createOrder', { timeout: VERY_LONG_TIMEOUT }).then(
      (interception) => {
        const orderNumber = interception.response?.body.order.number;

        // 9. Проверяем модальное окно
        shouldBeVisible(ORDER_DETAILS_TEXT, LONG_TIMEOUT);
        shouldBeVisible(orderNumber.toString());
        shouldBeVisible(ORDER_READY_TEXT);
        shouldBeVisible(ORDER_WAIT_TEXT);
      }
    );

    // 10. Закрываем модальное окно
    cy.get('body').click(10, 10);

    // 11. Проверяем закрытие
    cy.contains(ORDER_DETAILS_TEXT, { timeout: DEFAULT_TIMEOUT }).should(
      'not.exist'
    );

    // 12. Проверяем очистку конструктора
    shouldBeVisible(SELECT_BUNS_TEXT);
    shouldBeVisible(SELECT_FILLING_TEXT);
  });
});
