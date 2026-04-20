import reducer, { fetchFeed } from '../feedSlice';
import { TOrder } from '@utils-types';

// Моковые данные заказов
const mockOrders: TOrder[] = [
  {
    _id: 'order-1',
    status: 'done',
    name: 'Space бургер',
    createdAt: '2024-01-01T12:00:00.000Z',
    updatedAt: '2024-01-01T12:00:00.000Z',
    number: 12345,
    ingredients: ['ingredient-1', 'ingredient-2']
  },
  {
    _id: 'order-2',
    status: 'pending',
    name: 'Лунарный бургер',
    createdAt: '2024-01-01T12:30:00.000Z',
    updatedAt: '2024-01-01T12:30:00.000Z',
    number: 12346,
    ingredients: ['ingredient-3', 'ingredient-4']
  }
];

// Моковый ответ API
const mockApiResponse = {
  orders: mockOrders,
  total: 100,
  totalToday: 10
};

describe('Feed Slice', () => {
  describe('Initial State', () => {
    it('should return initial state', () => {
      const state = reducer(undefined, { type: 'unknown' });

      expect(state).toEqual({
        orders: [],
        total: 0,
        totalToday: 0,
        loading: false,
        error: null
      });
    });
  });

  describe('fetchFeed async thunk', () => {
    // 1. При вызове экшенаRequest булевая переменная loading меняется на true
    it('should set loading to true on pending', () => {
      const action = { type: fetchFeed.pending.type };
      const state = reducer(undefined, action);

      expect(state).toEqual({
        orders: [],
        total: 0,
        totalToday: 0,
        loading: true, // loading стало true
        error: null
      });
    });

    // 2. При вызове экшена Success данные записываются в стор и loading меняется на false
    it('should set orders data and loading to false on fulfilled', () => {
      const action = {
        type: fetchFeed.fulfilled.type,
        payload: mockApiResponse
      };

      const state = reducer(undefined, action);

      expect(state).toEqual({
        orders: mockOrders, // данные записались
        total: 100, // total записался
        totalToday: 10, // totalToday записался
        loading: false, // loading стало false
        error: null
      });
    });

    // 3. При вызове экшена Failed ошибка записывается в стор и loading меняется на false
    it('should set error and loading to false on rejected', () => {
      const errorMessage = 'Ошибка загрузки ленты заказов';
      const action = {
        type: fetchFeed.rejected.type,
        error: { message: errorMessage }
      };

      const state = reducer(undefined, action);

      expect(state).toEqual({
        orders: [], // данные не загрузились
        total: 0,
        totalToday: 0,
        loading: false, // loading стало false
        error: errorMessage // ошибка записалась
      });
    });

    // 4. Дополнительный тест: проверка последовательности состояний
    it('should handle full fetch flow correctly', () => {
      // Начальное состояние
      let state = reducer(undefined, { type: '@@INIT' });
      expect(state.loading).toBe(false);
      expect(state.orders).toEqual([]);
      expect(state.error).toBeNull();

      // Запрос начался (pending)
      state = reducer(state, { type: fetchFeed.pending.type });
      expect(state.loading).toBe(true);
      expect(state.orders).toEqual([]);
      expect(state.error).toBeNull();

      // Запрос успешен (fulfilled)
      state = reducer(state, {
        type: fetchFeed.fulfilled.type,
        payload: mockApiResponse
      });
      expect(state.loading).toBe(false);
      expect(state.orders).toEqual(mockOrders);
      expect(state.total).toBe(100);
      expect(state.totalToday).toBe(10);
      expect(state.error).toBeNull();
    });

    // 5. Тест на ошибку после успешной загрузки
    it('should handle error after successful load', () => {
      // Сначала успешная загрузка
      let state = reducer(undefined, {
        type: fetchFeed.fulfilled.type,
        payload: mockApiResponse
      });

      expect(state.loading).toBe(false);
      expect(state.orders).toEqual(mockOrders);

      // Затем новый запрос с ошибкой
      const errorMessage = 'Сетевая ошибка';
      state = reducer(state, {
        type: fetchFeed.rejected.type,
        error: { message: errorMessage }
      });

      // Проверяем что данные не сбросились при ошибке
      expect(state.loading).toBe(false);
      expect(state.orders).toEqual(mockOrders); // данные остались!
      expect(state.error).toBe(errorMessage); // ошибка записалась
    });

    // 6. Тест на новый запрос после ошибки
    it('should clear error on new request', () => {
      // Начальное состояние с ошибкой
      const initialState = {
        orders: [],
        total: 0,
        totalToday: 0,
        loading: false,
        error: 'Предыдущая ошибка'
      };

      // Новый запрос начинается
      const state = reducer(initialState, { type: fetchFeed.pending.type });

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull(); // ошибка должна очиститься
    });
  });

  describe('State immutability', () => {
    it('should not mutate state on pending', () => {
      const initialState = {
        orders: mockOrders,
        total: 100,
        totalToday: 10,
        loading: false,
        error: null
      };

      const state = reducer(initialState, { type: fetchFeed.pending.type });

      // Проверяем что loading изменилось
      expect(state.loading).toBe(true);

      // Проверяем что orders не изменились (тот же массив)
      expect(state.orders).toBe(initialState.orders);
      expect(state.total).toBe(initialState.total);
      expect(state.totalToday).toBe(initialState.totalToday);
      expect(state.error).toBe(initialState.error);
    });
  });
});
