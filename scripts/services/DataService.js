import {HttpService} from './HttpService.js';

const COINS_URL = "https://api.coinpaprika.com/v1/coins";
const getSingleCoinUrl = id => `${COINS_URL}/${id}/ohlcv/latest`;



export const DataService = {

  async getCurrencies(query = { filter: ''}) {
    let promise = HttpService.sendRequest(COINS_URL);
    let { filter } = query;

    try {
      let data = await promise;
      data = data.filter(item => {
        return item.name.toLowerCase().includes(filter);
      }).slice(0, 10);
      return DataService.getCurrenciesPrice(data).catch(err => console.error(err));
    } catch(err) {
      console.error(err);
    }

    // return promise.then(data => {
    //     data = data.filter(item => {
    //       return item.name.toLowerCase().includes(filter);
    //     }).slice(0, 10);
    //     return DataService.getCurrenciesPrice(data);
    // }).catch(err => {
    //   console.error(err);
    // });
  },

  getCurrenciesPrice(data, callback) {
    let coinsUrls = data.map(coin => getSingleCoinUrl(coin.id));
    return HttpService.sendMultipleRequests(coinsUrls).then(coins => {
      const dataWithPrices = data.map((item, index) => {
        item.price = coins[index][0].close;
        return item;
      })

      return dataWithPrices
    })
    // const coinsIdMap = coinsIds.reduce((acc, id) => {
    //   acc[getSingleCoinUrl(id)] = id;
    //   return acc;
    // }, {});

    // HttpService.sendMultipleRequests(Object.keys(coinsIdMap), coins => {
    //   const dataWithPrices = data.map(coinData => {
    //     let coinPriceUrl = getSingleCoinUrl(coinData.id);
    //     let [coinPriceData] = coins.find(
    //       coin => coin.url === coinPriceUrl
    //     ).data;

    //     coinData.price = coinPriceData.close;
    //     return coinData;
    //   });
    //   callback(dataWithPrices);
    // });
  }
};

class MyPromise {
  constructor(behaviorFunction) {
    this._status = "pending";
    this._result = null;
    this._successCallback = [];
    this._errorCallback = [];
    behaviorFunction(this._resolve.bind(this), this._reject.bind(this));
  }

  then(successCallback, errorCallback = () => {}) {
    if (this._status === "fulfilled") {
      successCallback(this._result);
    } else if (this._status === "rejected") {
      errorCallback(this._result);
    } else {
      this._successCallback.push(successCallback);
      // this._errorCallback.push(errorCallback);
    }
  }
  _resolve(data) {
    this._status = "fulfilled";
    this._result = data;
    this._successCallback.forEach(callback => callback(data));
  }

  catch(errorCallback) {
    if (this._status === "rejected") {
      errorCallback(this._result);
    } else {
      this._errorCallback.push(errorCallback);
    }
  }

  _reject(error) {
    this._status = "rejected";
    this._result = error;
    this._errorCallback.forEach(callback => callback(error));
  }
}
