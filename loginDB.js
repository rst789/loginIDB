import Dexie from 'dexie';
import indexedDB from 'fake-indexeddb';

Dexie.dependencies.indexedDB = indexedDB;

let db;

const dbName = "user";

const request = indexedDB.open(dbName, 1);

request.onerror = (event) => {
    // Handle errors.
    console.error("IndexedDB Error", request.error);
};

request.onsuccess = (event) => {
    console.log("Successfully loaded DB");
    db = event.target.result;
};

request.onupgradeneeded = (event) => {

    console.log("upgrade");
    const db = event.target.result;

    const objectStore = db.createObjectStore("customers", { keyPath: "username" });

    objectStore.createIndex("username", "username", { unique: true });

    // Create an index to search customers by email. We want to ensure that
    // no two customers have the same email, so use a unique index.
    // objectStore.createIndex("username", "username", { unique: true });

    objectStore.transaction.oncomplete = (event) => {
        // Store values in the newly created objectStore.
        const customerObjectStore = db.transaction("customers", "readwrite").objectStore("customers");
        const customerData = [
            { username: "user1", password: "pwd1" },
            { username: "user2", password: "pwd2" }
        ];
        customerData.forEach((customer) => {
            customerObjectStore.add(customer);
        });
        console.log(customerData);

        const tx = db.transaction("customers", "readonly");
        const store = tx.objectStore("customers", {keyPath: "username"});
        const index = store.index("username");

        const request2 = index.get("user3");
        request2.onsuccess = function (){
            const matching = request2.result;
            if (matching !== undefined) {
                console.log(matching.username, matching.password);
            } else {
                console.log("Not found");
            }
        }

        // HOW TO GET USER INPUT?
        const request3 = index.get("");
    };

    db.onerror = (event) => {
        // Generic error handler for all errors targeted at this database's requests!
        console.error(`Database error: ${event.target.errorCode}`);
    };
};
