export class StorageService {
    getItem(field, parse) {
        const localStorageItem = localStorage.getItem(field);

        if (localStorageItem && parse) {
            return JSON.parse(localStorageItem);
        }

        return localStorageItem;
    }

    setItem(field, data, parse) {
        localStorage.setItem(field, parse ? JSON.stringify(data) : data);
    }

    removeItem(field) {
        localStorage.removeItem(field);
    }
}
