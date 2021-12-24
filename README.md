# Refactoring Code
In this repository I'm taking some of my old projects and refactoring for cleaner and more understandable code.

## 1. Mapbox API Project
This is my practice project to familiarise myself with Mapbox and its various API

For this project, I repositioned various code parts and grouping them by functionality. I also added comments to make it more clear what I intend to do with different blocks of code.

Moreover, I turned the public array "markers" into a closure with returning methods to manipulate the actual array inside. I do this because in various places, I find myself reusing the same code over and over to one task (in this situation to remove all items in the array). By using closure to encapsulate the markers, I can make the actual array private and only manipulated through its public methods.

I also broke down some big functions into smaller ones with specific purpose in order not to clutter the code

# Further research

## 1. Function and Arrow function
### The binding of **this**
- In an arrow function, this points to the value of this that its immediate parent points to.
- In a normal function, this points to the object that invokes it or the object that it is bound with. When a function is bind to an element using an event listener, this is the element that invoked the function.

![The nature of this keyword](https://res.cloudinary.com/practicaldev/image/fetch/s--kkP9aMfp--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://thepracticaldev.s3.amazonaws.com/i/jenuvv92wga4zgbq4u2g.png)

### Arguments object
- An arrow function doesn't receive arguments object like a normal function would.

### Constructible and Callable
- An arrow function is only callable, while a normal function is both.

## 2. Class and closure
- Class use **this** keyword to point to the private data
- Closure supports encapsulation while classes don't


