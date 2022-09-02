export default num => {
  num = num.toString();
  let left;
  let right;
  if (num.includes('.')) {
    left = num.substr(0, num.indexOf('.'));
    right = num.substr(num.indexOf('.') + 1, 2);
  } else {
    left = num;
    right = '';
  }
  if (right.length === 0) {
    right += '00';
  } else if (right.length === 1) {
    right += '0';
  }
  if (right === 'NaN' || left === 'NaN') {
    return '?';
  } else {
    return `${left}.${right}`;
  }
};
