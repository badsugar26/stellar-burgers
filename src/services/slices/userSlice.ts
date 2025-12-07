import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  loginUserApi,
  registerUserApi,
  logoutApi,
  TLoginData,
  TRegisterData
} from '../../utils/burger-api';
import { TUser } from '@utils-types';
import { setCookie, getCookie, deleteCookie } from '../../utils/cookie';

// Вспомогательная функция для проверки и добавления Bearer
const ensureBearerToken = () => {
  const token = getCookie('accessToken');
  if (!token) return null;

  // Проверяем, есть ли уже Bearer
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

// Патченная версия getUserApi с Bearer
const getUserApiWithBearer = () => {
  const token = ensureBearerToken();
  if (!token) {
    return Promise.reject(new Error('No access token'));
  }

  // Временно используем прямой fetch
  return fetch('https://norma.education-services.ru/api/auth/user', {
    headers: {
      Authorization: token
    }
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        throw new Error(data.message || 'Ошибка получения пользователя');
      }
      return data;
    });
};

// Патченная версия updateUserApi с Bearer
const updateUserApiWithBearer = (user: Partial<TRegisterData>) => {
  const token = ensureBearerToken();
  if (!token) {
    return Promise.reject(new Error('No access token'));
  }

  // Временно используем прямой fetch
  return fetch('https://norma.education-services.ru/api/auth/user', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify(user)
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        throw new Error(data.message || 'Ошибка обновления профиля');
      }
      return data;
    });
};

// Оригинальные thunk'и остаются без изменений
export const loginUser = createAsyncThunk(
  'user/login',
  async (data: TLoginData) => {
    const response = await loginUserApi(data);
    setCookie('accessToken', response.accessToken.split('Bearer ')[1]);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response.user;
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (data: TRegisterData) => {
    const response = await registerUserApi(data);
    setCookie('accessToken', response.accessToken.split('Bearer ')[1]);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response.user;
  }
);

export const logoutUser = createAsyncThunk('user/logout', async () => {
  await logoutApi();
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
});

// ПЕРЕПИСАННЫЕ thunk'и с нашими патченными функциями
export const getUser = createAsyncThunk('user/get', async () => {
  const response = await getUserApiWithBearer();
  return response.user;
});

export const updateUser = createAsyncThunk(
  'user/update',
  async (data: Partial<TRegisterData>) => {
    const response = await updateUserApiWithBearer(data);
    return response.user;
  }
);

// Остальной код слайса БЕЗ ИЗМЕНЕНИЙ
type TUserState = {
  user: TUser | null;
  loading: boolean;
  error: string | null;
  isAuthChecked: boolean;
};

const initialState: TUserState = {
  user: null,
  loading: false,
  error: null,
  isAuthChecked: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthChecked: (state, action: PayloadAction<boolean>) => {
      state.isAuthChecked = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка входа';
      })

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка регистрации';
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })

      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthChecked = true;
        state.error =
          action.error.message || 'Ошибка получения данных пользователя';
      })

      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка обновления профиля';
      });
  }
});

export const { setAuthChecked, clearError } = userSlice.actions;
export default userSlice.reducer;
