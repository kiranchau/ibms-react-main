// import { initializeApp } from "firebase/app";
// import { getMessaging, getToken, onMessage } from "firebase/messaging";

// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//     apiKey: process.env.REACT_APP_API_KEY,
//     authDomain:process.env.REACT_APP_AUTH_DOMAIN,
//     projectId:process.env.REACT_APP_PROJECT_ID,
//     storageBucket:process.env.REACT_APP_STORAGE_BUCKET,
//     messagingSenderId:process.env.REACT_APP_MESSAGING_SENDER_ID,
//     appId:process.env.REACT_APP_APP_ID,
//     measurementId:process.env.REACT_APP_MEASUREMENT_ID
// };

// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// const getPushToken = async () => {
//     // let registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: "/" })
//     return Notification.requestPermission().then(async (permission) => {
//         return getToken(messaging, {
//             vapidKey: process.env.REACT_APP_VAPID_KEY
//         })
//     }).catch((err) => {
//     });
// }

// export { messaging, getPushToken, onMessage };

// export default app;