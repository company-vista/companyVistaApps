import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    mode: 'light',
};
const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme(state) {
            state.mode = state.mode === 'light' ? 'dark' : 'light';
        },
        setLightTheme(state) {
            state.mode = 'light';
        },
        setDarkTheme(state) {
            state.mode = 'dark';
        },
        setSystemTheme(state) {
            state.mode = 'system';
        },
        setThemeMode(state, action) {
            if (['light', 'dark', 'system'].includes(action.payload)) {
                state.mode = action.payload;
            }
        },
    },
});
export const {
    setDarkTheme,
    setLightTheme,
    setSystemTheme,
    setThemeMode,
    toggleTheme,
} = themeSlice.actions;
export default themeSlice.reducer;
