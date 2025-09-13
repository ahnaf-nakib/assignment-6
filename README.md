1) Difference between var, let, and const

var → Old way. Function-scoped. Can be re-declared and updated.

let → Modern way. Block-scoped. Can be updated but not re-declared in the same scope.

const → Block-scoped. Cannot be re-assigned (value fixed), but objects/arrays inside can still change.

👉 Use let for values that change, const for fixed ones.

2) Difference between map(), forEach(), and filter()

forEach() → Just loops through array items. Doesn’t return anything.

map() → Loops and creates a new array by transforming items.

filter() → Loops and creates a new array with only items that pass a condition.

👉 forEach = only looping, map = transform, filter = select.

3) Arrow functions in ES6

A shorter way to write functions.

Example:

// Normal function
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;


They don’t have their own this, which makes them useful in callbacks.

4) Destructuring assignment in ES6

A way to unpack values from arrays or objects into variables.

Example:

// Array destructuring
const [a, b] = [10, 20]; 
console.log(a); // 10
console.log(b); // 20

// Object destructuring
const person = {name: "Nazmul", age: 26};
const {name, age} = person;
console.log(name); // Nazmul
console.log(age);  // 26

5) Template literals in ES6

Strings written with backticks (`).

Allow multiline strings and easy variable embedding.

Example:

let name = "Nazmul";
let msg = `Hello, ${name}! How are you?`;
console.log(msg); // Hello, Nazmul! How are you?


✅ Difference from string concatenation:

Concatenation uses + → "Hello " + name + "!"

Template literals use ${} → much cleaner & readable.
