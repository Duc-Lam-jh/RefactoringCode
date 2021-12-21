# Refactoring Code
In this repository I'm taking some of my old projects and refactoring for cleaner and more understandable code.

## 1. Mapbox API Project
This is my practice project to familiarise myself with Mapbox and its various API

For this project, I repositioned various code parts and grouping them by functionality. I also added comments to make it more clear what I intend to do with different blocks of code.

Moreover, I turned the public array "markers" into a closure with returning methods to manipulate the actual array inside. I do this because in various places, I find myself reusing the same code over and over to one task (in this situation to remove all items in the array). By using closure to encapsulate the markers, I can make the actual array private and only manipulated through its public methods.

I also broke down some big functions into smaller ones with specific purpose in order not to clutter the code
