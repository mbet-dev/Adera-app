const RIGHT = 1;
const LEFT = 2;
const UP = 4;
const DOWN = 8;
// Public interface
export const Directions = {
    RIGHT: RIGHT,
    LEFT: LEFT,
    UP: UP,
    DOWN: DOWN,
};
// Internal interface
export const DiagonalDirections = {
    UP_RIGHT: UP | RIGHT,
    DOWN_RIGHT: DOWN | RIGHT,
    UP_LEFT: UP | LEFT,
    DOWN_LEFT: DOWN | LEFT,
};
