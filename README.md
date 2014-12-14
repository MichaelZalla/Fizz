### @TODOS

- Write spec for String.format method (Fizz.Object module)
- Write specs and implementation for Fizz.Logger class
- Write specs and implementation for Fizz.Demo class

##### Curiosities...

- Stage shouldn't necessarily have to be tighly coupled with a single context
- Shouldn't Stage be able to render to any arbitrary context,
  while binding on a single context at a time?
- Could collision code be factored out of Fizz.Rectangle and Fizz.Stage (191)?
- Should EntityPool class allow reserving multiple entities at once?
- Look at using Object Pooling for frequently-fired events?
- Add support for proxy hitboxes on DisplayEntities?
- Give '_filters' property to DisplayEntity ('addFilter','removeFilter')?