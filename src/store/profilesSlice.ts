import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Profile } from '@/types';

interface ProfilesState {
  profiles: Profile[];
  loading: boolean;
  error: string | null;
}

const initialState: ProfilesState = {
  profiles: [],
  loading: false,
  error: null,
};

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    setProfiles: (state, action: PayloadAction<Profile[]>) => {
      state.profiles = action.payload;
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

export const { setProfiles, setLoading, setError } = profilesSlice.actions;
export default profilesSlice.reducer;