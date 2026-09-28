import type { OrbitLane } from '../entities/Player';

const TAU = Math.PI * 2;
const DUAL_LANE_BLOCKADE_ANGLE = 0.34;
const SAME_LANE_STACK_ANGLE = 0.22;
const COLLECTIBLE_CLEARANCE_ANGLE = 0.4;
const COLLECTIBLE_ANGLE_OFFSETS = [0, 0.46, -0.28, 0.82] as const;

export interface AngularLaneObject {
  lane: OrbitLane;
  angle: number;
}

export interface CollectiblePlacement {
  lane: OrbitLane;
  angle: number;
}

const normalizeAngle = (angle: number): number =>
  ((angle % TAU) + TAU) % TAU;

const angularDistance = (a: number, b: number): number => {
  let delta = Math.abs(normalizeAngle(a) - normalizeAngle(b));

  if (delta > Math.PI) {
    delta = TAU - delta;
  }

  return delta;
};

const oppositeLane = (lane: OrbitLane): OrbitLane =>
  lane === 'inner' ? 'outer' : 'inner';

const hasNearbyObject = (
  objects: readonly AngularLaneObject[],
  lane: OrbitLane,
  angle: number,
  threshold: number,
): boolean =>
  objects.some(
    (object) =>
      object.lane === lane &&
      angularDistance(object.angle, angle) < threshold,
  );

export const resolveSafeObstacleLane = (
  proposedLane: OrbitLane,
  angle: number,
  obstacles: readonly AngularLaneObject[],
  protectedCollectibles: readonly AngularLaneObject[] = [],
): OrbitLane | null => {
  const candidates: readonly OrbitLane[] = [
    proposedLane,
    oppositeLane(proposedLane),
  ];

  for (const lane of candidates) {
    if (
      hasNearbyObject(
        protectedCollectibles,
        lane,
        angle,
        COLLECTIBLE_CLEARANCE_ANGLE,
      )
    ) {
      continue;
    }

    if (
      hasNearbyObject(
        obstacles,
        lane,
        angle,
        SAME_LANE_STACK_ANGLE,
      )
    ) {
      continue;
    }

    if (
      hasNearbyObject(
        obstacles,
        oppositeLane(lane),
        angle,
        DUAL_LANE_BLOCKADE_ANGLE,
      )
    ) {
      continue;
    }

    return lane;
  }

  return null;
};

export const findSafeCollectiblePlacement = (
  preferredLane: OrbitLane,
  baseAngle: number,
  obstacles: readonly AngularLaneObject[],
): CollectiblePlacement | null => {
  for (const angleOffset of COLLECTIBLE_ANGLE_OFFSETS) {
    const angle = normalizeAngle(baseAngle + angleOffset);

    for (const lane of [preferredLane, oppositeLane(preferredLane)] as const) {
      if (
        !hasNearbyObject(
          obstacles,
          lane,
          angle,
          COLLECTIBLE_CLEARANCE_ANGLE,
        )
      ) {
        return { lane, angle };
      }
    }
  }

  return null;
};
