import reducer, { fetchProfileOrders } from '../profileOrdersSlice';
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

describe('Profile Orders Slice', () => {
  describe('Initial State', () => {
    it('should return initial state', () => {
      const state = reducer(undefined, { type: 'unknown' });

      expect(state).toEqual({
        orders: [],
        loading: false,
        error: null
      });
    });
  });

  describe('fetchProfileOrders async thunk', () => {
    // 1. При вызове экшенаRequest булевая переменная loading меняется на true
    it('should set loading to true on pending', () => {
      const action = { type: fetchProfileOrders.pending.type };
      const state = reducer(undefined, action);

      expect(state).toEqual({
        orders: [],
        loading: true, // loading стало true
        error: null
      });
    });

    // 2. При вызове экшена Success данные записываются в стор и loading меняется на false
    it('should set orders data and loading to false on fulfilled', () => {
      const action = {
        type: fetchProfileOrders.fulfilled.type,
        payload: mockOrders
      };

      const state = reducer(undefined, action);

      expect(state).toEqual({
        orders: mockOrders, // данные записались
        loading: false, // loading стало false
        error: null
      });
    });

    // 3. При вызове экшена Failed ошибка записывается в стор и loading меняется на false
    it('should set error and loading to false on rejected', () => {
      const errorMessage = 'Ошибка загрузки истории заказов';
      const action = {
        type: fetchProfileOrders.rejected.type,
        error: { message: errorMessage }
      };

      const state = reducer(undefined, action);

      expect(state).toEqual({
        orders: [], // данные не загрузились
        loading: false, // loading стало false
        error: errorMessage // ошибка записалась
      });
    });

    // 4. Тест на дефолтное сообщение об ошибке
    it('should use default error message when no message provided', () => {
      const action = {
        type: fetchProfileOrders.rejected.type,
        error: {} // нет сообщения об ошибке
      };

      const state = reducer(undefined, action);

      expect(state.error).toBe('Ошибка загрузки истории заказов');
      expect(state.loading).toBe(false);
    });

    // 5. Проверка что error очищается при новом запросе
    it('should clear error on new request (pending)', () => {
      const initialState = {
        orders: [],
        loading: false,
        error: 'Предыдущая ошибка'
      };

      const state = reducer(initialState, {
        type: fetchProfileOrders.pending.type
      });

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull(); // ошибка очистилась
    });

    // 6. Тест на сохранение данных при повторной ошибке
    it('should preserve existing orders when new request fails', () => {
      const initialState = {
        orders: mockOrders,
        loading: false,
        error: null
      };

      const action = {
        type: fetchProfileOrders.rejected.type,
        error: { message: 'Новая ошибка' }
      };

      const state = reducer(initialState, action);

      expect(state.orders).toEqual(mockOrders); // данные остались
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Новая ошибка');
    });

    // 7. Полный цикл загрузки
    it('should handle complete loading cycle', () => {
      let state = reducer(undefined, { type: '@@INIT' });

      // Начало загрузки
      state = reducer(state, { type: fetchProfileOrders.pending.type });
      expect(state.loading).toBe(true);
      expect(state.orders).toEqual([]);
      expect(state.error).toBeNull();

      // Успешная загрузка
      state = reducer(state, {
        type: fetchProfileOrders.fulfilled.type,
        payload: mockOrders
      });
      expect(state.loading).toBe(false);
      expect(state.orders).toEqual(mockOrders);
      expect(state.error).toBeNull();

      // Ошибка при следующем запросе
      state = reducer(state, {
        type: fetchProfileOrders.rejected.type,
        error: { message: 'Ошибка обновления' }
      });
      expect(state.loading).toBe(false);
      expect(state.orders).toEqual(mockOrders); // данные сохранились
      expect(state.error).toBe('Ошибка обновления');
    });
  });

  describe('State immutability', () => {
    it('should handle multiple state transitions correctly', () => {
      const initialState = {
        orders: [],
        loading: false,
        error: null
      };

      // Первый запрос
      let state = reducer(initialState, {
        type: fetchProfileOrders.pending.type
      });
      expect(state.loading).toBe(true);
      expect(state.orders).toEqual([]);

      // Первая успешная загрузка
      state = reducer(state, {
        type: fetchProfileOrders.fulfilled.type,
        payload: [mockOrders[0]]
      });
      expect(state.loading).toBe(false);
      expect(state.orders).toHaveLength(1);

      // Второй запрос
      state = reducer(state, { type: fetchProfileOrders.pending.type });
      expect(state.loading).toBe(true);
      expect(state.orders).toHaveLength(1); // старые данные остались

      // Вторая успешная загрузка (обновление)
      state = reducer(state, {
        type: fetchProfileOrders.fulfilled.type,
        payload: mockOrders // новые данные
      });
      expect(state.loading).toBe(false);
      expect(state.orders).toEqual(mockOrders); // данные обновились
    });
  });
});
