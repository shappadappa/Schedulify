import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyCELV4nSDuzj3p_3wJKIyN7umbqr-jq-lU",
    authDomain: "schedulify-fd04b.firebaseapp.com",
    projectId: "schedulify-fd04b",
    storageBucket: "schedulify-fd04b.appspot.com",
    messagingSenderId: "1083715018287",
    appId: "1:1083715018287:web:6d5f818e627fc9879570da",
}

export const app = initializeApp(firebaseConfig)