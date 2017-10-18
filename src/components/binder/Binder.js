import React, { Component } from 'react';
import { defaultProps, propTypes } from './props';
import { keysHandler } from './handler';
import { BINDER_TYPE } from '../../constants';
import { addListener, removeListener } from '../../listener';
import { addBinder, _removeBinder } from '../../redux/actions';
import compatibility from '../compatibility';
import { refreshState } from './refresh';

class Binder extends Component {
  constructor(props) {
    super(props);
    this.innerProps = compatibility(props);
  }

  componentWillMount() {
    this.listenerId = addListener(keysHandler, this);
    addBinder(this.innerProps, BINDER_TYPE);
  }

  componentWillReceiveProps(nextProps) {
    this.innerProps = compatibility(nextProps);
  }

  componentDidMount() {
    refreshState.apply(this);
  }

  componentDidUpdate() {
    refreshState.apply(this);
  }

  componentWillUnmount() {
    this.listenerId = removeListener(this.listenerId);
    _removeBinder(this.innerProps.id);
  }

  render() {
    const { id, children } = this.innerProps;
    return <div id={id}>{children}</div>;
  }
}

Binder.propTypes = propTypes;
Binder.defaultProps = defaultProps;

export default Binder;
