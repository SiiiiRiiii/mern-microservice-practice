import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";

export const Player = () => {
    const dimension = useSelector(state => state.game.terrain.dimension);
    const humanCoordinate = useSelector(state => state.game.player.humanCoordinate);
    const dogCoordinate = useSelector(state => state.game.player.dogCoordinate);
    const fogMap = useSelector(state => state.game.terrain.fogMap);
    
    const PlayerLayerCell = ({x, y}) => {
        if (humanCoordinate.x === x && dogCoordinate.x === x && humanCoordinate.y === y && dogCoordinate.y === y) {
            return (
                <div className="cell player-dog">
                    <FontAwesomeIcon icon={"user"}/>
                    <FontAwesomeIcon icon={"dog"}/>
                </div>
            );
        } else if (humanCoordinate.x === x && humanCoordinate.y === y) {
            return (
                <div className="cell player">
                    <FontAwesomeIcon icon={"user"}/>
                </div>
            );
        } else if (dogCoordinate.x === x && dogCoordinate.y === y && !fogMap[y][x]) {
            return (
                <div className="cell dog">
                    <FontAwesomeIcon icon={"dog"}/>
                </div>
            );
        } else {
            return (<div className="cell"></div>);
        }
    }
    
    return (
        <div className="map-layer">
            {[...Array(dimension.x + 1)].map((i, y) => (
                <div className="map-row" key={`player-row-${y}`}>
                    {[...Array(dimension.y + 1)].map((j, x) => (
                        <PlayerLayerCell x={x} y={y} key={`player-cell-${x}-${y}`}/>
                    ))}
                </div>
            ))}
        </div>
    )
}
