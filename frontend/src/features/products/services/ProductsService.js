export class ProductsService {
    constructor(http) {
        this.http = http;
    }

    async fetchProductsList() {
        try {
            return await this.http.GET('products');
        } catch (error) {
            if (error.code === 401) {
                return Promise.reject('Token refresh error.');
            }
            return Promise.reject(error);
        }
    }
}
