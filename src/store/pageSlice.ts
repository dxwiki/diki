import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SortType, SortDirection } from '@/types';

interface PageState {
  sortType: SortType;
  sortDirection: SortDirection;
}

const initialState: PageState = {
  sortType: 'created',
  sortDirection: 'desc',
};

const pageSlice = createSlice({
  name: 'page',
  initialState,
  reducers: {
    setSortType: (state, action: PayloadAction<SortType>) => {
      state.sortType = action.payload;
    },
    setSortDirection: (state, action: PayloadAction<SortDirection>) => {
      state.sortDirection = action.payload;
    },
    setSort: (state, action: PayloadAction<{ type: SortType; direction: SortDirection }>) => {
      state.sortType = action.payload.type;
      state.sortDirection = action.payload.direction;
    },
  },
});

export const { setSortType, setSortDirection, setSort } = pageSlice.actions;
export default pageSlice.reducer;
