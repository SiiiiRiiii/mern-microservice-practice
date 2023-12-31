import { gameUtils } from "../../../utils/utils";
import _ from "lodash";
import {mapValue} from "../../../utils/constants";

export const humanActions = {
    explore: (state) => {
        const surroundingCells = gameUtils.getSurroundingCellsForHuman(state);
        const unknownSurroundingCellExists = _.chain(surroundingCells)
            .map(cell => state.terrain.fogMap[cell.y][cell.x])
            .reduce((acc, unknown) => acc || unknown, false)
            .value();
        if (!unknownSurroundingCellExists) {
            // cannot explore if surrounding cells all explored
            return;
        }
    
        const cursedCells = [mapValue.cursedGrass, mapValue.cursedTree, mapValue.cursedBabyTree]
        let discoveredCursedGrassCount = 0;
        // set surrounding cells unknown to false
        _.forEach(surroundingCells, cell => {
            if (state.terrain.map[cell.y][cell.x] && cursedCells.includes(cell.mapValue)) {
                discoveredCursedGrassCount += 1;
            }
            state.terrain.fogMap[cell.y][cell.x] = false;
        });
    
        // sanity -5 per cursed grass per discovered cursed grass
        state.player.humanStatus.sanity -= discoveredCursedGrassCount * 5;
        if (mapValue.cursedGrass === gameUtils.getCurrentCellForHuman(state)) {
            state.player.humanStatus.sanity -= 10;
        }
        state.player.humanStatus.actionPoints -= 1;
        state.player.humanStatus.workPoints += 1;
    },
    feedDog: (state) => {
        // cannot interact if unexplored or no action points
        // cannot interact if user and dog do not share the same coordinates
        // cannot feed dog without food or if dog is dead
        if (gameUtils.isHumanOnUnexploredCell(state) || state.player.humanStatus.actionPoints < 1) {
            return;
        }
        if (state.player.dogCoordinate.x !== state.player.humanCoordinate.x
            || state.player.dogCoordinate.y !== state.player.humanCoordinate.y) {
            return;
        }
        if (state.player.inventory.food < 1 || !state.player.dogStatus.alive) {
            return;
        }
        
        if (!state.player.dogStatus.onTeam) {
            state.player.dogStatus.onTeam = true;
        }
        state.player.inventory.food -= 1;
        state.player.dogStatus.hunger = Math.min(100, state.player.dogStatus.hunger + 40);
        state.player.humanStatus.actionPoints -= 1;
        state.player.humanStatus.workPoints += 1;
    },
    buildBoat: (state) => {
        const humanCoordinate = state.player.humanCoordinate;
        // cannot interact if unexplored or no action points
        if (gameUtils.isHumanOnUnexploredCell(state) || state.player.humanStatus.actionPoints < 1) {
            return;
        }
        // cannot build boat if the user is not in shallow water
        if (mapValue.water !== gameUtils.getCurrentCellForHuman(state)) {
            return;
        }
        // cannot build boat if there isn't enough wood in the inventory
        if (state.player.inventory.wood < 5) {
            return;
        }
    
        state.terrain.map[humanCoordinate.y][humanCoordinate.x] = mapValue.boat;
        state.player.inventory.wood -= 5;
        state.player.humanStatus.onBoat = true;
        state.player.humanStatus.actionPoints -= 1;
        state.player.humanStatus.workPoints += 1;
    },
    fish: (state, fishingLuck) => {
        // cannot interact if unexplored or no action points
        if (gameUtils.isHumanOnUnexploredCell(state) || state.player.humanStatus.actionPoints < 1) {
            return;
        }
        // cannot fish if the user is neither in shallow water nor on boat
        if (![mapValue.water, mapValue.boat].includes(gameUtils.getCurrentCellForHuman(state))) {
            return;
        }
    
        // fish: 70% 1 fish, 25% 2 fish, 5% garbage
        if (fishingLuck >= 75) {
            state.player.inventory.fish += 2;
        } else if (fishingLuck >= 5) {
            state.player.inventory.fish += 1;
        }
        state.player.humanStatus.actionPoints -= 1;
        state.player.humanStatus.workPoints += 1;
    },
    startFarm: (state) => {
        // cannot interact if unexplored or no action points
        if (gameUtils.isHumanOnUnexploredCell(state) || state.player.humanStatus.actionPoints < 1) {
            return;
        }
        // cannot interact if this is not a grass or paw
        const currentX = state.player.humanCoordinate.x;
        const currentY = state.player.humanCoordinate.y;
        if (![mapValue.paw, mapValue.grass].includes(gameUtils.getCurrentCellForHuman(state))) {
            return;
        }
    
        // - cannot plant crop if no seeds left in inventory
        if (state.player.inventory.seed < 1) {
            return;
        }
        // - modify map
        // - inventory seed -1
        // - plantEnergy resets to 0
        state.terrain.map[currentY][currentX] = mapValue.seedling;
        state.player.inventory.seed -= 1;
        state.terrain.plantEnergyMap[currentY][currentX] = 0;
        state.player.humanStatus.actionPoints -= 1;
        state.player.humanStatus.workPoints += 1;
    },
    plantTree: (state) => {
        // cannot interact if unexplored or no action points
        if (gameUtils.isHumanOnUnexploredCell(state) || state.player.humanStatus.actionPoints < 1) {
            return;
        }
        // cannot interact if this is not a grass or paw
        const currentX = state.player.humanCoordinate.x;
        const currentY = state.player.humanCoordinate.y;
        if (![mapValue.paw, mapValue.grass].includes(gameUtils.getCurrentCellForHuman(state))) {
            return;
        }
    
        // - cannot plant where there's no sapling in inventory
        if (state.player.inventory.sapling < 1) {
            return;
        }
        // - inventory sapling -1
        // - plantEnergy on cell resets to 0
        state.player.inventory.sapling -= 1;
        state.terrain.map[currentY][currentX] = mapValue.babyTree;
        state.terrain.plantEnergyMap[currentY][currentX] = 0;
        state.player.humanStatus.actionPoints -= 1;
        state.player.humanStatus.workPoints += 1;
    },
    harvest: (state, harvestLuck) => {
        // cannot interact if unexplored or no action points
        // cannot interact if this is not a grown crop
        if (gameUtils.isHumanOnUnexploredCell(state) || state.player.humanStatus.actionPoints < 1) {
            return;
        }
        const currentX = state.player.humanCoordinate.x;
        const currentY = state.player.humanCoordinate.y;
        if (mapValue.farm !== gameUtils.getCurrentCellForHuman(state)) {
            return;
        }
    
        // - cell becomes grass
        // - seed +2 if number > 0, else +1
        // - crop +(1 + number)
        state.terrain.map[currentY][currentX] = mapValue.grass;
        state.player.inventory.seed += harvestLuck > 0 ? 2 : 1;
        state.player.inventory.crop += 1 + harvestLuck;
        state.player.humanStatus.actionPoints -= 1;
        state.player.humanStatus.workPoints += 1;
    },
    makeFood: (state) => {
        // cannot interact if unexplored or there's no action point left
        // cannot interact if this is not a house
        if (gameUtils.isHumanOnUnexploredCell(state) || state.player.humanStatus.actionPoints < 1) {
            return;
        }
        if (mapValue.house !== gameUtils.getCurrentCellForHuman(state)) {
            return;
        }
    
        // - needs at least 1 action point
        // - inventory food +(sum of fish and crop)
        // - inventory fish resets to 0, crop resets to 0
        state.player.inventory.food += state.player.inventory.fish + state.player.inventory.crop;
        state.player.inventory.fish = 0;
        state.player.inventory.crop = 0;
        state.player.humanStatus.workPoints += 1;
        state.player.humanStatus.actionPoints -= 1;
    },
    eat: (state) => {
        // cannot interact if unexplored
        // cannot interact if this is not a house
        // cannot interact if there's no food left in the inventory
        if (gameUtils.isHumanOnUnexploredCell(state)) {
            return;
        }
        if (mapValue.house !== gameUtils.getCurrentCellForHuman(state)) {
            return;
        }
        if (state.player.inventory.food < 1) {
            return;
        }
        
        state.player.humanStatus.hunger = Math.min(100, state.player.humanStatus.hunger + 30);
        state.player.inventory.food -= 1;
    },
    rest: (state) => {
        // cannot interact if unexplored
        // cannot interact if this is not a house
        if (gameUtils.isHumanOnUnexploredCell(state)) {
            return;
        }
        if (mapValue.house !== gameUtils.getCurrentCellForHuman(state)) {
            return;
        }
        // sanity changes will be determined by restPoints/workPoints at forwardTime
        state.player.humanStatus.restPoints += _.clone(state.player.humanStatus.actionPoints);
        state.player.humanStatus.actionPoints = 0;
    },
    releaseTreeEnergy: (state, energyLuck) => {
        // cannot interact if unexplored or no action points
        // cannot interact if this is not a tree
        if (gameUtils.isHumanOnUnexploredCell(state) || state.player.humanStatus.actionPoints < 1) {
            return;
        }
        if (![mapValue.tree, mapValue.cursedTree].includes(gameUtils.getCurrentCellForHuman(state))) {
            return;
        }
    
        // declare number from action payload: random integer between 3 and 8
        let remainingEnergy = _.clone(energyLuck);
        // - inventory sapling +2, wood +1
        state.player.inventory.sapling += 2;
        state.player.inventory.wood += 1;
        // - starting clockwise on top of the cell, if neighbour cell is cursed then change neighbour cell to grass
        // or if the neighbour cell is a tree/baby tree on cursed grass, then change the grass to normal
        const surroundingCells = gameUtils.getSurroundingCellsForHuman(state);
        _.forEach(surroundingCells, cell => {
            if (mapValue.cursedGrass === cell.mapValue && remainingEnergy > 0) {
                state.terrain.map[cell.y][cell.x] = mapValue.grass;
                remainingEnergy -= 1;
            } else if (mapValue.cursedBabyTree === cell.mapValue && remainingEnergy > 0) {
                state.terrain.map[cell.y][cell.x] = mapValue.babyTree;
                remainingEnergy -= 1;
            } else if (mapValue.cursedTree === cell.mapValue && remainingEnergy > 0) {
                state.terrain.map[cell.y][cell.x] = mapValue.tree;
                remainingEnergy -= 1;
            }
        });
        // the tree itself becomes grass
        state.terrain.map[state.player.humanCoordinate.y][state.player.humanCoordinate.x] = mapValue.grass;
        // - overflowed healing restores sanity: +3 per over-heal
        state.player.humanStatus.sanity = Math.min(100, state.player.humanStatus.sanity + 3 * remainingEnergy);
        // - consume 1 action point
        state.player.humanStatus.actionPoints -= 1;
        state.player.humanStatus.workPoints += 1;
    },
    cleanWilt: (state) => {
        // cannot interact if unexplored or no action points
        // cannot interact if this is not a wilt
        if (gameUtils.isHumanOnUnexploredCell(state) || state.player.humanStatus.actionPoints < 1) {
            return;
        }
        if (mapValue.wilt !== gameUtils.getCurrentCellForHuman(state)) {
            return;
        }
    
        // - cell becomes grass
        state.terrain.map[state.player.humanCoordinate.y][state.player.humanCoordinate.x] = mapValue.grass;
        // - consume 1 action point
        state.player.humanStatus.actionPoints -= 1;
        state.player.humanStatus.workPoints += 1;
    }
};

export const dogActions = {
    explore: (state) => {
        const surroundingCells = gameUtils.getSurroundingCellsForDog(state);
        const unknownSurroundingCellExists = _.chain(surroundingCells)
            .map(cell => state.terrain.fogMap[cell.y][cell.x])
            .reduce((acc, unknown) => acc || unknown, false)
            .value();
        if (!unknownSurroundingCellExists) {
            // cannot explore if surrounding cells all explored
            return;
        }
    
        // set surrounding cells unknown to false
        _.forEach(surroundingCells, cell => {
            state.terrain.fogMap[cell.y][cell.x] = false;
        });
        
        state.player.dogStatus.actionPoints -= 1;
    },
    cleanWilt: (state) => {
        // cannot interact if unexplored or no action points
        // cannot interact if this is not a wilt
        if (gameUtils.isDogOnUnexploredCell(state) || state.player.dogStatus.actionPoints < 1) {
            return;
        }
        if (mapValue.wilt !== gameUtils.getCurrentCellForDog(state)) {
            return;
        }
    
        // - cell becomes grass
        state.terrain.map[state.player.dogCoordinate.y][state.player.dogCoordinate.x] = mapValue.grass;
        // - consume 1 action point
        state.player.dogStatus.actionPoints -= 1;
    }
};
