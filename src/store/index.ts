import { configureStore, combineReducers } from '@reduxjs/toolkit';
import termsReducer from './termsSlice';
import searchReducer from './searchSlice';
import pageReducer from './pageSlice';
import profilesReducer from './profilesSlice';

// 루트 리듀서 정의
const rootReducer = combineReducers({
  terms: termsReducer,
  search: searchReducer,
  page: pageReducer,
  profiles: profilesReducer,
});

// 초기 상태 없이 스토어 생성
export const store = configureStore({
  reducer: rootReducer,
});

// 초기 상태를 받아 새 스토어 생성하는 함수
export function setupStore(preloadedState?: RootState) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof setupStore>;