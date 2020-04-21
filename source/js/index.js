import mockData from '/mocks/data.js';
import { getElement, debounce, moveCursorToEnd, includesValue } from './utils.js'

/**
 * Order of displaying the results.
 */
const KEYS_ORDER = ['id', 'name', 'pincode', 'items', 'address'];

/**
 * Represents the app
 * @constructor
 */
class App {
  constructor() {
    this._value = '';
    this._currentHighlighted;

    /**
     * All the DOM references needed
     */
    this.inputWrapper = getElement('.input-wrapper');
    this.inputElem = getElement('input[type="text"]');
    this.clearSearchButton = getElement('.close-icon');
    this.resultsWrapper = getElement('.results');
    this.loader = getElement('.loader-wrapper');

    /**
     * Add nccessary listeners.
     */
    this.addListeners();

    /**
     * Wrapping the function which gets the search result with debounce.
     */
    this.fetchResults = debounce(this.fetchResults.bind(this));
  }

  /**
   * Getters and setters for the value variable
   */
  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    val ? this.clearSearchButton.removeAttribute('hidden') : this.clearSearchButton.setAttribute('hidden', 'true');
    this.callStateChangeFunctions();
  }


  /**
   * Getters and setters for the currentHighlighted variable
   */
  get currentHighlighted() {
    return this._currentHighlighted;
  }

  set currentHighlighted(elem) {
    if (this.currentHighlighted) {
      this.currentHighlighted.removeAttribute('highlight');
    }
    this._currentHighlighted = elem;
    if (this._currentHighlighted) {
      this._currentHighlighted.setAttribute('highlight', 'true');
      this.scrollIntoView()
    }
  }

  /**
   * This function is called everytime there is a change in _value property due to input.
   * It fetches the new search results.
   */
  callStateChangeFunctions() {
    let value = this.value;
    this.inputElem.value = value;
    // value = value.trim().toLowerCase();
    value = value.trim();

    if (value) {
      this.toggleLoader(true);
      this.resultsWrapper.setAttribute('hidden', 'true');
      this.inputWrapper.classList.add('border');
    }

    this.fetchResults(value);
  }

  /**
   * Function toggles the loader.
   * @param {boolean} flag - true value shows the lodaer and false hides it.
   */
  toggleLoader(flag) {
    flag ? this.loader.removeAttribute('hidden') : this.loader.setAttribute('hidden', 'true');
  }

  /**
   * Function calls the search function and make the necessary DOM updates.
   * @param {string} value - Input value that needs to be searched
   */
  fetchResults(value) {
    if (value) {
      this.search(value).then(results => {
        this.inputElem.focus();
        this.toggleLoader(false);

        this.resultsWrapper.removeAttribute('hidden');
        if (results && Object.entries(results).length) {
          this.renderResults(results, value);
        } else {
          this.resultsWrapper.innerHTML = `<span class="message">No User found</span>`;
        }
      });
    } else {
      this.toggleLoader(false);
      this.inputWrapper.classList.remove('border');
      this.resultsWrapper.setAttribute('hidden', 'true');
      this.resultsWrapper.innerHTML = '';
    }
  }

  /**
   * Function scrolls the list elements in the view when use navigates the list 
   * using mouse or keyboard.
   */
  scrollIntoView() {
    const {
      y: yParent,
      bottom: bottomParent
    } = this.resultsWrapper.getBoundingClientRect();

    const {
      y,
      bottom
    } = this.currentHighlighted.getBoundingClientRect();

    if (y >= yParent && bottom <= bottomParent) {
      return;
    }
    if (y < yParent) {
      const isFirstElementInCategory = this.currentHighlighted.previousElementSibling && this.currentHighlighted.previousElementSibling.className === 'result-category';

      this.resultsWrapper.scrollTo({
        top: isFirstElementInCategory ? this.resultsWrapper.scrollTop - (yParent - y + 24) : this.resultsWrapper.scrollTop - (yParent - y),
        behavior: 'smooth'
      });
    }
    if (bottom > bottomParent) {
      this.resultsWrapper.scrollTo({
        top: this.resultsWrapper.scrollTop + (bottom - bottomParent),
        behavior: 'smooth'
      });
    }
  }

  /**
   * Function returns a promise that resolves to the search results.
   * @param {string} searchString - string that needs to be searched.
   */
  search(searchString) {
    return new Promise(resolve => {
      console.log('Searching value: ', searchString);
      const result = {};

      mockData.forEach(user => {
        Object.entries(user).forEach(([key, val], index) => {
          if (includesValue(val, searchString)) {
            if (result[key]) {
              result[key].push(user);
            } else {
              result[key] = [user];
            }
          }
        })
      });
      resolve(result);
    });
  }

  /**
   * Function is called from the contructor. 
   * It adds the ncessary event listeners to all the elements required.
   */
  addListeners() {
    this.clearSearchButton.addEventListener('click', () => {
      this.value = '';
    });

    this.clearSearchButton.addEventListener('keydown', e => {
      const key = e.keyCode ? e.keyCode : e.which;
      if (key === 13) {
        this.inputElem.focus();
        this.value = '';
      }
    });

    this.inputElem.addEventListener('keyup', e => {
      const key = e.keyCode ? e.keyCode : e.which;
      if (key <= 40 && key > 36) {
        if (key === 38 || key === 40) {
          moveCursorToEnd(this.inputElem);
          this.handleListNavigation(key === 38 ? 'UP' : 'DOWN')
        }
        return false;
      }
      this.value = e.target.value;
    });

    this.resultsWrapper.addEventListener('mouseover', this.handleFocus);
    this.resultsWrapper.addEventListener('mouseleave', this.handleFocus);
  }
  /**
   * Function assigns the new selected element in the list on keyboard navigation.
   * @param {string} direction - Direction that specifies whether up or down arrow button was clicked. 
   */
  handleListNavigation(direction) {
    const results = this.resultsWrapper.querySelectorAll('.result-item');

    if (this.currentHighlighted) {
      const index = Array.prototype.indexOf.call(results, this.currentHighlighted);

      if (direction === 'UP') {
        this.currentHighlighted = index === 0 ? null : results[index - 1]
      } else if (index !== results.length - 1) {
        this.currentHighlighted = results[index + 1];
      }
    } else {
      if (direction === 'UP') return;
      this.currentHighlighted = results[0];
    }
  }

  /**
   * Event handler for mouseover and mouse leave events on list wrapper.
   */
  handleFocus = (e) => {
    if ((e.target.className === 'result-item' || e.target.className === 'result-category') && e.type === 'mouseover') {
      if (e.target.className === 'result-category') {
        this.currentHighlighted = e.target.nextElementSibling;
      } else {
        this.currentHighlighted = e.target;
      }
      this.inputElem.focus();
    }
    if (e.type === 'mouseleave') {
      this.currentHighlighted = null;
      this.inputElem.focus();
    }
  }

  /**
   * Function highlists the searched text in the results for each and every key.
   * @param {string} value - Actual value of the field
   * @param {string} textToHighlight - substring of value param that needs to be highlighted.
   */
  highlightSearchedText(value, textToHighlight) {
    try {
      return value.split(textToHighlight).join(`<mark>${textToHighlight}</mark>`);
    } catch (err) {
      return value;
    }
  }

  /**
   * Function creates the DOM when new results are recieved.
   * @param {object} data  - Search results.
   * @param {string} searchedValue - value searched
   */
  renderResults(data, searchedValue) {
    this.currentHighlighted = null;

    this.resultsWrapper.innerHTML = '';

    let template = '';
    let tabIndexCount = 3;

    KEYS_ORDER.forEach(key => {
      const keyData = data[key] || [];
      if (keyData.length) {
        template += `<div class="result-category">"${searchedValue}" found in ${key}</div>`;
      }
      template += keyData.reduce((partialTemplate, value) => partialTemplate += `
        <div class="result-item" tabindex=${tabIndexCount++}>
          <div class="id">${key === 'id' ? this.highlightSearchedText(value.id, searchedValue) : value.id}</div>
          <div class="name">${key === 'name' ? this.highlightSearchedText(value.name, searchedValue) : value.name}</div>
          ${value.items && value.items.length ? `
            <div class="items">
              <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 0 24 24" width="14" fill="#333">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
                />
                <path d="M0 0h24v24H0z" fill="none" />
              </svg>
              ${value.items.reduce((acc, value) => acc += `<span>${key === 'items' ? this.highlightSearchedText(value, searchedValue) : value}</span>`, '')}
            </div>` : ''}
          <div class="address">${key === 'address' ? this.highlightSearchedText(value.address, searchedValue) : value.address}</div>
          <div class="pincode">${key === 'pincode' ? this.highlightSearchedText(value.pincode, searchedValue) : value.pincode}</div>
        </div>`
        , '');


    })

    this.resultsWrapper.innerHTML = template;
    this.resultsWrapper.scrollTop = 0;
  }
}

/**
 * Craeting an instance.
 */
new App();
