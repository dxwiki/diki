import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserInfo {
  id: number;
  username: string;
  name: string;
  thumbnail: string;
  email?: string;
  social?: {
    github?: string;
    linkedin?: string;
  };
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserInfo>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.loading = false;
      state.error = null;
    },
    checkAuth: () => {
      // 이 액션은 미들웨어에서 처리되며, 여기서는 상태를 변경하지 않습니다.
      // 쿠키 확인 로직은 미들웨어에서 처리됩니다.
    },
  },
});

export const { setUser, setLoading, setError, logout, checkAuth } = authSlice.actions;
export default authSlice.reducer;