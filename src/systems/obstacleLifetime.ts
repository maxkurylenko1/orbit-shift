const TAU = Math.PI * 2;
const POST_PASS_CLEARANCE_RADIANS = 0.22;

const normalizeAngle = (angle: number): number => ((angle % TAU) + TAU) % TAU;

export const createObstacleTravelBudget = (
  playerAngle: number,
  obstacleAngle: number,
): number => normalizeAngle(obstacleAngle - playerAngle) + POST_PASS_CLEARANCE_RADIANS;

export const advanceObstacleTravelBudget = (
  remainingTravelRadians: number,
  playerAngularSpeed: number,
  deltaSeconds: number,
): number =>
  remainingTravelRadians -
  Math.max(0, playerAngularSpeed) * Math.max(0, deltaSeconds);
