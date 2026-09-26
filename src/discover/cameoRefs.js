/**
 * Canonical MagicDraw targets for BE Discover (Part 1).
 * `qname` uses :: segments from Model root (adjust after opening UAV student project).
 */
export const CAMEO_REFS = {
  opContext: {
    kind: 'diagram',
    label: 'Operational Context',
    qname: 'Model::1 – Operational Analysis::B – Operational Breakdown::Operational Context::Operational Context',
  },
  ucScenarios: {
    kind: 'diagram',
    label: 'Use Cases and Scenarios',
    qname: 'Model::1 – Operational Analysis::C – Use Cases and Scenarios::Use Cases and Scenarios',
  },
  prepPhasePkg: {
    kind: 'package',
    label: '1. Preparation phase',
    qname: 'Model::1 – Operational Analysis::C – Use Cases and Scenarios::1. Preparation phase',
  },
  ucParameterMission: {
    kind: 'package',
    label: 'Parameter Mission',
    qname: 'Model::1 – Operational Analysis::C – Use Cases and Scenarios::Use Cases and Scenarios::Parameter Mission',
  },
  actorMissionOperator: {
    kind: 'actor',
    label: 'Mission Operator',
    qname: 'Model::1 – Operational Analysis::A – Use Cases and Scenario::1-A-Actors::Mission Operator',
  },
  actorGroundStation: {
    kind: 'actor',
    label: 'Ground Station',
    qname: 'Model::1 – Operational Analysis::A – Use Cases and Scenario::1-A-Actors::Ground Station',
  },
  soiPastureSentinel: {
    kind: 'package',
    label: 'SOI - Pasture Sentinel',
    qname: 'Model::3 – Physical Analysis::A – Physical Architecture::SOI - Pasture Sentinel',
  },
  funcDeployPkg: {
    kind: 'package',
    label: 'Deployment',
    qname: 'Model::2 – Functional Analysis::A – Functional Architecture::Deployment',
  },
  funcDataDeploy: {
    kind: 'package',
    label: 'Functional Data / Deployment',
    qname: 'Model::2 – Functional Analysis::B - Functional Data::Deployement',
  },
  signalFlightPlan: {
    kind: 'signal',
    label: 'FlightPlan',
    qname: 'Model::2 – Functional Analysis::B - Functional Data::Deployement::FlightPlan',
  },
  signalFlightPlanCheckFailed: {
    kind: 'signal',
    label: 'FlightPlan Check Failed',
    qname: 'Model::2 – Functional Analysis::B - Functional Data::Deployement::FlightPlan Check Failed',
  },
  signalReadyForMission: {
    kind: 'signal',
    label: 'Ready for mission',
    qname: 'Model::2 – Functional Analysis::B - Functional Data::Deployement::Ready for mission',
  },
  activityParameterMission: {
    kind: 'activity',
    label: 'Parameter Mission',
    qname: 'Model::2 – Functional Analysis::A – Functional Architecture::Deployment::Parameter Mission::Parameter Mission',
  },
  activityLoadFlightPlan: {
    kind: 'activity',
    label: 'Load Flight Plan',
    qname: 'Model::2 – Functional Analysis::A – Functional Architecture::Deployment::Parameter Mission::Load Flight Plan',
  },
  activityCheckPerimeter: {
    kind: 'activity',
    label: 'Check Flight Plan Perimeter',
    qname: 'Model::2 – Functional Analysis::A – Functional Architecture::Deployment::Parameter Mission::Check Flight Plan Perimeter',
  },
  stmSoi: {
    kind: 'diagram',
    label: 'SOI State Machine',
    qname: 'Model::3 – Physical Analysis::A – Physical Architecture::SOI - Pasture Sentinel::SOI-Pasture Sentinel',
  },
  traceabilityAlloc: {
    kind: 'diagram',
    label: 'Function Allocation',
    qname: 'Model::2 – Functional Analysis::C – Traceability::Function Allocation',
  },
  uavData: {
    kind: 'diagram',
    label: 'UAV Data',
    qname: 'Model::3 – Physical Analysis::A – Physical Architecture::SOI - Pasture Sentinel::UAV Data',
  },
  uavEnergy: {
    kind: 'diagram',
    label: 'UAV Energy',
    qname: 'Model::3 – Physical Analysis::A – Physical Architecture::SOI - Pasture Sentinel::UAV Energy',
  },
}
