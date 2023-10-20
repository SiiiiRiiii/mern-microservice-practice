
export const gameUtils = {
    getSurroundingCellsForHuman: (state) => {
        const x = state.player.humanCoordinate.x;
        const y = state.player.humanCoordinate.y;
        const mapDimension = state.terrain.dimension;
        const map = state.terrain.map;
        return getSurroundingCellsInternal(map, mapDimension, x, y);
    },
    getSurroundingCellsForDog: (state) => {
        const x = state.player.dogCoordinate.x;
        const y = state.player.dogCoordinate.y;
        const mapDimension = state.terrain.dimension;
        const map = state.terrain.map;
        return getSurroundingCellsInternal(map, mapDimension, x, y);
    },
    getSurroundingCells: getSurroundingCellsInternal,
    getCurrentCellForHuman: (state) => {
        return state.terrain.map[state.player.humanCoordinate.x][state.player.humanCoordinate.y];
    },
    getCurrentCellForDog: (state) => {
        return state.terrain.map[state.player.dogCoordinate.x][state.player.dogCoordinate.y];
    },
    isHumanOnUnexploredCell: (state) => {
        return state.terrain.map[state.player.humanCoordinate.x][state.player.humanCoordinate.y];
    },
    isDogOnUnexploredCell: (state) => {
        return state.terrain.map[state.player.dogCoordinate.x][state.player.dogCoordinate.y];
    },
    getRandomInteger: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

const getSurroundingCellsInternal = (map, mapDimension, x, y) => {
    if (x > mapDimension.x || y > mapDimension.y) {
        return [];
    }
    const cells = [];
    for (let i = x-1; i < Math.min(x+1, mapDimension.x); i++) {
        for (let j = y-1; j < Math.min(y+1, mapDimension.y); j++) {
            if (i !== x || j !== y) {
                cells.push({
                    x: i,
                    y: j,
                    mapValue: map[i][j]
                });
            }
        }
    }
    return cells;
};