import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    mode: 'dark',
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
    },
});
export const { setDarkTheme, setLightTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
