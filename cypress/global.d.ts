/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    waitForApp(): Chainable<void>;
    safeClick(): Chainable<void>;
    visitWithWait(url: string): Chainable<void>;
    login(email?: string, password?: string): Chainable<void>;
    addIngredientToConstructor(ingredientName: string): Chainable<void>;
    checkModal(title: string): Chainable<void>;
    closeModal(): Chainable<void>;
  }
}

// Для использования fixture с TypeScript
declare module '*/ingredients.json' {
  const value: {
    success: boolean;
    data: Array<{
      _id: string;
      name: string;
      type: string;
      proteins: number;
      fat: number;
      carbohydrates: number;
      calories: number;
      price: number;
      image: string;
      image_mobile: string;
      image_large: string;
    }>;
  };
  export default value;
}

declare module '*/user.json' {
  const value: {
    success: boolean;
    user: {
      email: string;
      name: string;
    };
  };
  export default value;
}

declare module '*/order.json' {
  const value: {
    success: boolean;
    name: string;
    order: {
      number: number;
    };
  };
  export default value;
}
