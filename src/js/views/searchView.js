class SearchView {
  // Form element
  _parentElement = document.querySelector('.search');

  // returning the input field values
  getKeyword() {
    const keyword = this._parentElement.querySelector('.search__field').value;
    this._clearInput();
    return keyword;
  }

  // add the listener to the whole form
  addEventListener(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }

  _clearInput() {
    this._parentElement.querySelector('.search__field').value = ' ';
  }
}

export default new SearchView();
