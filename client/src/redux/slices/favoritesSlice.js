import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "favorites";

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
};
const save = (ids) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch {} };

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: { ids: load() },
  reducers: {
    toggleFavorite: (state, action) => {
      const id = action.payload;
      if (!id) return;
      if (state.ids.includes(id)) state.ids = state.ids.filter((x) => x !== id);
      else state.ids.push(id);
      save(state.ids);
    },
    setFavorites: (state, action) => {
      state.ids = Array.isArray(action.payload) ? action.payload : [];
      save(state.ids);
    },
  },
});

export const { toggleFavorite, setFavorites } = favoritesSlice.actions;
export const selectFavorites = (state) => state.favorites.ids;
export const selectIsFavorite = (state, id) => state.favorites.ids.includes(id);
export default favoritesSlice.reducer;