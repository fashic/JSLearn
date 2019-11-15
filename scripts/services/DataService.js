const COINS_URL = "https://api.coinpaprika.com/v1/coins/132";
const getSingleCoinUrl = id => `${COINS_URL}/${id}/ohlcv/latest`;

const HttpService = {
  sendRequest(url, successCallback, errorCallback) {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', url);

    xhr.send();

    xhr.onload = () => {
      if (xhr.status != 200) {
        errorCallback(new Error('Oops'));
        return;
      } else {
        let responseData = JSON.parse(xhr.responseText);
        successCallback(responseData);
      }
    }

    xhr.onerror = () => {
      errorCallback(new Error('Oops'));
    }
  },
  sendMultipleRequests(urls, callback) {
    let requestCount = urls.length;
    let results = [];

    urls.forEach(url => {
      HttpService.sendRequest(url, data => {
        results.push({ url, data });
        requestCount--;

        if (!requestCount) {
          callback(results);
        }
      });
    });
  }
};

export const DataService = {
  _sendRequest(url) {
    let promise = new MyPromise((resolve, reject) => {
      HttpService.sendRequest(url, resolve, reject);
    });

    return promise;
  },

  getCurrencies(callback) {
    let promise = this._sendRequest(COINS_URL);

    promise.then(
      data => {
        console.log("sinc cb");
        console.log(data);
      },
      err => {
        console.error(err);
      }
    );

    promise.catch(err => {
      console.error(err);
    });
  },

  getCurrenciesPrice(data, callback) {
    let coinsIds = data.map(coin => coin.id);

    const coinsIdMap = coinsIds.reduce((acc, id) => {
      acc[getSingleCoinUrl(id)] = id;
      return acc;
    }, {});

    HttpService.sendMultipleRequests(Object.keys(coinsIdMap), coins => {
      const dataWithPrices = data.map(coinData => {
        let coinPriceUrl = getSingleCoinUrl(coinData.id);
        let [coinPriceData] = coins.find(
          coin => coin.url === coinPriceUrl
        ).data;

        coinData.price = coinPriceData.close;
        return coinData;
      });
      callback(dataWithPrices);
    });
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
    } else if (this._status === 'rejected') {
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
