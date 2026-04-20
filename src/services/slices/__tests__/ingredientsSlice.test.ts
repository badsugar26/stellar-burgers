import reducer, {
  fetchIngredients,
  setCurrentIngredient,
  clearCurrentIngredient
} from '../ingredientsSlice';

import { TIngredient } from '@utils-types';

// Моковые данные ингредиентов
const mockIngredients: TIngredient[] = [
  {
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
  },
  {
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
  }
];

describe('Ingredients Slice', () => {
  describe('Initial State', () => {
    it('should return initial state', () => {
      const state = reducer(undefined, { type: 'unknown' });

      expect(state).toEqual({
        items: [],
        loading: false,
        error: null,
        currentIngredient: null
      });
    });
  });

  describe('fetchIngredients async thunk', () => {
    // 1. При вызове экшенаRequest булевая переменная loading меняется на true
    it('should set loading to true on pending', () => {
      const action = { type: fetchIngredients.pending.type };
      const state = reducer(undefined, action);

      expect(state).toEqual({
        items: [],
        loading: true, // loading стало true
        error: null,
        currentIngredient: null
      });
    });

    // 2. При вызове экшена Success данные записываются в стор и loading меняется на false
    it('should set ingredients data and loading to false on fulfilled', () => {
      const action = {
        type: fetchIngredients.fulfilled.type,
        payload: mockIngredients
      };

      const state = reducer(undefined, action);

      expect(state).toEqual({
        items: mockIngredients, // данные записались
        loading: false, // loading стало false
        error: null,
        currentIngredient: null
      });
    });

    // 3. При вызове экшена Failed ошибка записывается в стор и loading меняется на false
    it('should set error and loading to false on rejected', () => {
      const errorMessage = 'Ошибка загрузки ингредиентов';
      const action = {
        type: fetchIngredients.rejected.type,
        error: { message: errorMessage }
      };

      const state = reducer(undefined, action);

      expect(state).toEqual({
        items: [], // данные не загрузились
        loading: false, // loading стало false
        error: errorMessage, // ошибка записалась
        currentIngredient: null
      });
    });

    // 4. Тест на пользовательское сообщение об ошибке
    it('should use custom error message when provided', () => {
      const errorMessage = 'Сервер не отвечает';
      const action = {
        type: fetchIngredients.rejected.type,
        error: { message: errorMessage }
      };

      const state = reducer(undefined, action);

      expect(state.error).toBe(errorMessage);
      expect(state.loading).toBe(false);
    });

    // 5. Тест на дефолтное сообщение об ошибке
    it('should use default error message when no message provided', () => {
      const action = {
        type: fetchIngredients.rejected.type,
        error: {} // нет сообщения об ошибке
      };

      const state = reducer(undefined, action);

      expect(state.error).toBe('Ошибка загрузки ингредиентов');
      expect(state.loading).toBe(false);
    });

    // 6. Проверка полного цикла загрузки
    it('should handle full fetch cycle correctly', () => {
      let state = reducer(undefined, { type: '@@INIT' });
      expect(state.loading).toBe(false);
      expect(state.items).toEqual([]);

      // Начало загрузки
      state = reducer(state, { type: fetchIngredients.pending.type });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();

      // Успешная загрузка
      state = reducer(state, {
        type: fetchIngredients.fulfilled.type,
        payload: mockIngredients
      });
      expect(state.loading).toBe(false);
      expect(state.items).toEqual(mockIngredients);
      expect(state.error).toBeNull();
    });
  });

  describe('setCurrentIngredient action', () => {
    it('should set current ingredient', () => {
      const ingredient = mockIngredients[0];
      const state = reducer(undefined, setCurrentIngredient(ingredient));

      expect(state.currentIngredient).toEqual(ingredient);
      expect(state.items).toEqual([]); // items не меняются
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should replace existing current ingredient', () => {
      const initialState = {
        items: mockIngredients,
        loading: false,
        error: null,
        currentIngredient: mockIngredients[0]
      };

      const state = reducer(
        initialState,
        setCurrentIngredient(mockIngredients[1])
      );

      expect(state.currentIngredient).toEqual(mockIngredients[1]);
      expect(state.items).toEqual(mockIngredients); // items не меняются
    });
  });

  describe('clearCurrentIngredient action', () => {
    it('should clear current ingredient', () => {
      const initialState = {
        items: mockIngredients,
        loading: false,
        error: null,
        currentIngredient: mockIngredients[0]
      };

      const state = reducer(initialState, clearCurrentIngredient());

      expect(state.currentIngredient).toBeNull();
      expect(state.items).toEqual(mockIngredients); // items не меняются
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should do nothing when current ingredient is already null', () => {
      const initialState = {
        items: mockIngredients,
        loading: false,
        error: null,
        currentIngredient: null
      };

      const state = reducer(initialState, clearCurrentIngredient());

      expect(state.currentIngredient).toBeNull();
      expect(state).toEqual(initialState);
    });
  });

  describe('State immutability', () => {
    it('should not mutate other state properties when setting loading', () => {
      const initialState = {
        items: mockIngredients,
        loading: false,
        error: null,
        currentIngredient: mockIngredients[0]
      };

      const state = reducer(initialState, {
        type: fetchIngredients.pending.type
      });

      // Проверяем что loading изменилось
      expect(state.loading).toBe(true);

      // Проверяем что другие поля не изменились
      expect(state.items).toBe(initialState.items); // тот же массив
      expect(state.currentIngredient).toBe(initialState.currentIngredient);
      expect(state.error).toBe(initialState.error);
    });
  });
});
