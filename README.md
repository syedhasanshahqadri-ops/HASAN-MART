# Hasan Mart - Store Website

The customer-facing online store. It uses external HTML, CSS and JavaScript files, and all site text is in English.

## Folder structure

    store/
    ├── index.html
    ├── css/style.css
    ├── js/
    │   ├── data.js              (store info, categories and prices)
    │   ├── app.js               (pages, cart, checkout, theme)
    │   └── firebase-config.js   (your Firebase keys go here)
    └── images/
        ├── fashion/  electronics/  entertainment/  sports/  home/
        ├── beauty/   toys/         books/          auto/    watches/
        └── payment/             (easypaisa-qr.png, jazzcash-qr.png)

## Features

- 10 categories with 50 products each (500 products in total)
- Home page with a 3D hero, department tiles and featured products
- Search, category pages and price sorting
- Cart with add to cart, quantity change and item removal
- Checkout form: name, email, mobile, city, address, postal code and notes
- Payment options: Cash on Delivery (+ Rs 200), Easypaisa (QR) and JazzCash (QR)
- A transaction ID is required for Easypaisa and JazzCash payments
- WhatsApp button after checkout to confirm the order
- Dark and light theme (the choice is remembered in the browser)
- Responsive layout that works on mobile

## Adding product images

1. Put images in each category folder, named `S1.jpg`, `S2.jpg` ... `S50.jpg`.
2. `.png` and `.webp` also work (the site tries jpg first, then png, then webp).
3. If a product has no image, an animated icon is shown, so the card is never empty.

The number matches the product position: S1 is the first product in that category and S50 is the fiftieth.

## Payment QR codes

Download your QR codes from the Easypaisa and JazzCash apps and save them as:

    images/payment/easypaisa-qr.png
    images/payment/jazzcash-qr.png

## Firebase setup (sends orders to the staff site)

Until Firebase is connected, the store runs in demo mode and orders are saved only in the customer's own browser.

1. Go to https://console.firebase.google.com and click **Add project**.
2. Choose **Add app > Web** and copy the `firebaseConfig` object.
3. Go to **Build > Firestore Database > Create database** (production mode).
4. Go to **Build > Authentication > Sign-in method**, enable Email/Password, then use **Users > Add user** to create the staff email and password.
5. Open **Firestore > Rules**, paste the following and click Publish (replace `STAFF_EMAIL` with the staff email):

        rules_version = '2';
        service cloud.firestore {
          match /databases/{db}/documents {
            match /orders/{id} {
              allow create: if true;
              allow read, update: if request.auth != null
                && request.auth.token.email == 'STAFF_EMAIL';
            }
          }
        }

6. Paste your config into `js/firebase-config.js`:

        window.FIREBASE_CONFIG = {
          apiKey: "...",
          authDomain: "...",
          projectId: "...",
          appId: "..."
        };

7. Go to **Authentication > Settings > Authorized domains** and add `syedhasanshahqadri-ops.github.io`.

Paste the same config into `staff/js/firebase-config.js` as well.

## Changing store details

Open `js/data.js`:

- `STORE` holds the store name, tagline, email, phone, WhatsApp, Easypaisa and JazzCash numbers, and `codFee`.
- `CATS` holds the category names, icons, product names and base prices.

Write the WhatsApp number in international format (92300...), without a leading `0` or `+`.

## Publishing on GitHub Pages

1. Create a GitHub repository (for example `hasan-bazaar`).
2. Upload both the `store/` and `staff/` folders.
3. Go to **Settings > Pages** and choose the `main` branch and the root folder.
4. Your store link will be: `https://syedhasanshahqadri-ops.github.io/hasan-bazaar/store/`

## Important notes

- Never write the staff password in the code or in JavaScript.
- Always put the staff email in the Firestore rules, otherwise anyone could read the orders.
- The Firebase `apiKey` is meant to be public. Your data is protected by the rules, not by hiding the key.# HASAN-MART
