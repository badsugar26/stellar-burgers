import reducer, {
  loginUser,
  registerUser,
  getUser,
  updateUser,
  logoutUser,
  setAuthChecked
} from '../userSlice';
import { TUser } from '@utils-types';

const mockUser: TUser = {
  email: 'test@test.com',
  name: 'Test User'
};

describe('User Slice', () => {
  describe('Initial State', () => {
    it('should return initial state', () => {
      const state = reducer(undefined, { type: 'unknown' });

      expect(state).toEqual({
        user: null,
        loading: false,
        error: null,
        isAuthChecked: false
      });
    });
  });

  describe('getUser async thunk', () => {
    // 1. При вызове экшенаRequest loading меняется на true
    it('should set loading to true on pending', () => {
      const action = { type: getUser.pending.type };
      const state = reducer(undefined, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    // 2. При вызове экшена Success данные записываются и loading, isAuthChecked меняются
    it('should set user data, loading to false and isAuthChecked to true on fulfilled', () => {
      const action = {
        type: getUser.fulfilled.type,
        payload: mockUser
      };

      const state = reducer(undefined, action);

      expect(state.user).toEqual(mockUser); // данные записались
      expect(state.loading).toBe(false); // loading стало false
      expect(state.isAuthChecked).toBe(true); // isAuthChecked стало true
      expect(state.error).toBeNull();
    });

    // 3. При вызове экшена Failed ошибка записывается и loading, isAuthChecked меняются
    it('should set error, loading to false and isAuthChecked to true on rejected', () => {
      const errorMessage = 'Ошибка получения данных пользователя';
      const action = {
        type: getUser.rejected.type,
        error: { message: errorMessage }
      };

      const state = reducer(undefined, action);

      expect(state.user).toBeNull(); // данные не записались
      expect(state.loading).toBe(false); // loading стало false
      expect(state.isAuthChecked).toBe(true); // isAuthChecked стало true
      expect(state.error).toBe(errorMessage); // ошибка записалась
    });
  });

  describe('setAuthChecked action', () => {
    it('should set isAuthChecked', () => {
      const state = reducer(undefined, setAuthChecked(true));
      expect(state.isAuthChecked).toBe(true);

      const state2 = reducer(state, setAuthChecked(false));
      expect(state2.isAuthChecked).toBe(false);
    });
  });

  describe('logoutUser async thunk', () => {
    it('should clear user data on fulfilled', () => {
      const initialState = {
        user: mockUser,
        loading: false,
        error: null,
        isAuthChecked: true
      };

      const state = reducer(initialState, { type: logoutUser.fulfilled.type });

      expect(state.user).toBeNull(); // пользователь очистился
      expect(state.isAuthChecked).toBe(true); // isAuthChecked не меняется
    });
  });
});
