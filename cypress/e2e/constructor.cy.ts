describe('Ingredients API Intercept', () => {
  beforeEach(() => {
    // Перехват GET запроса за ингредиентами
    cy.intercept('GET', 'https://norma.education-services.ru/api/ingredients', {
      fixture: 'ingredients.json'
    }).as('getIngredients');

    // Перехват запроса за пользователем (ОБЯЗАТЕЛЬНО!)
    cy.intercept('GET', '**/api/auth/user', {
      fixture: 'user.json'
    }).as('getUser');

    // Перехват POST запроса создания заказа
    cy.intercept('POST', 'https://norma.education-services.ru/api/orders', {
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

  it('should intercept ingredients API and return mock data', () => {
    // Просто проверяем, что запрос был перехвачен
    cy.get('@getIngredients.all').should('have.length', 4);

    // И что данные отображаются
    cy.contains('Краторная булка N-200i').should('be.visible');
  });

  it('should add bun to constructor', () => {
    // Находим элемент с ингредиентом (булкой)
    cy.contains(/краторная/i)
      .parents('div, li, article')
      .first()
      .within(() => {
        // Нажимаем на кнопку "Добавить"
        cy.get('button').contains('Добавить').click();
      });

    // Проверяем, что булка была добавлена в конструктор
    cy.contains(/верх/i).should('be.visible');
    cy.contains(/низ/i).should('be.visible');

    cy.contains(/биокотлета/i)
      .parents('div, li, article')
      .first()
      .within(() => {
        cy.get('button').contains('Добавить').click();
      });

    // Ищем в правой колонке (конструкторе)
    cy.contains(/Соус Spicy-X/i).should('be.visible');

    cy.contains(/Соус Spicy-X/i)
      .parents('div, li, article')
      .first()
      .within(() => {
        cy.get('button').contains('Добавить').click();
      });

    // Ищем в правой колонке (конструкторе)
    cy.contains(/Соус Spicy-X/i).should('be.visible');
  });

  it('should open ingredient modal on click', () => {
    // Кликаем на ингредиент - ищем по тексту
    cy.contains(/краторная/i).click();

    // Модальное окно можно найти по тексту заголовка
    cy.contains('Детали ингредиента', { timeout: 5000 }).should('be.visible');

    cy.get('button').then(($buttons) => {
      // Ищем по классу, который может содержать "close"
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
    cy.contains(/краторная/i, { timeout: 10000 })
      .should('be.visible')
      .parents('div, li, article')
      .first()
      .within(() => {
        // Ждем пока кнопка станет видимой
        cy.get('button')
          .contains('Добавить', { timeout: 5000 })
          .should('be.visible')
          .click();
      });

    // 2. Проверяем булку в конструкторе
    cy.contains(/верх/i, { timeout: 5000 }).should('be.visible');
    cy.contains(/низ/i, { timeout: 5000 }).should('be.visible');

    // 3. Добавляем начинку
    cy.contains(/биокотлета/i, { timeout: 5000 })
      .should('be.visible')
      .parents('div, li, article')
      .first()
      .within(() => {
        cy.get('button')
          .contains('Добавить', { timeout: 5000 })
          .should('be.visible')
          .click();
      });

    // 4. Проверяем начинку в конструкторе
    cy.contains('Биокотлета из марсианской Магнолии', { timeout: 5000 }).should(
      'be.visible'
    );

    // 5. Добавляем соус
    cy.contains(/Соус Spicy-X/i, { timeout: 5000 })
      .should('be.visible')
      .parents('div, li, article')
      .first()
      .within(() => {
        cy.get('button')
          .contains('Добавить', { timeout: 5000 })
          .should('be.visible')
          .click();
      });

    // 6. Проверяем соус в конструкторе
    cy.contains('Соус Spicy-X', { timeout: 5000 }).should('be.visible');

    // 7. Проверяем что кнопка заказа активна
    cy.contains('button', /оформить заказ/i, { timeout: 5000 })
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    // 8. Ждем создания заказа с увеличенным таймаутом
    cy.wait('@createOrder', { timeout: 15000 }).then((interception) => {
      const orderNumber = interception.response?.body.order.number;

      // 9. Проверяем модальное окно
      cy.contains('идентификатор заказа', { timeout: 10000 }).should(
        'be.visible'
      );

      cy.contains(orderNumber.toString(), { timeout: 5000 }).should(
        'be.visible'
      );

      cy.contains('Ваш заказ начали готовить', { timeout: 5000 }).should(
        'be.visible'
      );

      cy.contains('Дождитесь готовности на орбитальной станции', {
        timeout: 5000
      }).should('be.visible');
    });

    // 10. Закрываем модальное окно
    cy.get('body').click(10, 10);

    // 11. Проверяем закрытие
    cy.contains('идентификатор заказа', { timeout: 5000 }).should('not.exist');

    // 12. Проверяем очистку конструктора
    cy.contains('Выберите булки', { timeout: 5000 }).should('be.visible');

    cy.contains('Выберите начинку', { timeout: 5000 }).should('be.visible');
  });
});
