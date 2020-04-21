/**
 * Function debounces the callback function by the given amount of time.
 * @param {function} cb - Function that needs to be debounced
 * @param {number} time - Time in milliseconds
 */
export const debounce = (cb, time = 250) => {
  let timerId;
  return (val) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      return cb.call(this, val);
    }, time)
  }
};

/**
 * Function gets the DOM elements ref.
 * @param {string} selector - Valid css selector.
 */
export const getElement = selector => document.querySelector(selector);

/**
 * Function moves the cursor to the end of the input field while using arrow keys.
 * @param {object} elem - Node element, in our case it will be input element.
 */
export const moveCursorToEnd = elem => {
  if (typeof elem.selectionStart === 'number') {
    elem.selectionStart = elem.selectionEnd = elem.value.length;
  } else if (typeof elem.createTextRange !== 'undefined') {
    elem.focus();
    let range = elem.createTextRange();
    range.collapse(false);
    range.select();
  }
}

/**
 * Function returns boolean value if the substring is found in the main string.
 * @param {string | array} val - main string in this case.
 * @param {string} searchString - substring that needs to be searched. 
 */
export const includesValue = (val, searchString) => {
  if (Array.isArray(val)) {
    let flag = false;
    val.forEach(item => {
      // if (!flag && item.toLowerCase().includes(searchString)) flag = true;
      if (!flag && item.includes(searchString)) flag = true;
    });
    return flag;
  } else {
    // return val.toLowerCase().includes(searchString);
    return val.includes(searchString);
  }
}
