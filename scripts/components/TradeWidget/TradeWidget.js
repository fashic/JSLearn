export class TradeWidget {
  constructor({ element, buyInfo }) {
    this._el = element;
    this._buyInfoCallback = buyInfo;
    // обработчик событий ввода кол-ва монет
    this._el.addEventListener("input", e => {
      const value = +e.target.value;
      this._updateDisplay(value);
    });
    // Close to button
    this._el.addEventListener("click", e => {
      e.preventDefault();

      if (e.target.closest('[data-action="btn-closed"]')) {
        this._close();
      }
      if (e.target.closest('[data-action="btn-buy"]')) {
        this._buyInfo(e);
        this._close();
      }
    });
  }
  trade(item) {
    this._currentItem = item;
    this._total = item.price * 0;
    this._itemId = item.id; // id для портфолио
    this._render(item); // запуск отрисовки виджета
  }
  // отрисовка обновленой цены
  _updateDisplay(value) {
    this._totalEl = this._el.querySelector("#item-total");
    this._totalEl.textContent = this._currentItem.price * value;
    this._totalSum = this._currentItem.price * value;
  }
  // Завершение сделки по кнопке
  _buyInfo(e) {
    const item = this._itemId;
    const amount = this._el.querySelector("#amount").value;
    this._buyInfoCallback(item, amount);
    // console.log(id);
    // console.log(totalSum);
  }
  //  закрытие виджета
  _close() {
    this._el.querySelector("#modal").classList.remove("open");
  }

  // Отрисовка
  _render(item) {
    this._el.innerHTML = `
      <div id="modal" class="modal open">
        <div class="modal-content">
          <h4>Buying ${item.name}:</h4>
          <p>
            Current price: ${item.price}. Total: <span id="item-total">${
      this._total
    }</span>
          </p>
        <div class="row">
              <form class="col s12">
                  <div class="input-field col s4">
                      <input id="amount" type="text">
                      <label for="amount">Amount</label>
                  </div>
              </form>
              </div>
          </div>
          
          <div class="modal-footer">
            <a href="#!" class="modal-close waves-effect waves-teal btn-flat"  data-action="btn-buy" >Buy</a>
            <a href="#!" class="modal-close waves-effect waves-teal btn-flat " data-action="btn-closed">Cancel</a>
          </div>
      </div>
    `;
    // Элементы materialize
    let elems = this._el.querySelectorAll(".collapsible");
    M.Collapsible.init(elems);
  }
}

