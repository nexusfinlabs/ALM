'use client'
import { useState } from 'react'

type LinkedTest = { id: string; name: string; status: string }
type LinkedReq = { id: string; type: 'upstream' | 'downstream'; rel: string }
type Req = {
  id: string
  name: string
  description: string
  asil?: string
  verification: string
  docRef: string
  tests: LinkedTest[]
  linked: LinkedReq[]
}
type Process = { code: string; name: string; reqs: Req[] }

const PROCESSES: Record<string, Process> = {
  'SYS.1': { code: 'SYS.1', name: 'Requirements Elicitation', reqs: [
    { id: 'STK-001', name: 'OEM AEB Level 2 demand', description: 'Customer demand for AEB Level 2 across all Tier-1 suppliers',
      verification: 'Stakeholder review', docRef: 'STK-MoM-2024-09-12',
      tests: [], linked: [{ id: 'ADAS-SYS-002', type: 'downstream', rel: 'flows to' }] },
    { id: 'STK-002', name: 'EuroNCAP 2025 five-star rating', description: 'EuroNCAP 2025 protocol for VRU AEB requires 5-star rating',
      verification: 'Regulatory mapping', docRef: 'EuroNCAP-2025-AEB-Protocol-v1.4',
      tests: [{ id: 'QT-SYS-001', name: 'EuroNCAP AEB protocol 2025', status: 'PASSED' }],
      linked: [{ id: 'ADAS-SYS-002', type: 'downstream', rel: 'flows to' }, { id: 'ADAS-SYS-003', type: 'downstream', rel: 'flows to' }] },
    { id: 'STK-003', name: 'EU Directive 2019/2144 mandate', description: 'EU Reg 2019/2144 mandates AEB on new vehicle types from July 2024',
      verification: 'Legal compliance check', docRef: 'EU-2019-2144-Art-7',
      tests: [{ id: 'QT-SYS-002', name: 'UN ECE R152 type approval', status: 'IN PROGRESS' }],
      linked: [{ id: 'STK-001', type: 'upstream', rel: 'enables' }] },
    { id: 'STK-004', name: 'BOM target USD 850', description: 'Target unit cost 850 USD at scale 250k units/year',
      verification: 'Cost analysis', docRef: 'BOM-Target-FY26',
      tests: [], linked: [{ id: 'ARCH-001', type: 'downstream', rel: 'constrains' }] },
  ]},

  'SYS.2': { code: 'SYS.2', name: 'System Requirements Analysis', reqs: [
    { id: 'ADAS-SYS-001', name: 'Lane detection latency < 100ms', description: 'End-to-end lane detection from frame capture to lane line output shall be under 100ms at 30fps',
      asil: 'B', verification: 'HIL bench timing measurement', docRef: 'SRS-V2.1 §4.1.2',
      tests: [{ id: 'ADAS-TC-001', name: 'Lane detection 100ms', status: 'PASSED' }],
      linked: [{ id: 'ADAS-SW-001', type: 'downstream', rel: 'derives' }, { id: 'ADAS-HW-001', type: 'downstream', rel: 'derives' }] },
    { id: 'ADAS-SYS-002', name: 'Emergency brake activation < 150ms', description: 'From obstacle classification to brake actuator command, total latency shall be < 150ms',
      asil: 'D', verification: 'HIL closed-loop with brake actuator emulator', docRef: 'SRS-V2.1 §4.1.3',
      tests: [{ id: 'ADAS-TC-002', name: 'Emergency brake response', status: 'PASSED' }, { id: 'IT-SYS-001', name: 'Vehicle closed-loop AEB', status: 'PASSED' }],
      linked: [{ id: 'ADAS-SW-002', type: 'downstream', rel: 'derives' }, { id: 'ADAS-HW-005', type: 'downstream', rel: 'derives' }, { id: 'STK-001', type: 'upstream', rel: 'satisfies' }] },
    { id: 'ADAS-SYS-003', name: 'Object classification > 99.5%', description: 'CNN classifier precision on EuroNCAP VRU dataset shall exceed 99.5% precision',
      asil: 'C', verification: 'Dataset validation + statistical analysis', docRef: 'SRS-V2.1 §4.1.4',
      tests: [{ id: 'ADAS-TC-003', name: 'CNN classifier EuroNCAP', status: 'FAILED' }],
      linked: [{ id: 'ADAS-SW-003', type: 'downstream', rel: 'derives' }, { id: 'STK-002', type: 'upstream', rel: 'satisfies' }] },
    { id: 'ADAS-SYS-004', name: 'Sensor fusion rate > 50Hz', description: 'Multi-sensor fusion task execution rate shall be at least 50Hz with jitter < 2ms',
      asil: 'B', verification: 'RT trace capture + statistical analysis', docRef: 'SRS-V2.1 §4.2.1',
      tests: [{ id: 'ADAS-TC-004', name: 'Sensor fusion 50Hz', status: 'PASSED' }],
      linked: [{ id: 'ADAS-SW-004', type: 'downstream', rel: 'derives' }, { id: 'ARCH-002', type: 'downstream', rel: 'realized by' }] },
  ]},

  'SYS.3': { code: 'SYS.3', name: 'System Architectural Design', reqs: [
    { id: 'ARCH-001', name: 'Centralized ECU on Tegra Orin', description: 'Single central ADAS ECU based on NVIDIA Tegra Orin SoC with 275 TOPS, ASIL-D safety island',
      asil: 'D', verification: 'Architecture review board sign-off', docRef: 'ARCH-V2.3 §3.1',
      tests: [{ id: 'IT-SYS-002', name: 'Track test VRU dummies', status: 'PASSED' }, { id: 'QT-SW-002', name: '72h burn-in stress', status: 'PASSED' }],
      linked: [{ id: 'STK-004', type: 'upstream', rel: 'cost-bound by' }, { id: 'ADAS-HW-004', type: 'downstream', rel: 'realized by' }] },
    { id: 'ARCH-002', name: 'Sensor fusion at central node', description: 'Camera, LIDAR and radar streams converge at central ECU. No edge fusion in sensor units.',
      asil: 'C', verification: 'Architecture review + simulation', docRef: 'ARCH-V2.3 §3.2',
      tests: [{ id: 'IT-SW-001', name: 'Camera→fusion pipeline', status: 'PASSED' }, { id: 'IT-SW-002', name: 'LIDAR→fusion pipeline', status: 'PASSED' }],
      linked: [{ id: 'ADAS-SYS-004', type: 'upstream', rel: 'realizes' }, { id: 'SWA-003', type: 'downstream', rel: 'implemented by' }] },
    { id: 'ARCH-003', name: 'Redundant power 50ms failover', description: 'Dual independent 12V rails with automatic failover to secondary within 50ms',
      asil: 'D', verification: 'Hardware-level fault injection test', docRef: 'ARCH-V2.3 §4.4',
      tests: [{ id: 'ADAS-TC-HW-005', name: 'Power supply failover 50ms', status: 'PASSED' }],
      linked: [{ id: 'ADAS-HW-007', type: 'downstream', rel: 'implemented by' }] },
    { id: 'ARCH-004', name: 'CAN-FD safety backbone', description: 'Internal communication on CAN-FD 5Mbps with E2E protection per AUTOSAR profile P05',
      asil: 'D', verification: 'Bus monitoring + integrity test', docRef: 'ARCH-V2.3 §5.1',
      tests: [{ id: 'IT-SW-003', name: 'Fault injection watchdog', status: 'PASSED' }],
      linked: [{ id: 'SWA-004', type: 'downstream', rel: 'enforced by' }, { id: 'ADAS-HW-005', type: 'downstream', rel: 'transports' }] },
  ]},

  'SWE.1': { code: 'SWE.1', name: 'Software Requirements Analysis', reqs: [
    { id: 'ADAS-SW-001', name: 'DiagManager 20ms cycle', description: 'DiagManager invokes checkInjector() every 20ms when RPM>1000 in Normal/Degraded modes',
      asil: 'B', verification: 'Unit test + RT scheduler trace', docRef: 'SwRS-V1.4 §2.1',
      tests: [{ id: 'UT-001', name: 'GoogleTest lane_detector (32 cases)', status: 'PASSED' }, { id: 'ADAS-TC-001', name: 'Lane detection 100ms', status: 'PASSED' }],
      linked: [{ id: 'ADAS-SYS-001', type: 'upstream', rel: 'derived from' }, { id: 'UNIT-001', type: 'downstream', rel: 'implemented in' }] },
    { id: 'ADAS-SW-002', name: 'Brake PWM within 150ms', description: 'Brake controller sends PWM command within 150ms of obstacle detection trigger',
      asil: 'D', verification: 'HIL with oscilloscope timing', docRef: 'SwRS-V1.4 §2.2',
      tests: [{ id: 'UT-002', name: 'GoogleTest brake_controller (24)', status: 'PASSED' }, { id: 'ADAS-TC-002', name: 'Emergency brake response', status: 'PASSED' }],
      linked: [{ id: 'ADAS-SYS-002', type: 'upstream', rel: 'derived from' }, { id: 'UNIT-002', type: 'downstream', rel: 'implemented in' }] },
    { id: 'ADAS-SW-003', name: 'CNN 99.5% on EuroNCAP', description: 'CNN classifier achieves >99.5% precision on EuroNCAP VRU dataset (pedestrian/cyclist/child)',
      asil: 'C', verification: 'Statistical validation against reference dataset', docRef: 'SwRS-V1.4 §2.3',
      tests: [{ id: 'UT-003', name: 'pytest cnn_classifier (45 cases)', status: '2 FAILED' }, { id: 'ADAS-TC-003', name: 'CNN classifier EuroNCAP', status: 'FAILED' }],
      linked: [{ id: 'ADAS-SYS-003', type: 'upstream', rel: 'derived from' }, { id: 'UNIT-003', type: 'downstream', rel: 'implemented in' }] },
    { id: 'ADAS-SW-004', name: 'Kalman fusion 50Hz', description: 'Kalman filter task executes at 50Hz integrating LIDAR/camera/radar streams',
      asil: 'B', verification: 'RT trace + jitter measurement', docRef: 'SwRS-V1.4 §2.4',
      tests: [{ id: 'UT-004', name: 'GoogleTest kalman_fusion (18)', status: 'PASSED' }, { id: 'ADAS-TC-004', name: 'Sensor fusion 50Hz', status: 'PASSED' }],
      linked: [{ id: 'ADAS-SYS-004', type: 'upstream', rel: 'derived from' }, { id: 'UNIT-004', type: 'downstream', rel: 'implemented in' }] },
  ]},

  'SWE.2': { code: 'SWE.2', name: 'Software Architectural Design', reqs: [
    { id: 'SWA-001', name: 'AUTOSAR Adaptive on Linux RT', description: 'Software runs on AUTOSAR Adaptive Platform 23-11 over Linux RT 6.1 PREEMPT_RT',
      verification: 'Architecture review + tool qualification', docRef: 'SWA-V1.2 §3.1',
      tests: [{ id: 'QT-SW-001', name: 'Full SW stack on HIL bench', status: 'PASSED' }],
      linked: [{ id: 'ARCH-001', type: 'upstream', rel: 'realized in' }] },
    { id: 'SWA-002', name: 'TensorRT inference engine', description: 'CNN inference offloaded to TensorRT 8.6 with FP16 quantization on Tegra Orin GPU',
      verification: 'Performance benchmark + accuracy validation', docRef: 'SWA-V1.2 §3.2',
      tests: [{ id: 'UT-003', name: 'pytest cnn_classifier (45 cases)', status: '2 FAILED' }],
      linked: [{ id: 'ADAS-SW-003', type: 'upstream', rel: 'enables' }] },
    { id: 'SWA-003', name: 'ROS 2 Humble fusion node', description: 'Sensor fusion implemented as ROS 2 Humble node with DDS-Cyclone middleware',
      verification: 'DDS QoS conformance test', docRef: 'SWA-V1.2 §3.3',
      tests: [{ id: 'IT-SW-001', name: 'Camera→fusion pipeline', status: 'PASSED' }, { id: 'IT-SW-002', name: 'LIDAR→fusion pipeline', status: 'PASSED' }],
      linked: [{ id: 'ARCH-002', type: 'upstream', rel: 'implements' }] },
    { id: 'SWA-004', name: 'Watchdog with E2E protection', description: 'AUTOSAR E2E P05 protection on critical messages + supervised watchdog (WdgM)',
      verification: 'Fault injection campaign', docRef: 'SWA-V1.2 §4.2',
      tests: [{ id: 'IT-SW-003', name: 'Fault injection watchdog', status: 'PASSED' }, { id: 'ADAS-TC-005', name: 'Watchdog fail-safe 50ms', status: 'PASSED' }],
      linked: [{ id: 'ARCH-004', type: 'upstream', rel: 'enforces' }] },
  ]},

  'SWE.3': { code: 'SWE.3', name: 'SW Detailed Design / Units', reqs: [
    { id: 'UNIT-001', name: 'lane_detector.cpp', description: 'C++17 module implementing OpenCV-based lane detection with hough transform refinement',
      verification: 'Code review + static analysis', docRef: 'SDD-V1.0 §5.1 / lane_detector.cpp',
      tests: [{ id: 'UT-001', name: 'GoogleTest lane_detector (32 cases)', status: 'PASSED' }],
      linked: [{ id: 'ADAS-SW-001', type: 'upstream', rel: 'realizes' }] },
    { id: 'UNIT-002', name: 'brake_controller.cpp', description: 'AUTOSAR SWC implementing brake torque request via CAN-FD with E2E protection',
      verification: 'MISRA-C++ static analysis + unit test', docRef: 'SDD-V1.0 §5.2',
      tests: [{ id: 'UT-002', name: 'GoogleTest brake_controller (24)', status: 'PASSED' }],
      linked: [{ id: 'ADAS-SW-002', type: 'upstream', rel: 'realizes' }] },
    { id: 'UNIT-003', name: 'cnn_classifier.py', description: 'PyTorch model wrapper with TensorRT export pipeline (ResNet50 backbone)',
      verification: 'pytest + accuracy metrics on validation set', docRef: 'SDD-V1.0 §5.3',
      tests: [{ id: 'UT-003', name: 'pytest cnn_classifier (45 cases)', status: '2 FAILED' }],
      linked: [{ id: 'ADAS-SW-003', type: 'upstream', rel: 'realizes' }] },
    { id: 'UNIT-004', name: 'kalman_fusion.cpp', description: 'Extended Kalman Filter for multi-sensor state estimation with Mahalanobis gating',
      verification: 'Unit test + numerical stability analysis', docRef: 'SDD-V1.0 §5.4',
      tests: [{ id: 'UT-004', name: 'GoogleTest kalman_fusion (18)', status: 'PASSED' }],
      linked: [{ id: 'ADAS-SW-004', type: 'upstream', rel: 'realizes' }] },
  ]},

  'SWE.4': { code: 'SWE.4', name: 'Software Unit Verification', reqs: [
    { id: 'UT-001', name: 'lane_detector unit tests', description: '32 GoogleTest cases covering edge case scenarios + boundary conditions',
      verification: 'Coverage > 95% statement, > 90% MC/DC', docRef: 'UV-V1.0 §6.1',
      tests: [{ id: 'UT-001-RUN', name: 'CI Run 2025-Q4-W42', status: 'PASSED' }],
      linked: [{ id: 'UNIT-001', type: 'upstream', rel: 'verifies' }] },
    { id: 'UT-002', name: 'brake_controller unit tests', description: '24 cases including timing boundary and E2E error injection',
      verification: 'MC/DC coverage on safety paths', docRef: 'UV-V1.0 §6.2',
      tests: [{ id: 'UT-002-RUN', name: 'CI Run 2025-Q4-W42', status: 'PASSED' }],
      linked: [{ id: 'UNIT-002', type: 'upstream', rel: 'verifies' }] },
    { id: 'UT-003', name: 'cnn_classifier validation', description: '45 pytest cases on stratified VRU subset — 2 failing on extreme low light',
      verification: 'Precision/recall on validation split', docRef: 'UV-V1.0 §6.3',
      tests: [{ id: 'UT-003-RUN', name: 'CI Run 2025-Q4-W42', status: '2 FAILED' }],
      linked: [{ id: 'UNIT-003', type: 'upstream', rel: 'verifies' }, { id: 'BUG-001', type: 'downstream', rel: 'reveals' }] },
    { id: 'UT-004', name: 'kalman_fusion unit tests', description: '18 GoogleTest cases including degenerate covariance handling',
      verification: 'Numerical stability + coverage', docRef: 'UV-V1.0 §6.4',
      tests: [{ id: 'UT-004-RUN', name: 'CI Run 2025-Q4-W42', status: 'PASSED' }],
      linked: [{ id: 'UNIT-004', type: 'upstream', rel: 'verifies' }] },
  ]},

  'SWE.5': { code: 'SWE.5', name: 'SW Integration & Test', reqs: [
    { id: 'IT-SW-001', name: 'Camera → fusion pipeline', description: 'End-to-end pipeline test from camera frame ingestion to fusion node output',
      verification: 'HIL with synthetic camera stream', docRef: 'IT-V1.0 §7.1',
      tests: [{ id: 'IT-SW-001-RUN', name: 'HIL Run 2025-Q4-W43', status: 'PASSED' }],
      linked: [{ id: 'SWA-003', type: 'upstream', rel: 'integration of' }, { id: 'UNIT-004', type: 'upstream', rel: 'tests' }] },
    { id: 'IT-SW-002', name: 'LIDAR → fusion pipeline', description: 'LIDAR point cloud ingestion through fusion to object list generation',
      verification: 'HIL with replay LIDAR data', docRef: 'IT-V1.0 §7.2',
      tests: [{ id: 'IT-SW-002-RUN', name: 'HIL Run 2025-Q4-W43', status: 'PASSED' }],
      linked: [{ id: 'SWA-003', type: 'upstream', rel: 'integration of' }] },
    { id: 'IT-SW-003', name: 'Fault injection watchdog', description: 'Inject CPU stall, message corruption, deadline miss — verify recovery',
      verification: 'Fault injection framework', docRef: 'IT-V1.0 §7.3',
      tests: [{ id: 'IT-SW-003-RUN', name: 'HIL Run 2025-Q4-W43', status: 'PASSED' }],
      linked: [{ id: 'SWA-004', type: 'upstream', rel: 'verifies' }, { id: 'ARCH-004', type: 'upstream', rel: 'verifies' }] },
  ]},

  'SWE.6': { code: 'SWE.6', name: 'Software Qualification Test', reqs: [
    { id: 'QT-SW-001', name: 'Full SW stack on HIL', description: 'Complete software baseline running on HIL bench with vehicle dynamics simulator',
      verification: 'HIL closed-loop scenario suite', docRef: 'QT-V1.0 §8.1',
      tests: [{ id: 'QT-SW-001-RUN', name: 'HIL Campaign 2025-Q4', status: 'PASSED' }],
      linked: [{ id: 'SWA-001', type: 'upstream', rel: 'qualifies' }] },
    { id: 'QT-SW-002', name: '72h burn-in stress', description: '72-hour continuous operation with full sensor load and CPU stress',
      verification: 'Long-duration HIL with monitoring', docRef: 'QT-V1.0 §8.2',
      tests: [{ id: 'QT-SW-002-RUN', name: 'Burn-in W44', status: 'PASSED' }],
      linked: [{ id: 'ARCH-001', type: 'upstream', rel: 'qualifies' }] },
    { id: 'QT-SW-003', name: 'Thermal soak -40 to +105°C', description: 'Climatic chamber test of full ECU running ADAS workload across temperature range',
      verification: 'Climatic chamber + functional checks', docRef: 'QT-V1.0 §8.3',
      tests: [{ id: 'QT-SW-003-RUN', name: 'Thermal W45', status: 'IN PROGRESS' }],
      linked: [{ id: 'ADAS-HW-004', type: 'upstream', rel: 'qualifies' }] },
  ]},

  'SYS.4': { code: 'SYS.4', name: 'System Integration & Test', reqs: [
    { id: 'IT-SYS-001', name: 'Vehicle closed-loop AEB', description: 'Real vehicle on test track executing AEB scenarios at 30/50/80 km/h',
      verification: 'Vehicle test on dedicated proving ground', docRef: 'SI-V1.0 §9.1',
      tests: [{ id: 'IT-SYS-001-RUN', name: 'Track Test 2025-11-15', status: 'PASSED' }],
      linked: [{ id: 'ADAS-SYS-002', type: 'upstream', rel: 'integration of' }] },
    { id: 'IT-SYS-002', name: 'Track test VRU dummies', description: 'EuroNCAP VRU scenarios with crash-test dummies — pedestrian crossing/bicycle',
      verification: 'Track test with instrumented dummies', docRef: 'SI-V1.0 §9.2',
      tests: [{ id: 'IT-SYS-002-RUN', name: 'VRU Test 2025-11-22', status: 'PASSED' }],
      linked: [{ id: 'ADAS-SYS-003', type: 'upstream', rel: 'integration of' }] },
    { id: 'IT-SYS-003', name: 'Adverse weather rain/fog', description: 'Track tests under simulated rain (50mm/h) and fog conditions',
      verification: 'Weather chamber + outdoor test', docRef: 'SI-V1.0 §9.3',
      tests: [{ id: 'IT-SYS-003-RUN', name: 'Weather Test', status: 'IN PROGRESS' }],
      linked: [{ id: 'BUG-002', type: 'downstream', rel: 'investigates' }] },
  ]},

  'SYS.5': { code: 'SYS.5', name: 'System Qualification Test', reqs: [
    { id: 'QT-SYS-001', name: 'EuroNCAP AEB protocol 2025', description: 'Official EuroNCAP test protocol for AEB Pedestrian/Cyclist/Car-to-Car',
      verification: 'Independent test lab certification', docRef: 'QT-V1.0 §10.1',
      tests: [{ id: 'EuroNCAP-Cert-2025', name: 'EuroNCAP Certificate', status: 'PASSED' }],
      linked: [{ id: 'STK-002', type: 'upstream', rel: 'satisfies' }] },
    { id: 'QT-SYS-002', name: 'UN ECE R152 type approval', description: 'UN Regulation 152 type approval for Advanced Emergency Braking System',
      verification: 'TÜV homologation campaign', docRef: 'QT-V1.0 §10.2',
      tests: [{ id: 'TUV-R152-2025', name: 'TÜV R152 Campaign', status: 'IN PROGRESS' }],
      linked: [{ id: 'STK-003', type: 'upstream', rel: 'satisfies' }] },
    { id: 'QT-SYS-003', name: 'OEM customer acceptance', description: 'Final acceptance test by OEM customer on production-intent vehicle',
      verification: 'Customer test campaign', docRef: 'QT-V1.0 §10.3',
      tests: [{ id: 'OEM-UAT-2026', name: 'OEM UAT Campaign', status: 'NOT STARTED' }],
      linked: [{ id: 'STK-001', type: 'upstream', rel: 'satisfies' }] },
  ]},
}

const POS: Record<string, { x: number; y: number; side: 'left' | 'bottom' | 'right' }> = {
  'SYS.1': { x: 60, y: 30, side: 'left' }, 'SYS.2': { x: 200, y: 110, side: 'left' },
  'SYS.3': { x: 340, y: 190, side: 'left' }, 'SWE.1': { x: 480, y: 270, side: 'left' },
  'SWE.2': { x: 620, y: 350, side: 'left' }, 'SWE.3': { x: 760, y: 430, side: 'bottom' },
  'SWE.4': { x: 920, y: 430, side: 'bottom' }, 'SWE.5': { x: 1060, y: 350, side: 'right' },
  'SWE.6': { x: 1200, y: 270, side: 'right' }, 'SYS.4': { x: 1340, y: 190, side: 'right' },
  'SYS.5': { x: 1480, y: 110, side: 'right' },
}

const TRACES: [string, string][] = [
  ['SYS.1', 'SYS.2'], ['SYS.2', 'SYS.3'], ['SYS.3', 'SWE.1'], ['SWE.1', 'SWE.2'],
  ['SWE.2', 'SWE.3'], ['SWE.3', 'SWE.4'], ['SWE.4', 'SWE.5'], ['SWE.5', 'SWE.6'],
  ['SWE.6', 'SYS.4'], ['SYS.4', 'SYS.5'],
  ['SYS.2', 'SYS.5'], ['SYS.3', 'SYS.4'], ['SWE.1', 'SWE.6'], ['SWE.2', 'SWE.5'],
]

const sideColor = (s: string) => s === 'left' ? '#00d4ff' : s === 'right' ? '#4ade80' : '#f59e0b'
const statusColor = (s: string) => {
  if (s === 'PASSED') return '#4ade80'
  if (s.includes('FAILED')) return '#f87171'
  if (s.includes('PROGRESS')) return '#f59e0b'
  return '#8892a4'
}

export default function AspiceVModel() {
  const [active, setActive] = useState<string>('SYS.3')
  const [view, setView] = useState<'vmodel' | 'flow'>('vmodel')
  const [expanded, setExpanded] = useState<string | null>(null)
  const proc = PROCESSES[active]

  return (
    <div className="border border-[rgba(255,255,255,0.06)] rounded-xl bg-[#0d0d10] p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-mono text-xs text-[#00d4ff] uppercase tracking-widest mb-1">ASPICE Process Model</div>
          <h3 className="font-display font-700 text-white">Automotive SPICE V-Model · click any process</h3>
        </div>
        <div className="flex border border-[rgba(0,212,255,0.2)] rounded-lg overflow-hidden">
          <button onClick={() => setView('vmodel')}
            className={`px-4 py-1.5 font-mono text-xs uppercase ${view === 'vmodel' ? 'bg-[#00d4ff] text-black' : 'text-[#8892a4] hover:text-white'}`}>V-Model</button>
          <button onClick={() => setView('flow')}
            className={`px-4 py-1.5 font-mono text-xs uppercase ${view === 'flow' ? 'bg-[#00d4ff] text-black' : 'text-[#8892a4] hover:text-white'}`}>Flow</button>
        </div>
      </div>

      {view === 'vmodel' && (
        <svg viewBox="0 0 1600 540" className="w-full">
          <defs>
            <marker id="vmarr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#00d4ff" opacity="0.6" />
            </marker>
          </defs>
          {TRACES.map(([from, to], i) => {
            const a = POS[from], b = POS[to]
            return <line key={i} x1={a.x + 60} y1={a.y + 60} x2={b.x + 60} y2={b.y + 60}
              stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="4 4"
              opacity={active === from || active === to ? '0.9' : '0.2'} markerEnd="url(#vmarr)" />
          })}
          {Object.entries(POS).map(([code, p]) => {
            const isActive = code === active
            const c = sideColor(p.side)
            return (
              <g key={code} className="cursor-pointer" onClick={() => { setActive(code); setExpanded(null) }}>
                <rect x={p.x} y={p.y} width={120} height={60} rx="8"
                  fill={isActive ? c : '#141418'} stroke={c} strokeWidth={isActive ? 2 : 1.5} opacity={isActive ? 1 : 0.85} />
                <text x={p.x + 60} y={p.y + 25} textAnchor="middle" fill={isActive ? '#070709' : c} fontSize="14" fontFamily="monospace" fontWeight="700">{code}</text>
                <text x={p.x + 60} y={p.y + 45} textAnchor="middle" fill={isActive ? '#070709' : '#8892a4'} fontSize="9" fontFamily="sans-serif">{PROCESSES[code].reqs.length} reqs</text>
              </g>
            )
          })}
          <text x="80" y="510" fill="#00d4ff" fontSize="10" fontFamily="monospace" letterSpacing="2">DECOMPOSITION →</text>
          <text x="1380" y="510" fill="#4ade80" fontSize="10" fontFamily="monospace" letterSpacing="2">← INTEGRATION</text>
        </svg>
      )}

      {view === 'flow' && (
        <div className="overflow-x-auto py-4">
          <div className="flex gap-3 min-w-max">
            {Object.values(PROCESSES).map((p, i, arr) => (
              <div key={p.code} className="flex items-center">
                <div onClick={() => { setActive(p.code); setExpanded(null) }}
                  className={`w-44 border rounded-lg p-3 cursor-pointer transition-all ${
                    active === p.code ? 'border-[#00d4ff] bg-[rgba(0,212,255,0.06)]' : 'border-[rgba(255,255,255,0.08)] bg-[#141418] hover:border-[rgba(0,212,255,0.3)]'
                  }`}>
                  <div className="font-mono text-xs font-700" style={{ color: sideColor(POS[p.code].side) }}>{p.code}</div>
                  <div className="font-body text-[11px] text-white mt-1 leading-snug">{p.name}</div>
                  <div className="font-mono text-[10px] text-[#8892a4] mt-2">{p.reqs.length} requirements</div>
                </div>
                {i < arr.length - 1 && <div className="text-[#00d4ff] mx-1 text-xl">→</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 border border-[rgba(0,212,255,0.2)] rounded-lg bg-[#141418] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-sm font-700" style={{ color: sideColor(POS[active].side) }}>{proc.code}</div>
            <div className="font-display font-700 text-white">{proc.name}</div>
          </div>
          <span className="font-mono text-[10px] text-[#8892a4] border border-[rgba(136,146,164,0.3)] px-2 py-0.5 rounded">
            {proc.reqs.length} items in Codebeamer
          </span>
        </div>

        <div className="space-y-3">
          {proc.reqs.map(r => {
            const isOpen = expanded === r.id
            return (
              <div key={r.id} className="border border-[rgba(255,255,255,0.06)] rounded-lg bg-[#0d0d10] hover:border-[rgba(0,212,255,0.3)] transition-colors">
                <div className="p-4 cursor-pointer" onClick={() => setExpanded(isOpen ? null : r.id)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-700 text-[#00d4ff]">{r.id}</span>
                      <span className="font-body text-sm text-white">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.asil && <span className="font-mono text-[10px] text-[#f59e0b] border border-[rgba(245,158,11,0.3)] px-1.5 py-0.5 rounded">ASIL {r.asil}</span>}
                      <span className="font-mono text-[10px] text-[#a78bfa] border border-[rgba(167,139,250,0.3)] px-1.5 py-0.5 rounded">{r.tests.length} tests</span>
                      <span className="font-mono text-[10px] text-[#06b6d4] border border-[rgba(6,182,212,0.3)] px-1.5 py-0.5 rounded">{r.linked.length} links</span>
                      <span className="text-[#8892a4] text-xs">{isOpen ? '▴' : '▾'}</span>
                    </div>
                  </div>
                  <div className="font-body text-xs text-[#8892a4] leading-relaxed">{r.description}</div>
                </div>

                {isOpen && (
                  <div className="border-t border-[rgba(255,255,255,0.06)] p-4 space-y-3 bg-[#0a0a0c]">
                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="font-mono text-[10px] text-[#8892a4] uppercase tracking-widest mb-1">Verification Method</div>
                        <div className="font-body text-white">{r.verification}</div>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-[#8892a4] uppercase tracking-widest mb-1">Document Reference</div>
                        <div className="font-mono text-[#00d4ff]">{r.docRef}</div>
                      </div>
                    </div>

                    {r.tests.length > 0 && (
                      <div>
                        <div className="font-mono text-[10px] text-[#a78bfa] uppercase tracking-widest mb-2">Linked Test Cases ({r.tests.length})</div>
                        <div className="space-y-1.5">
                          {r.tests.map(t => (
                            <div key={t.id} className="flex items-center justify-between border border-[rgba(167,139,250,0.15)] bg-[rgba(167,139,250,0.04)] rounded p-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-[#a78bfa]">{t.id}</span>
                                <span className="font-body text-xs text-white">{t.name}</span>
                              </div>
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border" style={{ color: statusColor(t.status), borderColor: `${statusColor(t.status)}40` }}>{t.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {r.linked.length > 0 && (
                      <div>
                        <div className="font-mono text-[10px] text-[#06b6d4] uppercase tracking-widest mb-2">Linked Requirements ({r.linked.length})</div>
                        <div className="space-y-1.5">
                          {r.linked.map(l => (
                            <div key={l.id} className="flex items-center justify-between border border-[rgba(6,182,212,0.15)] bg-[rgba(6,182,212,0.04)] rounded p-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-[#06b6d4]">{l.id}</span>
                                <span className="font-body text-[11px] text-[#8892a4]">{l.rel}</span>
                              </div>
                              <span className="font-mono text-[10px] text-[#06b6d4]">{l.type === 'upstream' ? '← upstream' : '→ downstream'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
