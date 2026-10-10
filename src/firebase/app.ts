// Firebase başlatma. Ayarlar .env içindeki VITE_FIREBASE_* değişkenlerinden gelir.

import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { initializeFirestore } from 'firebase/firestore'

const env = import.meta.env

export const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
})

// App Check (reCAPTCHA v3): site anahtarı tanımlıysa açılır. Yerelde hata ayıklama jetonu kullanılır.
const recaptchaSiteKey = env.VITE_RECAPTCHA_SITE_KEY
if (recaptchaSiteKey) {
  if (env.DEV) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  })
}

export const db = initializeFirestore(app, { ignoreUndefinedProperties: true })
