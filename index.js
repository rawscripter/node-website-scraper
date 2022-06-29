const axios = require('axios');
const cheerio = require('cheerio');
const products = require('./wishlist/index')
const numeral = require('numeral');
// get products from wishlist
const getProducts = async () => {
    const result = [];
    for (let i = 0; i < products.length; i++) {
        const { url, site, titleClass, priceClass, stockClass } = products[i];
        const html = await axios.get(url);
        const $ = cheerio.load(html.data);
        const title = $(titleClass).text();
        const price = $(priceClass).text();
        const stock = $(stockClass).text();
        result.push({
            url,
            site,
            title,
            price,
            stock
        });
    }
    return result;
}


const result = getProducts();


const OUT_OF_STOCK_TEXTS = [
    'up coming',
    'out of stock',
]

const checkAvailability = (product) => {
    if (!OUT_OF_STOCK_TEXTS.includes(product.stock.toLowerCase())) {
        return true;
    }
    return false;
};

const filterProductPrice = (product) => {
    const price = product.price.replace(/\D/g, '');
     // add , to price
    return numeral(price).format('0,0') + " Tk";
}


result.then(data => {
    const products = data;
    // check if product is available
    const availableProducts = products.filter(product => checkAvailability(product));
    // filter price
    const filteredProducts = availableProducts.map(product => {
        return {
            ...product,
            price: filterProductPrice(product)
        }
    });

    console.log(filteredProducts);
}).catch(err => {
    console.log(err);
});
