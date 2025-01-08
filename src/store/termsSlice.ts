import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TermData } from '@/types';

interface TermsState {
  terms: TermData[];
  loading: boolean;
  error: string | null;
}

const initialState: TermsState = {
  terms: [],
  loading: false,
  error: null,
};

const termsSlice = createSlice({
  name: 'terms',
  initialState,
  reducers: {
    setTerms: (state, action: PayloadAction<TermData[]>) => {
      state.terms = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setTerms, setLoading, setError } = termsSlice.actions;
export default termsSlice.reducer;