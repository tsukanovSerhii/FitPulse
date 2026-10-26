import React from 'react'

export type MovementPattern =
  | 'bench_press'
  | 'incline_bench_press'
  | 'squat'
  | 'deadlift'
  | 'pull_up'
  | 'overhead_press'
  | 'row'
  | 'push_up'
  | 'dips'
  | 'bicep_curl'
  | 'tricep_pushdown'
  | 'lunge'
  | 'plank'
  | 'hanging_leg_raise'
  | 'lateral_raise'
  | 'calf_raise'
  | 'cardio_run'
  | 'kettlebell_swing'

export interface AthleteRigProps {
  pattern: MovementPattern
  phaseIndex: number // 0: Setup, 1: Eccentric, 2: Bottom/Peak, 3: Concentric
  primaryMuscle?: string
  className?: string
}

/**
 * Biomechanical Vector Human Athlete Rig
 * Demonstrates proper exercise kinematics, joints, equipment, and target muscle contractions.
 */
export const AthleteRig: React.FC<AthleteRigProps> = ({
  pattern,
  phaseIndex,
  className = '',
}) => {
  // Common smooth transition style for rigged segments
  const tStyle = {
    transition: 'all 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
  }

  // Active muscle highlight styling: Electric athletic sky/cyan
  const activeColor = '#38bdf8'
  const bodyColor = '#94a3b8'
  const jointColor = '#cbd5e1'
  const equipmentColor = '#cbd5e1'
  const benchColor = '#1e293b'

  // Normalize phaseIndex to 0-3
  const phase = Math.min(Math.max(phaseIndex, 0), 3)

  switch (pattern) {
    // ----------------------------------------------------
    // 1. BENCH PRESS (Horizontal Push)
    // ----------------------------------------------------
    case 'bench_press':
    case 'incline_bench_press': {
      // Barbell Y coordinates across phases:
      // 0: Setup (extended arms) -> y=68
      // 1: Eccentric (descending) -> y=98
      // 2: Bottom (chest touch)   -> y=116
      // 3: Concentric (driving up)-> y=76
      const barY = [68, 98, 116, 76][phase]
      // Elbow Y drops as bar lowers (elbow tuck at ~75°)
      const elbowX = [125, 122, 118, 124][phase]
      const elbowY = [95, 120, 138, 102][phase]
      const isPeakContraction = phase === 2 || phase === 3

      return (
        <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
          {/* Gym Floor */}
          <line x1="20" y1="190" x2="340" y2="190" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

          {/* Bench Legs & Bench Top */}
          <rect x="75" y="138" width="165" height="12" rx="4" fill={benchColor} stroke="#334155" strokeWidth="1.5" />
          <rect x="90" y="150" width="10" height="40" rx="2" fill="#334155" />
          <rect x="220" y="150" width="10" height="40" rx="2" fill="#334155" />
          {/* Barbell Rack upright */}
          <rect x="76" y="70" width="8" height="68" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <path d="M 72 70 L 88 70 L 88 80 L 72 80 Z" fill="#475569" />

          {/* ATHLETE BODY (Lying on bench) */}
          {/* Head resting on bench */}
          <circle cx="102" cy="130" r="11" fill={jointColor} />

          {/* Torso / Chest with slight natural arch */}
          <path
            d="M 112 135 C 130 120, 160 120, 185 137"
            fill="none"
            stroke={bodyColor}
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* TARGET MUSCLE GLOW: Pectorals (Chest) */}
          <path
            d="M 124 125 C 138 116, 155 116, 168 126"
            fill="none"
            stroke={activeColor}
            strokeWidth={isPeakContraction ? '10' : '6'}
            strokeLinecap="round"
            style={{
              ...tStyle,
              filter: isPeakContraction ? 'drop-shadow(0 0 8px rgba(56,189,248,0.8))' : 'none',
              opacity: isPeakContraction ? 1 : 0.6,
            }}
          />

          {/* Hips on bench */}
          <circle cx="185" cy="137" r="9" fill={bodyColor} />

          {/* Leg: Thigh down to knee, shin down to floor, foot planted */}
          <polyline
            points="185,137 225,152 232,190"
            fill="none"
            stroke={bodyColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Foot */}
          <line x1="225" y1="190" x2="245" y2="190" stroke={jointColor} strokeWidth="6" strokeLinecap="round" />

          {/* Shoulder joint */}
          <circle cx="128" cy="128" r="7" fill={jointColor} />

          {/* Arm: Shoulder -> Elbow -> Hand */}
          <polyline
            points={`128,128 ${elbowX},${elbowY} 150,${barY}`}
            fill="none"
            stroke={jointColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={tStyle}
          />

          {/* Elbow joint indicator */}
          <circle cx={elbowX} cy={elbowY} r="5" fill={activeColor} style={tStyle} />

          {/* Hand on Bar */}
          <circle cx="150" cy={barY} r="6" fill={jointColor} style={tStyle} />

          {/* BARBELL (Horizontal with Olympic Plates) */}
          <g style={tStyle}>
            {/* Bar */}
            <line x1="60" y1={barY} x2="240" y2={barY} stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />
            {/* Inner collar */}
            <rect x="75" y={barY - 14} width="5" height="28" rx="2" fill="#64748b" />
            {/* 20kg Plate */}
            <rect x="80" y={barY - 26} width="8" height="52" rx="3" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
            {/* Outer plate */}
            <rect x="88" y={barY - 22} width="6" height="44" rx="2" fill="#0369a1" />
            {/* Right Plate */}
            <rect x="210" y={barY - 26} width="8" height="52" rx="3" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
            <rect x="218" y={barY - 22} width="6" height="44" rx="2" fill="#0369a1" />
          </g>

          {/* Biomechanical Angle Badge */}
          <g transform="translate(260, 45)">
            <rect x="0" y="0" width="86" height="34" rx="10" fill="#111622" stroke="#334155" strokeWidth="1" />
            <text x="43" y="14" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
              КУТ ЛІКТІВ
            </text>
            <text x="43" y="27" fill="#38bdf8" fontSize="11" fontWeight="900" textAnchor="middle">
              ~75° (Оптимально)
            </text>
          </g>
        </svg>
      )
    }

    // ----------------------------------------------------
    // 2. SQUAT (Knee & Hip Flexion/Extension)
    // ----------------------------------------------------
    case 'squat': {
      // Coordinates per phase:
      // 0: Setup (standing tall)
      // 1: Eccentric (descending)
      // 2: Bottom (parallel thighs)
      // 3: Concentric (driving up)
      const ankleX = 180
      const ankleY = 190

      const kneeX = [184, 198, 210, 192][phase]
      const kneeY = [142, 150, 158, 146][phase]

      const hipX = [178, 154, 142, 164][phase]
      const hipY = [94, 122, 152, 110][phase]

      const shoulderX = [180, 172, 172, 176][phase]
      const shoulderY = [48, 76, 104, 62][phase]

      const headX = [182, 178, 180, 180][phase]
      const headY = [28, 56, 84, 42][phase]

      const barX = shoulderX - 4
      const barY = shoulderY

      const isDeep = phase === 2

      return (
        <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
          {/* Gym Floor */}
          <line x1="30" y1="195" x2="330" y2="195" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          {/* Vertical center of balance dashed guide */}
          <line x1="180" y1="20" x2="180" y2="195" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

          {/* Foot on floor */}
          <line x1="165" y1="193" x2="198" y2="193" stroke={jointColor} strokeWidth="6" strokeLinecap="round" />

          {/* Lower leg (Ankle -> Knee) */}
          <line
            x1={ankleX}
            y1={ankleY}
            x2={kneeX}
            y2={kneeY}
            stroke={bodyColor}
            strokeWidth="11"
            strokeLinecap="round"
            style={tStyle}
          />

          {/* Thigh (Knee -> Hip) with Target Quad Glow */}
          <line
            x1={kneeX}
            y1={kneeY}
            x2={hipX}
            y2={hipY}
            stroke={isDeep ? activeColor : bodyColor}
            strokeWidth={isDeep ? '13' : '11'}
            strokeLinecap="round"
            style={{
              ...tStyle,
              filter: isDeep ? 'drop-shadow(0 0 8px rgba(56,189,248,0.7))' : 'none',
            }}
          />

          {/* Torso (Hip -> Shoulder) */}
          <line
            x1={hipX}
            y1={hipY}
            x2={shoulderX}
            y2={shoulderY}
            stroke={bodyColor}
            strokeWidth="14"
            strokeLinecap="round"
            style={tStyle}
          />

          {/* Glute highlight */}
          <circle
            cx={hipX}
            cy={hipY}
            r="8"
            fill={isDeep ? activeColor : jointColor}
            style={tStyle}
          />

          {/* Head */}
          <circle cx={headX} cy={headY} r="11" fill={jointColor} style={tStyle} />

          {/* Arm gripping barbell on traps */}
          <polyline
            points={`${shoulderX},${shoulderY} ${shoulderX + 12},${shoulderY + 18} ${barX},${barY}`}
            fill="none"
            stroke={jointColor}
            strokeWidth="6"
            strokeLinecap="round"
            style={tStyle}
          />

          {/* BARBELL (Side slice: Barbell plate) */}
          <g style={tStyle}>
            <circle cx={barX} cy={barY} r="22" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <circle cx={barX} cy={barY} r="12" fill="#0369a1" />
            <circle cx={barX} cy={barY} r="4" fill="#cbd5e1" />
          </g>

          {/* Depth / Biomechanics Badge */}
          <g transform="translate(240, 35)">
            <rect x="0" y="0" width="102" height="34" rx="10" fill="#111622" stroke="#334155" strokeWidth="1" />
            <text x="51" y="14" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
              ГЛИБИНА ПРИСІДУ
            </text>
            <text x="51" y="27" fill={isDeep ? '#38bdf8' : '#e2e8f0'} fontSize="11" fontWeight="900" textAnchor="middle">
              {isDeep ? 'Паралель досягнута' : 'Контроль спуску'}
            </text>
          </g>
        </svg>
      )
    }

    // ----------------------------------------------------
    // 3. DEADLIFT (Hip Hinge & Posterior Chain)
    // ----------------------------------------------------
    case 'deadlift':
    case 'kettlebell_swing': {
      // 0: Setup (shins to bar, hinge back)
      // 1: Lift off (bar passing knees)
      // 2: Lockout (tall upright standing)
      // 3: Return (lowering down thighs)
      const barY = [172, 138, 102, 145][phase]
      const hipX = [135, 145, 175, 142][phase]
      const hipY = [128, 114, 92, 118][phase]
      const shoulderX = [188, 186, 176, 185][phase]
      const shoulderY = [92, 70, 48, 76][phase]
      const headX = [204, 200, 178, 198][phase]
      const headY = [76, 52, 28, 58][phase]

      const isLockout = phase === 2

      return (
        <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
          <line x1="30" y1="195" x2="330" y2="195" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

          {/* Foot */}
          <line x1="165" y1="193" x2="198" y2="193" stroke={jointColor} strokeWidth="6" strokeLinecap="round" />

          {/* Shins */}
          <line x1="178" y1="190" x2="175" y2="148" stroke={bodyColor} strokeWidth="10" strokeLinecap="round" style={tStyle} />

          {/* Hamstring / Thigh */}
          <line
            x1="175"
            y1="148"
            x2={hipX}
            y2={hipY}
            stroke={isLockout ? activeColor : bodyColor}
            strokeWidth="11"
            strokeLinecap="round"
            style={tStyle}
          />

          {/* Neutral Spine (Hip -> Shoulder) */}
          <line
            x1={hipX}
            y1={hipY}
            x2={shoulderX}
            y2={shoulderY}
            stroke={isLockout ? activeColor : bodyColor}
            strokeWidth="13"
            strokeLinecap="round"
            style={{
              ...tStyle,
              filter: isLockout ? 'drop-shadow(0 0 8px rgba(56,189,248,0.7))' : 'none',
            }}
          />

          <circle cx={headX} cy={headY} r="11" fill={jointColor} style={tStyle} />

          {/* Straight Arms holding the Bar */}
          <line
            x1={shoulderX}
            y1={shoulderY}
            x2="188"
            y2={barY}
            stroke={jointColor}
            strokeWidth="7"
            strokeLinecap="round"
            style={tStyle}
          />

          {/* Barbell Plate */}
          <g style={tStyle}>
            <circle cx="188" cy={barY} r="22" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="188" cy={barY} r="11" fill="#0369a1" />
            <circle cx="188" cy={barY} r="4" fill="#cbd5e1" />
          </g>

          {/* Biomechanical Cue Badge */}
          <g transform="translate(235, 35)">
            <rect x="0" y="0" width="110" height="34" rx="10" fill="#111622" stroke="#334155" strokeWidth="1" />
            <text x="55" y="14" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
              БІОМЕХАНІКА СПИНИ
            </text>
            <text x="55" y="27" fill={isLockout ? '#38bdf8' : '#e2e8f0'} fontSize="11" fontWeight="900" textAnchor="middle">
              {isLockout ? 'Повний локаут тазу' : 'Нейтральний хребет'}
            </text>
          </g>
        </svg>
      )
    }

    // ----------------------------------------------------
    // 4. PULL-UPS (Vertical Pull)
    // ----------------------------------------------------
    case 'pull_up':
    case 'hanging_leg_raise': {
      // 0: Dead hang (body low)
      // 1: Pulling up
      // 2: Chin over bar (peak contraction)
      // 3: Controlled descent
      const bodyYOffset = [35, 15, -12, 20][phase]
      const isPeak = phase === 2

      return (
        <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
          {/* Pull-up Bar Rig */}
          <line x1="80" y1="28" x2="280" y2="28" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
          <line x1="90" y1="28" x2="90" y2="0" stroke="#334155" strokeWidth="4" />
          <line x1="270" y1="28" x2="270" y2="0" stroke="#334155" strokeWidth="4" />

          {/* Hands gripping bar */}
          <circle cx="150" cy="28" r="6" fill={jointColor} />
          <circle cx="210" cy="28" r="6" fill={jointColor} />

          {/* Moving athlete body */}
          <g style={{ transform: `translateY(${bodyYOffset}px)`, ...tStyle }}>
            {/* Head */}
            <circle cx="180" cy="52" r="11" fill={jointColor} />

            {/* Arms (Hands -> Elbows -> Shoulders) */}
            <polyline
              points={`150,${28 - bodyYOffset} 142,${isPeak ? 68 : 50} 162,64`}
              fill="none"
              stroke={jointColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points={`210,${28 - bodyYOffset} 218,${isPeak ? 68 : 50} 198,64`}
              fill="none"
              stroke={jointColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Torso & Lats */}
            <path
              d="M 164 64 L 196 64 L 188 120 L 172 120 Z"
              fill={isPeak ? activeColor : bodyColor}
              opacity={isPeak ? 0.9 : 0.7}
              style={{
                ...tStyle,
                filter: isPeak ? 'drop-shadow(0 0 10px rgba(56,189,248,0.8))' : 'none',
              }}
            />

            {/* Legs hanging with slight bend */}
            <polyline
              points="176,120 178,160 174,195"
              fill="none"
              stroke={bodyColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="184,120 186,160 182,195"
              fill="none"
              stroke={bodyColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Cue Badge */}
          <g transform="translate(240, 45)">
            <rect x="0" y="0" width="105" height="34" rx="10" fill="#111622" stroke="#334155" strokeWidth="1" />
            <text x="52" y="14" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
              ПІКОВЕ СКОРОЧЕННЯ
            </text>
            <text x="52" y="27" fill={isPeak ? '#38bdf8' : '#e2e8f0'} fontSize="11" fontWeight="900" textAnchor="middle">
              {isPeak ? 'Підборіддя над грифом' : 'Повний розтяг найширших'}
            </text>
          </g>
        </svg>
      )
    }

    // ----------------------------------------------------
    // 5. OVERHEAD PRESS (Standing Vertical Press)
    // ----------------------------------------------------
    case 'overhead_press': {
      // Barbell height:
      // 0: Clavicles -> y=82
      // 1: Eye level -> y=58
      // 2: Lockout overhead -> y=26
      // 3: Return -> y=68
      const barY = [82, 58, 26, 68][phase]
      const isLockout = phase === 2

      return (
        <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
          <line x1="30" y1="195" x2="330" y2="195" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

          {/* Legs & Torso */}
          <line x1="168" y1="195" x2="174" y2="135" stroke={bodyColor} strokeWidth="10" strokeLinecap="round" />
          <line x1="192" y1="195" x2="186" y2="135" stroke={bodyColor} strokeWidth="10" strokeLinecap="round" />
          <line x1="180" y1="135" x2="180" y2="82" stroke={bodyColor} strokeWidth="14" strokeLinecap="round" />

          {/* Shoulders with Active Deltoid Glow */}
          <circle
            cx="165"
            cy="84"
            r="8"
            fill={activeColor}
            style={{
              ...tStyle,
              filter: isLockout ? 'drop-shadow(0 0 8px rgba(56,189,248,0.8))' : 'none',
            }}
          />
          <circle
            cx="195"
            cy="84"
            r="8"
            fill={activeColor}
            style={{
              ...tStyle,
              filter: isLockout ? 'drop-shadow(0 0 8px rgba(56,189,248,0.8))' : 'none',
            }}
          />

          {/* Head */}
          <circle cx="180" cy="62" r="11" fill={jointColor} />

          {/* Arms pressing up */}
          <polyline
            points={`165,84 152,${(84 + barY) / 2 + 5} 158,${barY}`}
            fill="none"
            stroke={jointColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={tStyle}
          />
          <polyline
            points={`195,84 208,${(84 + barY) / 2 + 5} 202,${barY}`}
            fill="none"
            stroke={jointColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={tStyle}
          />

          {/* Barbell Overhead */}
          <g style={tStyle}>
            <line x1="110" y1={barY} x2="250" y2={barY} stroke={equipmentColor} strokeWidth="5" strokeLinecap="round" />
            <rect x="120" y={barY - 20} width="7" height="40" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
            <rect x="233" y={barY - 20} width="7" height="40" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
          </g>

          <g transform="translate(245, 35)">
            <rect x="0" y="0" width="98" height="34" rx="10" fill="#111622" stroke="#334155" strokeWidth="1" />
            <text x="49" y="14" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
              ТРАЄКТОРІЯ
            </text>
            <text x="49" y="27" fill={isLockout ? '#38bdf8' : '#e2e8f0'} fontSize="11" fontWeight="900" textAnchor="middle">
              {isLockout ? 'Вертикальний локаут' : 'Траєкторія над центром'}
            </text>
          </g>
        </svg>
      )
    }

    // ----------------------------------------------------
    // 6. BICEP CURLS (Elbow Flexion)
    // ----------------------------------------------------
    case 'bicep_curl': {
      // Forearm curl angles:
      // 0: Arms straight down -> hand at (200, 145)
      // 1: Half curl -> hand at (212, 115)
      // 2: Peak squeeze -> hand at (195, 86)
      // 3: Lowering -> hand at (208, 125)
      const handX = [198, 214, 192, 210][phase]
      const handY = [150, 118, 86, 130][phase]
      const isPeak = phase === 2

      return (
        <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
          <line x1="30" y1="195" x2="330" y2="195" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

          {/* Standing legs & torso */}
          <line x1="168" y1="195" x2="174" y2="135" stroke={bodyColor} strokeWidth="10" strokeLinecap="round" />
          <line x1="180" y1="135" x2="180" y2="80" stroke={bodyColor} strokeWidth="13" strokeLinecap="round" />
          <circle cx="180" cy="58" r="11" fill={jointColor} />

          {/* Upper Arm (Shoulder -> Elbow) - Pinned to side */}
          <line x1="182" y1="82" x2="184" y2="124" stroke={jointColor} strokeWidth="8" strokeLinecap="round" />

          {/* TARGET MUSCLE: Biceps bulge & glow */}
          <path
            d="M 183 90 C 192 100, 192 110, 184 120"
            fill="none"
            stroke={activeColor}
            strokeWidth={isPeak ? '9' : '5'}
            strokeLinecap="round"
            style={{
              ...tStyle,
              filter: isPeak ? 'drop-shadow(0 0 8px rgba(56,189,248,0.8))' : 'none',
            }}
          />

          {/* Forearm (Elbow -> Hand) */}
          <line
            x1="184"
            y1="124"
            x2={handX}
            y2={handY}
            stroke={jointColor}
            strokeWidth="7"
            strokeLinecap="round"
            style={tStyle}
          />

          {/* Dumbbell */}
          <g style={tStyle}>
            <circle cx={handX} cy={handY} r="7" fill={jointColor} />
            <rect x={handX - 5} y={handY - 14} width="10" height="7" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
            <rect x={handX - 5} y={handY + 7} width="10" height="7" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
          </g>

          <g transform="translate(240, 35)">
            <rect x="0" y="0" width="100" height="34" rx="10" fill="#111622" stroke="#334155" strokeWidth="1" />
            <text x="50" y="14" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
              ПОЗИЦІЯ ЛІКТІВ
            </text>
            <text x="50" y="27" fill={isPeak ? '#38bdf8' : '#e2e8f0'} fontSize="11" fontWeight="900" textAnchor="middle">
              {isPeak ? 'Максимальний пік' : 'Лікті зафіксовані'}
            </text>
          </g>
        </svg>
      )
    }

    // ----------------------------------------------------
    // 7. BENT-OVER ROW (Horizontal Pull)
    // ----------------------------------------------------
    case 'row': {
      // Barbell pulled into navel:
      // 0: Bar hanging below knees -> y=152
      // 1: Pulling up -> y=125
      // 2: Bar touching lower ribs -> y=98
      // 3: Lowering -> y=136
      const barY = [152, 125, 98, 136][phase]
      const isPeak = phase === 2

      return (
        <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
          <line x1="30" y1="195" x2="330" y2="195" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

          {/* Legs with knee bend */}
          <line x1="165" y1="193" x2="198" y2="193" stroke={jointColor} strokeWidth="6" strokeLinecap="round" />
          <polyline points="175,190 170,146 142,118" fill="none" stroke={bodyColor} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />

          {/* Torso angled at ~45 degrees with straight spine */}
          <line x1="142" y1="118" x2="196" y2="82" stroke={bodyColor} strokeWidth="14" strokeLinecap="round" />

          {/* LATS GLOW */}
          <line
            x1="152"
            y1="112"
            x2="185"
            y2="88"
            stroke={activeColor}
            strokeWidth={isPeak ? '9' : '5'}
            strokeLinecap="round"
            style={{
              ...tStyle,
              filter: isPeak ? 'drop-shadow(0 0 8px rgba(56,189,248,0.8))' : 'none',
            }}
          />

          {/* Head looking slightly forward */}
          <circle cx="210" cy="74" r="11" fill={jointColor} />

          {/* Arms rowing bar into abdomen */}
          <polyline
            points={`190,86 ${isPeak ? '170,82' : '182,120'} 180,${barY}`}
            fill="none"
            stroke={jointColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={tStyle}
          />

          {/* Barbell */}
          <g style={tStyle}>
            <circle cx="180" cy={barY} r="18" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="180" cy={barY} r="9" fill="#0369a1" />
            <circle cx="180" cy={barY} r="3" fill="#cbd5e1" />
          </g>

          <g transform="translate(240, 35)">
            <rect x="0" y="0" width="105" height="34" rx="10" fill="#111622" stroke="#334155" strokeWidth="1" />
            <text x="52" y="14" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
              НАХИЛ КОРПУСУ
            </text>
            <text x="52" y="27" fill={isPeak ? '#38bdf8' : '#e2e8f0'} fontSize="11" fontWeight="900" textAnchor="middle">
              {isPeak ? 'Зведення лопаток' : 'Кут нахилу 45°'}
            </text>
          </g>
        </svg>
      )
    }

    // ----------------------------------------------------
    // 8. PUSH-UP / DIPS (Bodyweight Push)
    // ----------------------------------------------------
    case 'push_up':
    case 'dips': {
      // 0: High plank / arms straight -> chest at y=130
      // 1: Lowering -> chest at y=152
      // 2: Bottom chest 2cm off floor -> chest at y=168
      // 3: Pressing up -> chest at y=140
      const bodyY = [130, 150, 168, 142][phase]
      const elbowX = [148, 140, 134, 144][phase]
      const isBottom = phase === 2

      return (
        <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
          <line x1="30" y1="185" x2="330" y2="185" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

          {/* Hands and feet touching floor */}
          <circle cx="160" cy="182" r="5" fill={jointColor} />
          <circle cx="280" cy="182" r="5" fill={jointColor} />

          {/* Moving body bridge in straight line */}
          <g style={tStyle}>
            {/* Rigid Body Line (Feet -> Hips -> Chest) */}
            <line
              x1="280"
              y1="180"
              x2="160"
              y2={bodyY}
              stroke={bodyColor}
              strokeWidth="11"
              strokeLinecap="round"
            />

            {/* Chest Active Glow */}
            <line
              x1="190"
              y1={(bodyY + 180) / 2 - 4}
              x2="160"
              y2={bodyY}
              stroke={activeColor}
              strokeWidth={isBottom ? '9' : '5'}
              strokeLinecap="round"
              style={{
                filter: isBottom ? 'drop-shadow(0 0 8px rgba(56,189,248,0.8))' : 'none',
              }}
            />

            {/* Head */}
            <circle cx="140" cy={bodyY - 6} r="10" fill={jointColor} />

            {/* Arms (Shoulder -> Elbow -> Hand) */}
            <polyline
              points={`160,${bodyY} ${elbowX},${(bodyY + 182) / 2} 160,182`}
              fill="none"
              stroke={jointColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          <g transform="translate(240, 35)">
            <rect x="0" y="0" width="105" height="34" rx="10" fill="#111622" stroke="#334155" strokeWidth="1" />
            <text x="52" y="14" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
              ЛІНІЯ ТОРСУ
            </text>
            <text x="52" y="27" fill={isBottom ? '#38bdf8' : '#e2e8f0'} fontSize="11" fontWeight="900" textAnchor="middle">
              {isBottom ? 'Повна амплітуда' : 'Прес напружений'}
            </text>
          </g>
        </svg>
      )
    }

    // ----------------------------------------------------
    // 9. PLANK (Core Stabilization)
    // ----------------------------------------------------
    case 'plank': {
      return (
        <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
          <line x1="30" y1="185" x2="330" y2="185" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          {/* Mat */}
          <rect x="70" y="183" width="220" height="5" rx="2" fill="#1e293b" />

          {/* Forearms on mat */}
          <line x1="120" y1="183" x2="145" y2="183" stroke={jointColor} strokeWidth="6" strokeLinecap="round" />
          <line x1="145" y1="183" x2="145" y2="145" stroke={jointColor} strokeWidth="7" strokeLinecap="round" />

          {/* Feet on toes */}
          <circle cx="265" cy="180" r="5" fill={jointColor} />

          {/* Straight Plank Line (Ankles -> Knees -> Hips -> Shoulders) */}
          <line x1="265" y1="180" x2="145" y2="145" stroke={bodyColor} strokeWidth="12" strokeLinecap="round" />

          {/* CORE GLOW (Abdominals) */}
          <line
            x1="210"
            y1="165"
            x2="160"
            y2="150"
            stroke={activeColor}
            strokeWidth="9"
            strokeLinecap="round"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.9))',
            }}
          />

          <circle cx="125" cy="142" r="10" fill={jointColor} />

          <g transform="translate(240, 35)">
            <rect x="0" y="0" width="105" height="34" rx="10" fill="#111622" stroke="#334155" strokeWidth="1" />
            <text x="52" y="14" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
              СТАБІЛІЗАЦІЯ
            </text>
            <text x="52" y="27" fill="#38bdf8" fontSize="11" fontWeight="900" textAnchor="middle">
              Кор в одній лінії
            </text>
          </g>
        </svg>
      )
    }

    // ----------------------------------------------------
    // DEFAULT / OTHER MOVEMENTS (Adaptive Clean Rig)
    // ----------------------------------------------------
    default: {
      // Clean standing athlete with dynamic force vectors
      const armAngle = [10, 45, 90, 30][phase]
      const isPeak = phase === 2

      return (
        <svg viewBox="0 0 360 210" className={`w-full h-full ${className}`}>
          <line x1="30" y1="195" x2="330" y2="195" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

          {/* Legs & Torso */}
          <line x1="168" y1="195" x2="174" y2="135" stroke={bodyColor} strokeWidth="10" strokeLinecap="round" />
          <line x1="192" y1="195" x2="186" y2="135" stroke={bodyColor} strokeWidth="10" strokeLinecap="round" />
          <line x1="180" y1="135" x2="180" y2="82" stroke={bodyColor} strokeWidth="14" strokeLinecap="round" />

          {/* Head */}
          <circle cx="180" cy="62" r="11" fill={jointColor} />

          {/* Target Active Muscle Zone */}
          <circle
            cx="180"
            cy="100"
            r="16"
            fill={activeColor}
            fillOpacity={isPeak ? 0.35 : 0.15}
            stroke={activeColor}
            strokeWidth="2"
            strokeDasharray="4 4"
            style={{
              ...tStyle,
              filter: isPeak ? 'drop-shadow(0 0 8px rgba(56,189,248,0.7))' : 'none',
            }}
          />

          {/* Articulated Arms */}
          <g
            style={{
              transformOrigin: '165px 84px',
              transform: `rotate(-${armAngle}deg)`,
              ...tStyle,
            }}
          >
            <line x1="165" y1="84" x2="148" y2="128" stroke={jointColor} strokeWidth="7" strokeLinecap="round" />
            <circle cx="148" cy="128" r="6" fill={jointColor} />
          </g>

          <g
            style={{
              transformOrigin: '195px 84px',
              transform: `rotate(${armAngle}deg)`,
              ...tStyle,
            }}
          >
            <line x1="195" y1="84" x2="212" y2="128" stroke={jointColor} strokeWidth="7" strokeLinecap="round" />
            <circle cx="212" cy="128" r="6" fill={jointColor} />
          </g>

          <g transform="translate(240, 35)">
            <rect x="0" y="0" width="100" height="34" rx="10" fill="#111622" stroke="#334155" strokeWidth="1" />
            <text x="50" y="14" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">
              БІОМЕХАНІКА
            </text>
            <text x="50" y="27" fill={isPeak ? '#38bdf8' : '#e2e8f0'} fontSize="11" fontWeight="900" textAnchor="middle">
              {isPeak ? 'Піковий фокус' : 'Підконтрольний рух'}
            </text>
          </g>
        </svg>
      )
    }
  }
}
