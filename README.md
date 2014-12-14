### @TODOS

- Write specs for Fizz.Logger class
- Write specs and implementation for Fizz.Demo class
- Look at object pooling for frequently fired events, such as 'mouseover'?
- Add a 'filters' API to Fizz.DisplayEntity class ('addFilter', 'removeFilter')
  for bitmap (r,g,b) filtering: myFilter = function(x, y, colorData) { ... }

##### Curiosities and considerations...

- Should EntityPool class allow reserving multiple entities at once?
- Should EntityPool class have a method for explicitly deallocating X number of entities
- Should EntityPool class occasionally test for good times to slim down its pool?
- Could collision code be factored out of Fizz.Rectangle and Fizz.Stage (line 191)?

##### Outside the scope

- Add support for proxy hitboxes for DisplayEntities