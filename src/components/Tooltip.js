import React, { PureComponent } from 'react'
import { Connect } from 'react-state'
import { Animate } from 'react-move'
//
import Utils from '../utils/Utils'
import Selectors from '../utils/Selectors'
//

const fontSize = 12

class Tooltip extends PureComponent {
  static defaultProps = {
    position: 'average',
    align: 'top',
    children: props => {
      const { series, datums, primaryAxis, secondaryAxis } = props
      return series
        ? <div>
            <strong>{series.label}</strong><br />
          </div>
        : datums && datums.length
          ? <div>
              <div
                style={{
                  marginBottom: '3px',
                }}
              >
                <strong>{primaryAxis.format(datums[0].primary)}</strong>
              </div>
              <table>
                <tbody>
                  {(secondaryAxis.stacked
                    ? [...datums].reverse()
                    : datums).map((d, i) =>
                    (<tr key={i}>
                      <td>
                        <span style={{ color: d.statusStyles.hovered.fill }}>
                          &#9679;
                        </span>
                        {' '}{d.seriesLabel}: &nbsp;
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                        }}
                      >
                        {Math.floor(d.secondary) < d.secondary
                          ? secondaryAxis.format(Math.round(d.secondary * 100) / 100)
                          : secondaryAxis.format(d.secondary)}
                      </td>
                    </tr>)
                  )}
                </tbody>
              </table>
            </div>
          : null
    },
  }
  render () {
    const {
      hovered,
      primaryAxis,
      secondaryAxis,
      offset: { left, top },
      gridX,
      gridY,
      cursor,
      //
      position,
      align,
      children,
    } = this.props

    if (!primaryAxis || !secondaryAxis || !hovered || !cursor) {
      return null
    }

    const datums = hovered.datums && hovered.datums.length
      ? hovered.datums
      : hovered.series ? hovered.series.data : null

    // TODO: tooltip origin: hovered or chart or custom. Allows the user to position the tooltip relative to different parts of the chart
    // TODO: tooltip hardcoded offset and/or dynamic offset based on target element

    const focus = datums
      ? typeof position === 'function'
        ? position(datums, cursor)
        : position === 'left'
          ? Utils.getCenterPointOfSide('left', datums)
          : position === 'right'
            ? Utils.getCenterPointOfSide('right', datums)
            : position === 'top'
              ? Utils.getCenterPointOfSide('top', datums)
              : position === 'bottom'
                ? Utils.getCenterPointOfSide('bottom', datums)
                : position === 'center'
                  ? Utils.getCenterPointOfSide('center', datums)
                  : position === 'cursor'
                    ? cursor
                    : Utils.getClosestPoint(cursor, datums).focus // : quadTree.find(cursor.x, cursor.y)
      : {
        x: gridX,
        y: gridY,
      }

    const x = gridX + focus.x
    const y = gridY + focus.y

    let alignX
    let alignY

    let triangleStyles = {}

    if (align === 'top') {
      alignX = '-50%'
      alignY = '-100%'
      triangleStyles = {
        top: '100%',
        left: '50%',
        transform: 'translate(-50%, 0%)',
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderTop: '5px solid rgba(38, 38, 38, 0.8)',
      }
    } else if (align === 'bottom') {
      alignX = '-50%'
      alignY = '0%'
      triangleStyles = {
        top: '0%',
        left: '50%',
        transform: 'translate(-50%, -100%)',
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderBottom: '5px solid rgba(38, 38, 38, 0.8)',
      }
    } else if (align === 'left') {
      alignX = '-100%'
      alignY = '-50%'
      triangleStyles = {
        top: '50%',
        left: '100%',
        transform: 'translate(0%, -50%)',
        borderTop: '5px solid transparent',
        borderBottom: '5px solid transparent',
        borderLeft: '5px solid rgba(38, 38, 38, 0.8)',
      }
    } else if (align === 'right') {
      alignX = '0%'
      alignY = '-50%'
      triangleStyles = {
        top: '50%',
        left: '0%',
        transform: 'translate(-100%, -50%)',
        borderTop: '5px solid transparent',
        borderBottom: '5px solid transparent',
        borderRight: '5px solid rgba(38, 38, 38, 0.8)',
      }
    } else if (align === 'center') {
      // TODO: Automatic Mode
      alignX = '-50%'
      alignY = '-50%'
      triangleStyles = {
        opacity: 0,
      }
    }

    const visibility = hovered.active ? 1 : 0

    return (
      <Animate
        data={{
          x,
          y,
          alignX,
          alignY,
          triangleStyles,
          visibility,
        }}
        duration={400}
      >
        {({ x, y, alignX, alignY, triangleStyles, visibility }) =>
          (<div
            className='tooltip-wrap'
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              left: `${left}px`,
              top: `${top}px`,
              opacity: visibility,
            }}
          >
            <div
              style={{
                transform: `translate3d(${x}px, ${y}px, 0px)`,
              }}
            >
              <div
                style={{
                  transform: `translate3d(${alignX}, ${alignY}, 0)`,
                  padding: '7px',
                }}
              >
                <div
                  style={{
                    fontSize: fontSize + 'px',
                    padding: '5px',
                    background: 'rgba(38, 38, 38, 0.8)',
                    color: 'white',
                    borderRadius: '3px',
                    position: 'relative',
                  }}
                >
                  {children({
                    ...hovered,
                    primaryAxis,
                    secondaryAxis,
                  })}
                  <div
                    style={{
                      position: 'absolute',
                      width: '0',
                      height: '0',
                      ...triangleStyles,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>)}
      </Animate>
    )
  }
}

export default Connect(
  () => {
    const selectors = {
      primaryAxis: Selectors.primaryAxis(),
      secondaryAxis: Selectors.secondaryAxis(),
      gridX: Selectors.gridX(),
      gridY: Selectors.gridY(),
      offset: Selectors.offset(),
    }
    return state => ({
      primaryAxis: selectors.primaryAxis(state),
      secondaryAxis: selectors.secondaryAxis(state),
      gridX: selectors.gridX(state),
      gridY: selectors.gridY(state),
      hovered: state.hovered,
      cursor: state.cursor,
      offset: selectors.offset(state),
      quadTree: state.quadTree,
    })
  },
  {
    statics: {
      isHTML: true,
    },
  }
)(Tooltip)
