import rootReducer from '../../rootReducer';

// Получаем initialState из каждого редьюсера
const getIngredientsInitialState = () => ({
  items: [],
  loading: false,
  error: null,
  currentIngredient: null
});

const getBurgerConstructorInitialState = () => ({
  bun: null,
  ingredients: []
});

const getOrderInitialState = () => ({
  order: null,
  loading: false,
  error: null,
  orderRequest: false
});

const getUserInitialState = () => ({
  user: null,
  loading: false,
  error: null,
  isAuthChecked: false
});

const getFeedInitialState = () => ({
  orders: [],
  total: 0,
  totalToday: 0,
  loading: false,
  error: null
});

const getProfileOrdersInitialState = () => ({
  orders: [],
  loading: false,
  error: null
});

describe('Root Reducer', () => {
  it('should return correct initial state structure', () => {
    const initialState = rootReducer(undefined, { type: '@@INIT' });

    // Проверяем, что состояние соответствует ожидаемой структуре
    expect(initialState).toEqual({
      ingredients: getIngredientsInitialState(),
      burgerConstructor: getBurgerConstructorInitialState(),
      order: getOrderInitialState(),
      user: getUserInitialState(),
      feed: getFeedInitialState(),
      profileOrders: getProfileOrdersInitialState()
    });
  });

  it('should have all required slices', () => {
    const initialState = rootReducer(undefined, { type: '@@INIT' });

    const expectedSlices = [
      'ingredients',
      'burgerConstructor',
      'order',
      'user',
      'feed',
      'profileOrders'
    ];

    expect(Object.keys(initialState)).toEqual(expectedSlices);
    expect(Object.keys(initialState).length).toBe(6);
  });

  it('should have correct initial values for each slice', () => {
    const state = rootReducer(undefined, { type: '@@INIT' });

    // Проверяем ingredients slice
    expect(state.ingredients).toEqual({
      items: [],
      loading: false,
      error: null,
      currentIngredient: null
    });

    // Проверяем burgerConstructor slice
    expect(state.burgerConstructor).toEqual({
      bun: null,
      ingredients: []
    });

    // Проверяем order slice
    expect(state.order).toEqual({
      order: null,
      loading: false,
      error: null,
      orderRequest: false
    });

    // Проверяем user slice
    expect(state.user).toEqual({
      user: null,
      loading: false,
      error: null,
      isAuthChecked: false
    });

    // Проверяем feed slice
    expect(state.feed).toEqual({
      orders: [],
      total: 0,
      totalToday: 0,
      loading: false,
      error: null
    });

    // Проверяем profileOrders slice
    expect(state.profileOrders).toEqual({
      orders: [],
      loading: false,
      error: null
    });
  });
});
