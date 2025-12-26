import reducer, { createOrder, clearOrder } from '../orderSlice';
import { TOrder } from '@utils-types';

const mockOrder: TOrder = {
  _id: 'order-123',
  status: 'done',
  name: 'Space бургер',
  createdAt: '2024-01-01T12:00:00.000Z',
  updatedAt: '2024-01-01T12:00:00.000Z',
  number: 12345,
  ingredients: ['ingredient-1', 'ingredient-2']
};

describe('Order Slice', () => {
  describe('Initial State', () => {
    it('should return initial state', () => {
      const state = reducer(undefined, { type: 'unknown' });

      expect(state).toEqual({
        order: null,
        loading: false,
        error: null,
        orderRequest: false
      });
    });
  });

  describe('createOrder async thunk', () => {
    // 1. При вызове экшенаRequest loading и orderRequest меняются на true
    it('should set loading and orderRequest to true on pending', () => {
      const action = { type: createOrder.pending.type };
      const state = reducer(undefined, action);

      expect(state).toEqual({
        order: null,
        loading: true, // loading стало true
        error: null,
        orderRequest: true // orderRequest стало true
      });
    });

    // 2. При вызове экшена Success данные записываются и loading меняется на false
    it('should set order data and loading to false on fulfilled', () => {
      const action = {
        type: createOrder.fulfilled.type,
        payload: mockOrder
      };

      const state = reducer(undefined, action);

      expect(state).toEqual({
        order: mockOrder, // данные записались
        loading: false, // loading стало false
        error: null,
        orderRequest: false // orderRequest стало false
      });
    });

    // 3. При вызове экшена Failed ошибка записывается и loading меняется на false
    it('should set error and loading to false on rejected', () => {
      const errorMessage = 'Ошибка создания заказа';
      const action = {
        type: createOrder.rejected.type,
        error: { message: errorMessage }
      };

      const state = reducer(undefined, action);

      expect(state).toEqual({
        order: null, // данные не записались
        loading: false, // loading стало false
        error: errorMessage, // ошибка записалась
        orderRequest: false // orderRequest стало false
      });
    });
  });

  describe('clearOrder action', () => {
    it('should clear order data', () => {
      const initialState = {
        order: mockOrder,
        loading: false,
        error: null,
        orderRequest: false
      };

      const state = reducer(initialState, clearOrder());

      expect(state).toEqual({
        order: null, // order очистился
        loading: false,
        error: null,
        orderRequest: false
      });
    });
  });
});
