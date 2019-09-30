## Doodle Jump Genetic Algorithm - NEAT (NeuroEvolution of Augmenting Topologies)

Technologies used:
- [Toy-Neural-Network-JS](https://github.com/CodingTrain/Toy-Neural-Network-JS)
- [p5.js](https://p5js.org/)
- HTML/CSS, JavaScript

Why pick [Toy-Neural-Network-JS](https://github.com/CodingTrain/Toy-Neural-Network-JS) over [TensorFlow.js](https://www.tensorflow.org/js)?
- In the Browser, Toy-Neural-Network-JS performed a lot better than TensorFlow.js as it did not rely on WebGL/GPU, and it was written purely in JS and thus was lightweight. 

Credits:
- I was able to build this from following [Daniel Shiffman](https://shiffman.net/)'s [11: Neuroevolution - The Nature of Code](https://www.youtube.com/playlist?list=PLRqwX-V7Uu6Yd3975YwxrR0x40XGJ_KGO) for another game Flappy Bird.
- [A Game A Day 12 - JavaScript Doodle Jump!](https://youtu.be/CyAOEisE8_k)

## How well does the AI Perform?
- While this AI isn't perfect (i.e. doesn't beat the game), it does perform pretty well. The game wan run for about 400 generations, and the score did increase over generations.
- Note: This simulation was performed without [crossover](https://en.wikipedia.org/wiki/Crossover_(genetic_algorithm)), instead, a single parent was copied when generating the new population.

    ### Average Score over Generations
    
    
    ### High Score over Generations
