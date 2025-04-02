import { configureStore } from '@reduxjs/toolkit';
import termsReducer from './termsSlice';
import searchReducer from './searchSlice';
import pageReducer from './pageSlice';
import profilesReducer from './profilesSlice';

export const store = configureStore({
  reducer: {
    terms: termsReducer,
    search: searchReducer,
    page: pageReducer,
    profiles: profilesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;