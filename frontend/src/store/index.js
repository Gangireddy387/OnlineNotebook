import { createStore } from 'vuex';
import auth from './modules/auth';
import notes from './modules/notes';
import chat from './modules/chat';

export default createStore({
  modules: {
    auth,
    notes,
    chat
  }
});

