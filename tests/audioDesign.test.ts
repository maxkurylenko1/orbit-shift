import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getAmbientProfile,
  getCountdownFrequency,
  getPickupFrequency,
  getSwitchToneProfile,
} from '../src/audio/audioDesign.ts';

test('switch cue stays short and rises in pitch', () => {
  const profile = getSwitchToneProfile();

  assert.ok(profile.startFrequency > 300);
  assert.ok(profile.endFrequency > profile.startFrequency);
  assert.ok(profile.durationSeconds <= 0.1);
});

test('pickup pitch rises with combo and clamps to the supported range', () => {
  assert.equal(getPickupFrequency(-10), getPickupFrequency(1));
  assert.ok(getPickupFrequency(2) > getPickupFrequency(1));
  assert.ok(getPickupFrequency(5) > getPickupFrequency(4));
  assert.equal(getPickupFrequency(99), getPickupFrequency(5));
});

test('countdown notes rise toward GO', () => {
  const three = getCountdownFrequency('3');
  const two = getCountdownFrequency('2');
  const one = getCountdownFrequency('1');
  const go = getCountdownFrequency('GO');

  assert.ok(three !== null && two !== null && two > three);
  assert.ok(one !== null && two !== null && one > two);
  assert.ok(go !== null && one !== null && go > one);
  assert.equal(getCountdownFrequency(''), null);
});

test('ambient profile gains pulse, brightness, and motion with pressure', () => {
  const calm = getAmbientProfile(0, 0);
  const intense = getAmbientProfile(1, 0);
  const surge = getAmbientProfile(1, 1);

  assert.ok(intense.filterFrequency > calm.filterFrequency);
  assert.ok(intense.pulseRate > calm.pulseRate);
  assert.ok(intense.pulseDepth > calm.pulseDepth);
  assert.ok(intense.gain > calm.gain);
  assert.ok(surge.pulseRate > intense.pulseRate);
  assert.ok(surge.filterFrequency > intense.filterFrequency);
});
