import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import { I18nextProvider } from 'react-i18next'
import i18next from 'i18next'

import global_en from '../react/locales/en.json'
import global_mr from '../react/locales/mr.json'

import App from './App'
import store from './store'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import { ToastProvider } from './views/common/toast/ToastContext'
import ToastContainer from './views/common/toast/ToastContainer'
import { SpinnerProvider } from './views/common/spinner/SpinnerProvider'

i18next.init({
  interpolation: { escapeValue: false },
   lng: 'auto',
   fallbackLng: 'en',
  resources: {
   en: {
    global: global_en,
   },
   mr: {
    global: global_mr,
   },
  },
 })

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  console.log('beforeinstallprompt');
});

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ToastProvider>
      <ToastContainer />
      <I18nextProvider i18n={i18next}>
        <SpinnerProvider>
          <App />
        </SpinnerProvider>
      </I18nextProvider>
    </ToastProvider>
  </Provider>,
)
