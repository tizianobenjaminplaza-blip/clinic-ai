import * as SecureStore from 'expo-secure-store';

const CLINIC_ID_KEY = 'clinic_ai_clinicId';
const TOKEN_KEY = 'clinic_ai_token';

export const authStorage = {
  save: async (clinicId: string, token: string) => {
    await SecureStore.setItemAsync(CLINIC_ID_KEY, clinicId);
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  getClinicId: () => SecureStore.getItemAsync(CLINIC_ID_KEY),
  getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
  clear: async () => {
    await SecureStore.deleteItemAsync(CLINIC_ID_KEY);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
