import create from 'zustand';
import axios from "axios";

interface UserLogin {
    authData: AuthData;
    setAuth: (authData: AuthData) => void;
    clearAuth: () => void;
}

const useStore = create<UserLogin>((set) => ({
    authData: {userId:0, token:""},
    setAuth: (authData: AuthData) => set(() => {
        return {authData: authData}
    }),
    clearAuth: () => set(() => {
        return {authData: {userId:0, token:""}}
    })
}))

export const useAuthStore = useStore;