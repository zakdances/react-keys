/* eslint no-unused-vars:0 */
import React, { Component, PropTypes } from 'react';
import { build, getNext, getPrev } from './engines/carousel';
import { addListener, removeListener, globalStore } from './listener';
import { isBlocked, block } from './clock';
import { isActive } from './isActive';
import { execCb } from './funcHandler';
import { addKeyBinderToStore, _updateBinderState } from './redux/actions';
import { LEFT, RIGHT, DOWN, UP, ENTER } from './keys';

class Carousel extends Component {

  static get propTypes() {
    return {
      index: PropTypes.number,
      size: PropTypes.number,
      speed: PropTypes.number,
      debounce: PropTypes.number,
      elWidth: PropTypes.number,
      circular: PropTypes.bool,
      className: PropTypes.string,
      childrenClassName: PropTypes.string,
      onChange: PropTypes.func,
      onDownExit: PropTypes.func,
      onUpExit: PropTypes.func,
      onEnter: PropTypes.func,
    };
  }

  static get defaultProps() {
    return {
      index: 0,
      size: 3,
      elWidth: 100,
      circular: true,
      speed: 100,
      debounce: 82,
      className: 'carousel',
      childrenClassName: 'carousel-child',
      onDownExit: () => {
      },
      onUpExit: () => {
      },
    };
  }

  constructor(props) {
    super(props);
    this.listenerId = addListener(this.keysHandler, this);
    this.timeout = null;
    this.movingCountDown = () => {
      this.timeout = setTimeout(() => _updateBinderState(props.id, { moving: false }), props.speed);
    };
  }

  componentWillMount() {
    const { id, active, children } = this.props;
    addKeyBinderToStore(id, active);
    if (children.length !== 0) {
      this.initializeCarousel(children);
    }
  }

  componentWillUpdate(nextProps) {
    const { children } = nextProps;
    if (this.props.children.length === 0 && children.length !== 0) {
      this.initializeCarousel(children);
    }
  }

  initializeCarousel(children) {
    const { id, index, size, circular } = this.props;
    const indexs = build(children.map((el, i) => i), size + 4, this.getCursor(), circular);
    this.selectedId = children[index].props.id;
    this.sketch = children.map((el, i) => {
      if (indexs.indexOf(i) !== -1) {
        return '';
      }
      return null;
    });
    _updateBinderState(id, {
      selectedId: this.selectedId,
      cursor: index,
      moving: false,
    });
  }

  componentWillUnmount() {
    removeListener(this.listenerId);
  }

  performAction(cursor) {
    clearTimeout(this.timeout);
    this.selectedId = this.props.children[cursor].props.id;
    _updateBinderState(this.props.id, {
      selectedId: this.selectedId,
      cursor: cursor,
      moving: true,
    });
    this.movingCountDown();
    execCb(this.props.onChange, this.selectedId, this, this.props);
  }

  keysHandler(keyCode) {
    if (isActive(globalStore, this.props) && !isBlocked()) {
      block(this.props.debounce);
      const cursor = this.getCursor();
      switch (keyCode) {
        case LEFT:
          if (!this.props.circular && cursor === 0) return;
          this.performAction(getPrev(this.sketch, cursor));
          break;
        case RIGHT:
          if (!this.props.circular && cursor === this.props.children.length - 1) return;
          this.performAction(getNext(this.sketch, cursor));
          break;
        case DOWN:
          execCb(this.props.onDownExit, this.selectedId, this, this.props);
          break;
        case UP:
          execCb(this.props.onUpExit, this.selectedId, this, this.props);
          break;
        case ENTER:
          execCb(this.props.onEnter, this.selectedId, this, this.props);
          break;
        default:
          break;
      }
    }
  }

  getCursor() {
    return globalStore.getState()['@@keys'].getBinder(this.props.id).cursor;
  }

  render() {
    const { size, elWidth, speed, childrenClassName, circular, children, className } = this.props;
    const ids = children.map((el, index) => index);
    const indexs = build(ids, size + 4, this.getCursor(), circular);
    return <div className={className}>
      {children.map((el, index) => {
        if (indexs.indexOf(index) !== -1) {
          const x = (indexs.indexOf(index) - 2) * elWidth;
          return <div key={index} className={childrenClassName} style={{
            transform: `translateX(${x}px)`,
            transition: `transform ${speed}ms`,
            opacity: (x === -(2 * elWidth) || x === (size + 1) * elWidth) ? 0 : 1,
          }}>{el}</div>;
        }
        return null;
      })}
    </div>;
  }

}

export default Carousel;