# Fizz

An extensible JavaScript library for writing interactive 2D graphics and simulations with HTML5 canvas.

### To-Do's

- [ ] Write specs and implementation for Fizz.Demo class

- [ ] Add variable playback speed for Sprite animations

- [ ] Add a 'filters' API to Fizz.DisplayEntity class ('addFilter', 'removeFilter') for bitmap (r,g,b) filtering: myFilter = function(x, y, colorData) { ... }

- [ ] Changes to a DisplayEntity's dimensions ('width'/'height') should trigger a re-cache

- [ ] DisplayEntities should be given an explicit Z-index used when rendering a scene

- [ ] Look at object pooling for frequently fired events, such as 'mouseover'?

- [ ] Fizz.DisplayGrid class might be missing some specs (copy, clone)

##### Curiosities and considerations...

- Should EntityPool class allow reserving multiple entities at once?

- Should EntityPool class have a method for explicitly deallocating X number of entities

- Should EntityPool class occasionally test for good times to slim down its pool?

- Should object/entity resetting be handled outside of the EntityPool class?

- Could collision code be factored out of Fizz.Rectangle and Fizz.Stage?