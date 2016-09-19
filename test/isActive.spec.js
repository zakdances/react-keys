import { isActive } from '../src/isActive';
import { NAME } from '../src/constants';
import { createStore } from 'redux';

describe('isActive.js', () => {
  it('should return true when no state and props active = true', () => {
    const props = { id: '1', active: true };
    isActive(() => null, props).should.be.true;
  });
  it('should return false when no state and props active = false', () => {
    const props = { id: '1', active: false };
    isActive(() => null, props).should.be.false;
  });
  it('should return false when state and no sub state', () => {
    const props = { id: '1', active: true };
    const store = createStore((state = {}) => state);
    isActive(store, props).should.be.false;
  });
  it('should return false when state and one id sub state', () => {
    const props = { id: '1', active: true };
    const store = createStore((state = { [NAME]: {} }) => state);
    isActive(store, props).should.be.false;
  });
  it('should return false when state and active = false sub state', () => {
    const props = { id: '1', active: true };
    const store = createStore((state = { [NAME]: { 1: { active: false } } }) => state);
    isActive(store, props).should.be.false;
  });
  it('should return true when state and id.active = true sub state', () => {
    const props = { id: '1', active: true };
    const store = createStore((state = { [NAME]: { 1: { active: true } } }) => state);
    isActive(store, props).should.be.true;
  });
});
