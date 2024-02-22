import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from "redux";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';

import authReducer from '../auth/authSlice';

const reducers = combineReducers({
  auth: authReducer,
});

const persistConfig = { // configuration object for redux-persist
  key: 'root',
  storage : AsyncStorage, // define which storage to use
}

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
    }
  })
  // devTools: process.env.NODE_ENV !== 'production',
  // middleware: [thunk]
});

export default store;
