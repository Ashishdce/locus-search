export const debounce = (cb, time = 250) => {
  let timerId;
  return (val) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      return cb.call(this, val);
    }, time)
  }
};

export const getElement = selector => document.querySelector(selector);

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
