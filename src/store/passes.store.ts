import {create} from 'zustand';
import {Pass} from '../types/pass.types';
import * as Storage from '../services/storage.service';

interface PassesState {
  passes: Pass[];
  isLoading: boolean;

  // Actions
  loadPasses: () => void;
  addPass: (pass: Pass) => void;
  removePass: (id: string) => void;
  updatePass: (pass: Pass) => void;
  markWallet: (id: string, serial: string) => void;
  touchPass: (id: string) => void;
}

export const usePassesStore = create<PassesState>((set, get) => ({
  passes: [],
  isLoading: true,

  loadPasses: () => {
    set({isLoading: true});
    const passes = Storage.getAllPasses();
    set({passes, isLoading: false});
  },

  addPass: (pass: Pass) => {
    Storage.savePass(pass);
    set(state => ({
      passes: [pass, ...state.passes.filter(p => p.id !== pass.id)],
    }));
  },

  removePass: (id: string) => {
    Storage.deletePass(id);
    set(state => ({passes: state.passes.filter(p => p.id !== id)}));
  },

  updatePass: (pass: Pass) => {
    Storage.savePass(pass);
    set(state => ({
      passes: state.passes.map(p => (p.id === pass.id ? pass : p)),
    }));
  },

  markWallet: (id: string, serial: string) => {
    Storage.markAddedToWallet(id, serial);
    set(state => ({
      passes: state.passes.map(p =>
        p.id === id ? {...p, addedToWallet: true, walletSerial: serial} : p,
      ),
    }));
  },

  touchPass: (id: string) => {
    Storage.updatePassLastUsed(id);
    set(state => ({
      passes: state.passes.map(p =>
        p.id === id ? {...p, lastUsedAt: Date.now()} : p,
      ),
    }));
  },
}));
