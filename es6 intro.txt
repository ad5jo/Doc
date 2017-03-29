// ES6 adds new features to JavaScript!

// Here are a few of the big ones.
// Feel encouraged to start using ES6 syntax in your own code!
// Code from: http://webapplog.com/es6/
// ====================================================================

// 1. Default Parameters
// --------------------------------------------------------------------

// ES5 Version
// We had to manually assign optional parameters if no one value was given.
var link = function(height, color, url) {
  var height = height || 50;
  var color = color || "red";
  var url = url || "http://www.google.com";
}

// ES6 Version
// We can now assign the optional parameter in the function itself
var link = function(height = 50, color = "red", url = "http://www.google.com") {

}

// 2. Template Literals (String Interpolation)
// --------------------------------------------------------------------

// ES5 Version
// We had to create these messy string combos when injecting variables
var name = "Your name is " + first + " " + last + ".";
var url = "http://localhost:3000/api/messages/" + id;

// ES6 Version
// We can use `` (back-ticks) to combine variables directly into strings.
var name = `Your name is ${first} ${last}.`;
var url = `http://localhost:3000/api/messages/${id}`;

// 3. Destructured Assignments
// --------------------------------------------------------------------

// ES5 Version
// We had to explicitly assign variables to each of the sub-objects

var body = req.body;
var username = body.username;
var password = body.password;

// ES6 Version
// We can now assign each of these variables immediately (if the name matches)
var { username, password } = req.body;

// We can also rename our destructured variables if we want

var { username: myUserName, password: myPassword } = req.body;

// 4. Fat Arrow Functions
// --------------------------------------------------------------------

// ES5 Version
// We had to wrap all our functions in the syntax function(argument) {}
function (num1, num2) {
  console.log(num1 + num2);
}

// ES6 Version
// We can now avoid using the word function and use the => instead.
(num1, num2) => {
  console.log(num1 + num2);
};

// Note: Fat arrow has an extra advantage in that it doesnt change the context of "this".
// i.e. what's inside a fat function is the same "this" as what's outside.

// 5. Let and Const
// --------------------------------------------------------------------

// ES5 Version
// We can't use {} brackets to create variables with limited scope.
// variabless existed through the entire code unless inside a function or loop.
// Both const and let are block scoped.
var x = 500;
{
  var x = 400;
  console.log(x); // prints 400, x has been reasigned
}
console.log(x); // prints 400

// ES6 Version
// We can use let and const to limit the changes.

let i = 400;
{
  let i = 500;
  console.log(i); // prints 500
}
console.log(i); // prints 400

// ES5 Version

var PORT = process.env.PORT || 3000;
PORT = {}; // previously we couldn't set up constant values in JavaScript

// ES6 Version

const PORT = process.env.PORT || 3000;
port = 22; // this won't work. const variables can't be reasigned a new value

// It's important to note that const arrays and objects can be changed, unlike primitive types,
// But they can't be reassigned brand new values.

// 6. Classes****
// --------------------------------------------------------------------

// This is the most important change to React, as you see many tutorials using ES6 Classes.
// In essence, classes are a way to utilize object-oriented programming.
// They are complex in ES5.

// ES5 Version
// We create a function and modify prototypes
// This becomes complex when attempting to extend an existing object

function BaseModel(options, data) {
  this.name = "Base";
  this.url = "http://azat.co/api";
  this.data = data || [];
  this.options = options || {};
}

// class method
BaseModel.prototype.getName = function getName() {
  console.log("Class name: " + this.name);
}

// ES6 Version
// We create a "class".
// The class has a constructor that gets called whenever we want to create
// an instance of the class.
// We pass in the properties into the constructor when creating.
// We can then get properties or run actions using functions associated with the class.

class BaseModel {
  constructor(options = {}, data = []) {

    this.name = "Base";
    this.url = "http://azat.co/api";
    this.data = data;
    this.options = options;

  }

  getName() { // class method
    console.log(`Class name: ${this.name}`);
  }
}

const newModel = new BaseModel();
newModel.getName(); // prints "Class name: Base"

// 7. Imports / Exports
// --------------------------------------------------------------------

// ES5 Version
// Previously we used require ('module') and module.export to pull in and send dependencies

// ES6 Version
// Lets us simply say import and export.
import { port, getAccounts } from "./module"
export var port = 3000
