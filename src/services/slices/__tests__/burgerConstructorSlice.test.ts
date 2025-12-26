import reducer, {
  addBun,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
  TConstructorIngredientWithId
} from '../burgerConstructorSlice';

import { TIngredient } from '@utils-types';

// Моковые данные для тестов
const mockBun: TIngredient = {
  _id: '643d69a5c3f7b9001cfa093c',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'https://code.s3.yandex.net/react/code/bun-02.png',
  image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png'
};

const mockMainIngredient: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской Магнолии',
  type: 'main',
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'https://code.s3.yandex.net/react/code/meat-01.png',
  image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png'
};

const mockSauce: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0942',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'https://code.s3.yandex.net/react/code/sauce-02.png',
  image_large: 'https://code.s3.yandex.net/react/code/sauce-02-large.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/sauce-02-mobile.png'
};

describe('Burger Constructor Slice', () => {
  describe('Initial State', () => {
    it('should return initial state', () => {
      const state = reducer(undefined, { type: 'unknown' });

      expect(state).toEqual({
        bun: null,
        ingredients: []
      });
    });
  });

  describe('addBun action', () => {
    it('should add bun to state', () => {
      const state = reducer(undefined, addBun(mockBun));

      expect(state.bun).toEqual(mockBun);
      expect(state.ingredients).toEqual([]);
    });

    it('should replace existing bun when adding new one', () => {
      const initialState = { bun: mockBun, ingredients: [] };
      const newBun = { ...mockBun, _id: 'new-bun-id', name: 'Новая булка' };

      const state = reducer(initialState, addBun(newBun));

      expect(state.bun).toEqual(newBun);
      expect(state.bun?._id).toBe('new-bun-id');
      expect(state.ingredients).toEqual([]);
    });
  });

  describe('addIngredient action', () => {
    it('should add ingredient with generated unique id', () => {
      const state = reducer(undefined, addIngredient(mockMainIngredient));

      expect(state.ingredients).toHaveLength(1);

      const addedIngredient = state.ingredients[0];
      expect(addedIngredient).toMatchObject({
        ...mockMainIngredient,
        id: expect.any(String) // Должен быть сгенерирован уникальный id
      });

      // Проверяем что id действительно уникальный (nanoid)
      expect(addedIngredient.id).not.toBe(mockMainIngredient._id);
      expect(addedIngredient.id.length).toBeGreaterThan(0);
    });

    it('should add multiple ingredients preserving order', () => {
      let state = reducer(undefined, addIngredient(mockMainIngredient));
      state = reducer(state, addIngredient(mockSauce));

      expect(state.ingredients).toHaveLength(2);

      // Проверяем порядок добавления
      expect(state.ingredients[0].name).toBe(
        'Биокотлета из марсианской Магнолии'
      );
      expect(state.ingredients[1].name).toBe('Соус Spicy-X');

      // Проверяем что у каждого свой уникальный id
      expect(state.ingredients[0].id).not.toBe(state.ingredients[1].id);
    });

    it('should not affect bun when adding ingredients', () => {
      const initialState = { bun: mockBun, ingredients: [] };

      const state = reducer(initialState, addIngredient(mockMainIngredient));

      expect(state.bun).toEqual(mockBun); // Булка не меняется
      expect(state.ingredients).toHaveLength(1);
    });
  });

  describe('removeIngredient action', () => {
    it('should remove ingredient by id', () => {
      const ingredients: TConstructorIngredientWithId[] = [
        { ...mockMainIngredient, id: 'id-1' },
        { ...mockSauce, id: 'id-2' },
        { ...mockMainIngredient, id: 'id-3' }
      ];

      const initialState = { bun: null, ingredients };

      const state = reducer(initialState, removeIngredient('id-2'));

      expect(state.ingredients).toHaveLength(2);
      expect(state.ingredients.map((i) => i.id)).toEqual(['id-1', 'id-3']);
    });

    it('should do nothing if ingredient id not found', () => {
      const ingredients: TConstructorIngredientWithId[] = [
        { ...mockMainIngredient, id: 'id-1' }
      ];

      const initialState = { bun: null, ingredients };

      const state = reducer(initialState, removeIngredient('non-existent-id'));

      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0].id).toBe('id-1');
    });

    it('should not affect bun when removing ingredients', () => {
      const ingredients: TConstructorIngredientWithId[] = [
        { ...mockMainIngredient, id: 'id-1' }
      ];

      const initialState = { bun: mockBun, ingredients };

      const state = reducer(initialState, removeIngredient('id-1'));

      expect(state.bun).toEqual(mockBun); // Булка не меняется
      expect(state.ingredients).toHaveLength(0);
    });
  });

  describe('moveIngredient action', () => {
    const ingredients: TConstructorIngredientWithId[] = [
      { ...mockMainIngredient, id: 'id-1' },
      { ...mockSauce, id: 'id-2' },
      { ...mockMainIngredient, id: 'id-3' }
    ];

    it('should move ingredient down (from index 0 to index 1)', () => {
      const initialState = { bun: null, ingredients };

      const state = reducer(
        initialState,
        moveIngredient({ fromIndex: 0, toIndex: 1 })
      );

      // id-1 и id-2 поменялись местами
      expect(state.ingredients.map((i) => i.id)).toEqual([
        'id-2',
        'id-1',
        'id-3'
      ]);
    });

    it('should move ingredient up (from index 2 to index 1)', () => {
      const initialState = { bun: null, ingredients };

      const state = reducer(
        initialState,
        moveIngredient({ fromIndex: 2, toIndex: 1 })
      );

      // id-2 и id-3 поменялись местами
      expect(state.ingredients.map((i) => i.id)).toEqual([
        'id-1',
        'id-3',
        'id-2'
      ]);
    });

    it('should not change order if indices are the same', () => {
      const initialState = { bun: null, ingredients };

      const state = reducer(
        initialState,
        moveIngredient({ fromIndex: 1, toIndex: 1 })
      );

      expect(state.ingredients.map((i) => i.id)).toEqual([
        'id-1',
        'id-2',
        'id-3'
      ]);
    });

    it('should handle moving to first position', () => {
      const initialState = { bun: null, ingredients };

      const state = reducer(
        initialState,
        moveIngredient({ fromIndex: 2, toIndex: 0 })
      );

      expect(state.ingredients.map((i) => i.id)).toEqual([
        'id-3',
        'id-1',
        'id-2'
      ]);
    });

    it('should handle moving to last position', () => {
      const initialState = { bun: null, ingredients };

      const state = reducer(
        initialState,
        moveIngredient({ fromIndex: 0, toIndex: 2 })
      );

      expect(state.ingredients.map((i) => i.id)).toEqual([
        'id-2',
        'id-3',
        'id-1'
      ]);
    });

    it('should not affect bun when moving ingredients', () => {
      const initialState = { bun: mockBun, ingredients };

      const state = reducer(
        initialState,
        moveIngredient({ fromIndex: 0, toIndex: 1 })
      );

      expect(state.bun).toEqual(mockBun); // Булка не меняется
      expect(state.ingredients).toHaveLength(3);
    });
  });

  describe('clearConstructor action', () => {
    it('should clear all ingredients and bun', () => {
      const ingredients: TConstructorIngredientWithId[] = [
        { ...mockMainIngredient, id: 'id-1' },
        { ...mockSauce, id: 'id-2' }
      ];

      const initialState = { bun: mockBun, ingredients };

      const state = reducer(initialState, clearConstructor());

      expect(state.bun).toBeNull();
      expect(state.ingredients).toHaveLength(0);
    });

    it('should work with empty constructor', () => {
      const initialState = { bun: null, ingredients: [] };

      const state = reducer(initialState, clearConstructor());

      expect(state.bun).toBeNull();
      expect(state.ingredients).toHaveLength(0);
    });
  });

  describe('Integration: Multiple actions', () => {
    it('should handle complex scenario', () => {
      let state = reducer(undefined, addBun(mockBun));

      state = reducer(state, addIngredient(mockMainIngredient));
      state = reducer(state, addIngredient(mockSauce));
      state = reducer(state, addIngredient(mockMainIngredient));

      expect(state.bun).toEqual(mockBun);
      expect(state.ingredients).toHaveLength(3);

      // Удаляем средний элемент
      const sauceId = state.ingredients[1].id;
      state = reducer(state, removeIngredient(sauceId));

      expect(state.ingredients).toHaveLength(2);
      expect(state.ingredients[0].type).toBe('main');
      expect(state.ingredients[1].type).toBe('main');

      // Перемещаем
      state = reducer(state, moveIngredient({ fromIndex: 1, toIndex: 0 }));

      // Очищаем
      state = reducer(state, clearConstructor());

      expect(state.bun).toBeNull();
      expect(state.ingredients).toHaveLength(0);
    });
  });
});
