import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderBurgerApi } from '../../utils/burger-api';
import { TOrder } from '@utils-types';
import { getCookie } from '../../utils/cookie';
import { clearConstructor } from './burgerConstructorSlice';

const ensureBearerToken = () => {
  const token = getCookie('accessToken');
  return token ? `Bearer ${token}` : null;
};

export const createOrder = createAsyncThunk(
  'order/create',
  async (ingredientIds: string[], { rejectWithValue, dispatch }) => {
    try {
      const token = ensureBearerToken();
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await fetch(
        'https://norma.education-services.ru/api/orders',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token
          },
          body: JSON.stringify({
            ingredients: ingredientIds
          })
        }
      );

      const data = await response.json();
      console.log('Create order response:', data);

      if (!data.success) {
        throw new Error(data.message || 'Ошибка создания заказа');
      }

      dispatch(clearConstructor());

      return data.order;
    } catch (error) {
      console.error('Create order error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Ошибка создания заказа';

      return rejectWithValue(errorMessage);
    }
  }
);

type TOrderState = {
  order: TOrder | null;
  loading: boolean;
  error: string | null;
  orderRequest: boolean;
};

const initialState: TOrderState = {
  order: null,
  loading: false,
  error: null,
  orderRequest: false
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.order = null;
    },
    setOrderRequest: (state, action: PayloadAction<boolean>) => {
      state.orderRequest = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.orderRequest = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.orderRequest = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка создания заказа';
        state.orderRequest = false;
      });
  }
});

export const { clearOrder, setOrderRequest } = orderSlice.actions;
export default orderSlice.reducer;
