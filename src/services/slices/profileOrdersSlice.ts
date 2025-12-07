import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrdersApi } from '../../utils/burger-api';
import { TOrder } from '@utils-types';
import { getCookie } from '../../utils/cookie';

// Вспомогательная функция для Bearer
const ensureBearerToken = () => {
  const token = getCookie('accessToken');
  return token ? `Bearer ${token}` : null;
};

// Патченная версия getOrdersApi
const getOrdersApiWithBearer = () => {
  const token = ensureBearerToken();
  console.log('getOrdersApi token:', token ? 'present' : 'missing');

  if (!token) {
    return Promise.reject(new Error('Токен не найден. Авторизуйтесь снова.'));
  }

  return fetch('https://norma.education-services.ru/api/orders', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    }
  })
    .then((res) => {
      console.log('Orders API status:', res.status);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log('Orders API response:', data);
      if (data?.success) {
        console.log(`Загружено ${data.orders?.length || 0} заказов`);
        return data.orders || [];
      }
      throw new Error(data.message || 'Ошибка загрузки заказов');
    })
    .catch((error) => {
      console.error('Orders API error:', error);
      throw error;
    });
};

export const fetchProfileOrders = createAsyncThunk(
  'profileOrders/fetch',
  async () => {
    const orders = await getOrdersApiWithBearer();
    return orders;
  }
);

type TProfileOrdersState = {
  orders: TOrder[];
  loading: boolean;
  error: string | null;
};

const initialState: TProfileOrdersState = {
  orders: [],
  loading: false,
  error: null
};

const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        console.log('Orders saved to store:', action.payload.length);
      })
      .addCase(fetchProfileOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки истории заказов';
        console.error('Fetch orders rejected:', action.error);
      });
  }
});

export default profileOrdersSlice.reducer;
