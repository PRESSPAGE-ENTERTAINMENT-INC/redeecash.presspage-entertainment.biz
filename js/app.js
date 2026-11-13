const dbName = 'amsDB';
const dbVersion = 1;
let db;
let request;

function initializeDB() {
    request = indexedDB.open(dbName, dbVersion);
    console.log(request)

    request.onerror = function(event) {
        console.error('Database error:', event.target.error);
    };

    request.onsuccess = function(event) {
        db = event.target.result;

        console.log(db)
        console.log('Database initialized');
    };

    request.onupgradeneeded = async function(event) {
        console.log(event);
        db = event.target.result;
        // Define each object store (table equivalent)
        if (!db.objectStoreNames.contains('MASTER')) {
            db.createObjectStore('MASTER', { keyPath: 'ID', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('VIOLATE')) {
            db.createObjectStore('VIOLATE', { keyPath: 'ID', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('REPORTS')) {
            db.createObjectStore('REPORTS', { keyPath: 'ID', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('RENT')) {
            db.createObjectStore('RENT', { keyPath: 'ID', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('RECEIPT')) {
            db.createObjectStore('RECEIPT', { keyPath: 'ID', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('MAINTAIN')) {
            db.createObjectStore('MAINTAIN', { keyPath: 'ID', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('COLLECT')) {
            db.createObjectStore('COLLECT', { keyPath: 'ID', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('MASTER_VEHICLE')) {
            db.createObjectStore('MASTER_VEHICLE', { keyPath: 'ID', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('MASTER_EMPLOYER')) {
            db.createObjectStore('MASTER_EMPLOYER', { keyPath: 'ID', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('MASTER_CORESIDENT')) {
            db.createObjectStore('MASTER_CORESIDENT', { keyPath: 'ID', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('MASTER_EXTENDED')) {
            db.createObjectStore('MASTER_EXTENDED', { keyPath: 'ID', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('EMPLOYEE')) {
            db.createObjectStore('EMPLOYEE', { keyPath: 'ID', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('PROPERTY')) {
            db.createObjectStore('PROPERTY', { keyPath: 'ID', autoIncrement: true });
        }

        console.log(db)

    };
}

// Add sample data to demonstrate functionality
document.getElementById('addSampleData').onclick = async function(e) {
    e.preventDefault();
    console.log('addSampleData')
    request = indexedDB.open(dbName, dbVersion);
    request.onsuccess = function(event) {
        db = event.target.result;

        const transaction = db.transaction(['PROPERTY'], 'readwrite');
        const objectStore = transaction.objectStore('PROPERTY');
    
        const sampleData = [
            { Name: 'Sunset Apartments', Address1: '123 Sunset Blvd', City: 'Los Angeles', State: 'CA', Zip: '90001', Phone: '123-456-7890', Email: 'info@sunsetapts.com' },
            { Name: 'Lakeside Villas', Address1: '456 Lakeside Dr', City: 'Orlando', State: 'FL', Zip: '32801', Phone: '987-654-3210', Email: 'contact@lakesidevillas.com' }
        ];
    
        sampleData.forEach(item => {
            const rs = objectStore.add(item);
            console.log(rs)
        });
    
        transaction.oncomplete = function() {
            console.log('Sample data added to PROPERTY');
        };
    
        transaction.onerror = function(event) {
            console.error('Transaction error:', event.target.error);
        };
    
    };
};

// Export data from all tables
document.getElementById('exportData').onclick = function() {
    const transaction = db.transaction(db.objectStoreNames, 'readonly');
    const exportData = {};

    const storePromises = Array.from(db.objectStoreNames).map(storeName => {
        return new Promise((resolve, reject) => {
            const objectStore = transaction.objectStore(storeName);
            const allData = [];
            objectStore.openCursor().onsuccess = function(event) {
                const cursor = event.target.result;
                if (cursor) {
                    allData.push(cursor.value);
                    cursor.continue();
                } else {
                    exportData[storeName] = allData;
                    resolve();
                }
            };
            objectStore.openCursor().onerror = reject;
        });
    });

    Promise.all(storePromises).then(() => {
        const dataStr = JSON.stringify(exportData);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        const timestamp = new Date().getTime();
        a.href = url;
        a.download = `ams_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
};

// Import data into IndexedDB
document.getElementById('importData').onclick = function() {
    document.getElementById('importFile').click();
};

document.getElementById('importFile').onchange = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const importedData = JSON.parse(e.target.result);

        const transaction = db.transaction(db.objectStoreNames, 'readwrite');

        const storePromises = Object.keys(importedData).map(storeName => {
            return new Promise((resolve, reject) => {
                const objectStore = transaction.objectStore(storeName);
                importedData[storeName].forEach(item => {
                    objectStore.add(item);
                });
                resolve();
            });
        });

        Promise.all(storePromises).then(() => {
            console.log('Data imported successfully');
        }).catch(error => {
            console.error('Data import error:', error);
        });
    };
    reader.readAsText(file);
};
