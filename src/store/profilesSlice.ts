import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Profile } from '@/types';

interface ProfilesState {
  profiles: Profile[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfilesState = {
  profiles: [],
  isLoading: false,
  error: null,
};

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    setProfiles: (state, action: PayloadAction<Profile[]>) => {
      state.profiles = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setProfiles, setLoading, setError } = profilesSlice.actions;
export default profilesSlice.reducer;