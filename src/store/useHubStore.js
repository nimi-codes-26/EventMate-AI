import { create } from 'zustand';
import { dbAPI } from '../services/firebase';

export const useHubStore = create((set) => ({
  hubs: [],
  loading: false,
  fetchHubs: async () => {
     set({ loading: true });
     const data = await dbAPI.getHubs();
     set({ hubs: data, loading: false });
  }
}));
