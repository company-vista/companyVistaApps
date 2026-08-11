export function getNetworkErrorMessage() {
    return __DEV__
        ? 'Unable to reach server. Check that the backend is running on port 5000.'
        : 'Network error. Please try again later.';
}
