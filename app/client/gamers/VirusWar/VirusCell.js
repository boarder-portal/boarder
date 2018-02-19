import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { games as gamesConfig, colors } from '../../../config/constants.json';

const {
  virus_war: {
    virusesTypes,
    virusesShapes,
    cellSize,
    borderWidth
  }
} = gamesConfig;

class VirusCell extends Component {
  static propTypes = {
    type: PropTypes.string,
    shape: PropTypes.string,
    color: PropTypes.string
  };

  render() {
    const {
      type,
      shape,
      color
    } = this.props;

    if (!type) {
      return null;
    }

    const eventualColor = colors[color];
    const eventualShape = virusesShapes[shape];

    return (
      <svg
        className="virus-cell"
        width={cellSize + borderWidth}
        height={cellSize + borderWidth}
        strokeWidth={borderWidth}
      >
        {do {
          /* eslint-disable no-unused-expressions */
          if (eventualShape === virusesShapes.CIRCLE) {
            <circle
              cx={(cellSize + borderWidth) / 2}
              cy={(cellSize + borderWidth) / 2}
              r={cellSize / 2}
              stroke={eventualColor}
              fill={type === virusesTypes.FORTRESS ? eventualColor : 'rgba(0,0,0,0)'}
            />;
          } else if (eventualShape === virusesShapes.RECT) {
            <rect
              x={borderWidth / 2}
              y={borderWidth / 2}
              width={cellSize}
              height={cellSize}
              stroke={eventualColor}
              fill={type === virusesTypes.FORTRESS ? eventualColor : 'rgba(0,0,0,0)'}
            />;
          }
          /* eslint-enable no-unused-expressions */
        }}
      </svg>
    );
  }
}

export default VirusCell;
