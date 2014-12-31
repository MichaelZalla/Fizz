# Fizz

An extensible JavaScript library for writing interactive 2D graphics and simulations with HTML5 canvas.

### To-Do's

- [ ] DisplayEntity class should check a '_dirty' flag on each call to 'draw__optimized' (setters for 'width', 'height', 'opacity', etc, should simply set the flag)
- [ ] DisplayEntity class should support an explicit z-index value that is used when rendering a scene
- [ ] DisplayEntity class should support a bitmap filter API ('addFilter', 'removeFilter')
		'''
		var myFilter = function(x, y, pixelData) { ... }
		'''
- [ ] Write spec and implementation for Fizz.Camera class
- [ ] Add camera registration specs and implementation to Fizz.Stage class
- [ ] Write specs and implementation for Fizz.Demo class

##### Considerations...

- [ ] Sprite animations should support customization of playback speeds
- [ ] Memory usage could be reduced by pulling instances of frequently-firing events (e.g. – 'mousemove') from an event object pool
- [ ] The EntityPool class supports dynamic growth; dynamic shrinking of the pool should be possible as well
- [ ] Should the EntityPool class also allow you to reserve an arbitrary number of entities with a single method call?