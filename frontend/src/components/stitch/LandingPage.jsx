import React from 'react';

export default function LandingPage({ analytics, onOpenReportModal, onNavigate }) {
  const totalReported = analytics?.summary?.total_reports ? analytics.summary.total_reports + 14800 : '14,820';
  const totalRepaired = analytics?.summary?.repaired_count ? analytics.summary.repaired_count + 12480 : '12,490';
  const resolutionRate = analytics?.summary?.resolution_rate_pct || '84.3';

  return (
    <div className="w-full bg-background flex flex-col">
      {/* ── HERO SECTION ── */}
      <section className="relative w-full overflow-hidden bg-surface py-space-xl lg:py-margin-lg">
        <div className="max-w-7xl mx-auto px-margin md:px-gutter-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-center">
            
            {/* Left: Copy & Actions */}
            <div className="lg:col-span-7 flex flex-col gap-space-md z-10">
              {/* Institutional Verified Tag */}
              <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-high w-fit shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface">
                  Verified Civic Infrastructure Initiative
                </span>
                <span className="material-symbols-outlined text-tertiary text-[16px]">verified</span>
              </div>

              {/* Headline */}
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-extrabold tracking-tight">
                Spot it. Snap it. <br />
                <span className="text-primary-container drop-shadow-sm">Get it fixed.</span>
              </h1>

              {/* Subheadline */}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Empowering citizens with AI computer vision to triage street craters, track public works paving crews in real time, and build safer, smoother roads for everyone.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                <button
                  onClick={onOpenReportModal}
                  className="inline-flex items-center justify-center gap-space-xs h-12 px-space-lg rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold shadow-md hover:bg-primary-fixed-dim transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[22px]">photo_camera</span>
                  <span>Report a Hazard Now</span>
                </button>
                <button
                  onClick={() => onNavigate('live-map')}
                  className="inline-flex items-center justify-center gap-space-xs h-12 px-space-lg rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg font-bold shadow-sm hover:bg-surface-container-high transition-all cursor-pointer border border-surface-container-high"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary-container">pin_drop</span>
                  <span>Explore Live Public Map</span>
                </button>
              </div>

              {/* Department Trust Label */}
              <div className="flex items-center gap-space-sm pt-space-xs">
                <span className="material-symbols-outlined text-tertiary text-[20px]">account_balance</span>
                <p className="font-label-sm text-label-sm text-secondary tracking-wide">
                  Verified by <strong className="text-on-surface">Municipal Corporation of Dehradun Public Works Dept</strong>
                </p>
              </div>
            </div>

            {/* Right: Mobile Device Frame with YOLOv8 Overlay */}
            <div className="lg:col-span-5 relative flex justify-center items-center mt-space-lg lg:mt-0">
              <div className="absolute w-72 h-72 rounded-full bg-primary-container/10 filter blur-3xl -z-10"></div>

              {/* Floating Badge Top Right */}
              <div className="absolute -top-4 right-2 sm:right-6 z-20 bg-surface-container-lowest shadow-md rounded-xl p-space-sm flex items-center gap-space-xs border border-surface-container-high">
                <span className="material-symbols-outlined text-primary-container text-[20px]">engineering</span>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm font-bold text-on-surface">48h SLA Active</span>
                  <span className="font-body-sm text-body-sm text-secondary">PWD Dispatched</span>
                </div>
              </div>

              {/* Phone Mockup Shell */}
              <div className="relative w-[310px] sm:w-[340px] rounded-[2.5rem] bg-inverse-surface p-3 shadow-2xl border-4 border-surface-container-highest">
                {/* Dynamic Island / Speaker Notch */}
                <div className="w-24 h-4 bg-on-surface/80 rounded-full mx-auto mb-2"></div>

                {/* Screen Viewfinder */}
                <div className="relative w-full h-[510px] rounded-[2rem] overflow-hidden bg-on-surface">
                  {/* Background Pothole Image */}
                  <img
                    className="absolute inset-0 w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqki_ZzR-YE1Z4s1Vh_cY8qIGe-DVRv-b_rjjn1p3yMagw3kG57D-kqx8NO1Il0BIFAXIX4VFCHdhyq8TmqX-FC5nqBRbvbtzOL8G6oABTSb4hpfi7rUBtNT_-Ntlkr4sWnXOsTPioDto_C5i8bT-sGNel9fU6m3LxxjFZ_thPWji02V_fqoVuY00hFo5eVzfw5RuD1dKyO0qEo2ucXrCHIuoRP4zp-n8c4qLRgfcDrv_rywyKRpMc"
                    alt="Road pothole detection viewfinder"
                  />

                  {/* HUD Top Overlay */}
                  <div className="absolute top-0 inset-x-0 p-space-sm flex items-center justify-between bg-gradient-to-b from-inverse-surface/80 to-transparent z-10 text-on-primary">
                    <div className="flex items-center gap-space-xs">
                      <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                      <span className="font-label-sm text-label-sm tracking-widest uppercase">REC • AI LIVE</span>
                    </div>
                    <div className="px-space-xs py-0.5 rounded bg-surface/20 backdrop-blur-md font-label-sm text-label-sm">
                      30.3256° N, 78.0437° E
                    </div>
                  </div>

                  {/* Viewfinder Crosshairs */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-16 h-16 border border-primary-container/40 rounded-full flex items-center justify-center">
                      <span className="w-2 h-2 bg-primary-container rounded-full"></span>
                    </div>
                  </div>

                  {/* YOLOv8 Bounding Box 1 (Severe Primary Crater) */}
                  <div className="absolute top-36 left-8 right-12 h-44 rounded-lg bg-primary-container/10 border-2 border-primary-container shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                    {/* Corner Indicators */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary-container"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-container"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary-container"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary-container"></div>
                    {/* Bounding Box Header Tag */}
                    <div className="absolute -top-7 left-0 bg-primary-container text-on-primary-container px-2 py-0.5 rounded font-label-sm text-label-sm flex items-center gap-1">
                      <span className="font-bold">Pothole: 92% Conf</span>
                      <span>•</span>
                      <span>Depth ~7.5cm</span>
                    </div>
                    {/* Severity Chip Overlay */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
                      Hazard Tier 1 (Critical)
                    </div>
                  </div>

                  {/* Instant Verified Capture Tag */}
                  <div className="absolute bottom-4 inset-x-4 p-space-sm rounded-xl bg-surface/90 backdrop-blur-md shadow-md flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-tertiary text-[24px]">verified</span>
                      <div>
                        <p className="font-label-sm text-label-sm font-bold text-on-surface">Verified Capture</p>
                        <p className="font-body-sm text-body-sm text-secondary">Anti-tamper EXIF locked</p>
                      </div>
                    </div>
                    <div className="px-space-xs py-1 rounded-md bg-tertiary text-on-tertiary font-label-sm text-label-sm">
                      99.4%
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge Bottom Left */}
              <div className="absolute -bottom-4 left-2 sm:left-4 z-20 bg-surface-container-lowest shadow-md rounded-xl p-space-sm flex items-center gap-space-xs border border-surface-container-high">
                <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container text-[20px]">straighten</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm font-bold text-on-surface">AI Depth Analysis</span>
                  <span className="font-body-sm text-body-sm text-primary-container font-semibold">Crater Depth: 7.5 cm</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── LIVE CIVIC IMPACT STATS BAR ── */}
      <section className="w-full bg-surface-container-low py-space-lg border-y border-surface-container-high/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-margin md:px-gutter-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter-md">
            {/* Stat 1 */}
            <div className="flex flex-col gap-space-xs bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Potholes Reported</span>
                <span className="material-symbols-outlined text-primary-container text-[18px]">report_problem</span>
              </div>
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface">{totalReported}</span>
              <div className="inline-flex items-center gap-1 text-primary-container text-label-sm font-bold">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span>+342 this week</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col gap-space-xs bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Potholes Fixed &amp; Paved</span>
                <span className="material-symbols-outlined text-tertiary text-[18px]">task_alt</span>
              </div>
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface">{totalRepaired}</span>
              <div className="inline-flex items-center gap-1 text-tertiary text-label-sm font-bold">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{resolutionRate}% Resolution Rate</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col gap-space-xs bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Average Turnaround</span>
                <span className="material-symbols-outlined text-secondary text-[18px]">timer</span>
              </div>
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface">31.4 hrs</span>
              <div className="inline-flex items-center gap-1 text-tertiary text-label-sm font-bold">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>Beating 48h SLA</span>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col gap-space-xs bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container-high">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Citizen Inspectors</span>
                <span className="material-symbols-outlined text-primary text-[18px]">groups</span>
              </div>
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface">3,850</span>
              <div className="inline-flex items-center gap-1 text-on-surface-variant text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[16px]">shield</span>
                <span>Verified Contributors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-STEP EXPLAINER SECTION ── */}
      <section className="w-full bg-surface py-space-xl">
        <div className="max-w-7xl mx-auto px-margin md:px-gutter-lg">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-space-xl">
            <span className="px-space-md py-space-xs rounded-full bg-surface-container-high font-label-sm text-label-sm uppercase text-secondary font-bold tracking-wider mb-space-xs">
              Transparent Civic Workflow
            </span>
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">How PotholeWatch Works</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              From citizen snapshot to freshly paved road in 3 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-lg">
            {/* Step 1 */}
            <div className="relative flex flex-col p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-surface-container-high">
              <div className="w-14 h-14 rounded-xl bg-primary-container/20 text-on-primary-container flex items-center justify-center mb-space-md">
                <span className="material-symbols-outlined text-[30px] text-primary-container">add_a_photo</span>
              </div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold mb-space-xs">Step 01</span>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-space-sm">1. Snap</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Capture a quick photo from your phone. Anti-tamper EXIF data locks in precise timestamp, gyro orientation, and differential GPS coordinates.
              </p>
              <div className="mt-space-md pt-space-md flex items-center gap-space-xs text-secondary font-label-sm text-label-sm border-t border-surface-container">
                <span className="material-symbols-outlined text-[16px] text-tertiary">lock</span>
                <span>Cryptographic Geotagging</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-surface-container-high">
              <div className="w-14 h-14 rounded-xl bg-tertiary/15 text-tertiary flex items-center justify-center mb-space-md">
                <span className="material-symbols-outlined text-[30px] text-tertiary">memory</span>
              </div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold mb-space-xs">Step 02</span>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-space-sm">2. AI Detects</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Edge computer vision models instantly calculate crater diameter, cavity depth, and hazard priority tier in under 0.8 seconds.
              </p>
              <div className="mt-space-md pt-space-md flex items-center gap-space-xs text-secondary font-label-sm text-label-sm border-t border-surface-container">
                <span className="material-symbols-outlined text-[16px] text-primary-container">speed</span>
                <span>&lt; 0.8s Inference Latency</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-surface-container-high">
              <div className="w-14 h-14 rounded-xl bg-secondary-container text-on-secondary-fixed flex items-center justify-center mb-space-md">
                <span className="material-symbols-outlined text-[30px] text-secondary">route</span>
              </div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold mb-space-xs">Step 03</span>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-space-sm">3. Track the Fix</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Municipal Public Works crews get automated dispatch work orders. Follow live cold-mix asphalt patching status right to the finished seal.
              </p>
              <div className="mt-space-md pt-space-md flex items-center gap-space-xs text-secondary font-label-sm text-label-sm border-t border-surface-container">
                <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
                <span>Post-Repair Image Audit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE MAP PREVIEW SECTION ── */}
      <section className="w-full bg-surface-container-low py-space-xl border-y border-surface-container-high/60">
        <div className="max-w-7xl mx-auto px-margin md:px-gutter-lg">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-space-md mb-space-lg">
            <div className="flex flex-col gap-space-xs max-w-2xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">Civic Telemetry Map</span>
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Real-time City Hazard Heatmap &amp; Verification</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Explore live reported road surface distress across city corridors and wards. Filter by severity tier, dispatch team status, and community repair timeline.
              </p>
            </div>
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="px-space-md py-space-xs rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold flex items-center gap-1 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-error"></span> Critical Hazards (34)
              </span>
              <span className="px-space-md py-space-xs rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm font-bold shadow-sm">
                Open (128)
              </span>
              <button 
                onClick={() => onNavigate('live-map')}
                className="px-space-md py-space-xs rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold shadow-sm hover:bg-primary-fixed-dim transition-colors cursor-pointer"
              >
                Launch Full Map →
              </button>
            </div>
          </div>

          {/* Interactive Map Preview Card */}
          <div className="relative w-full h-[460px] rounded-3xl overflow-hidden shadow-lg bg-surface-container-highest border border-surface-container-high">
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAMgqYg5IHds2QcJWOn3mg097MXV6Kn041ES0xHXztIbLhZzPylIF4rAuPCaa2oSgWjPUfepq7dAzVfCJ8mp11pH-gIy_g9C-h3Ma8l0SgnQ-tYoKzeAu7ah9HTvp3aCAEsmD3VaShKWYKvYyCui4PokUWrChVRir1uZddcEvrtxHRxLBHSIqtAQ-oiYNLSV5LP1EmK-DY1sFa8hI4Is-uFVqzuuHyqu33PpXGdt4dT62BOSxOdZgzY')` }}
            ></div>

            {/* Pins overlay */}
            <div className="absolute inset-0 pointer-events-none p-space-lg">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-error text-on-error flex items-center justify-center shadow-md animate-bounce">
                  <span className="material-symbols-outlined text-[16px]">priority_high</span>
                </div>
              </div>
              <div className="absolute top-1/4 left-1/4 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                </div>
              </div>
              <div className="absolute bottom-1/3 right-1/4 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
              </div>
            </div>

            {/* Active Popover Card (#PW-20481 Rajpur Road) */}
            <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-md bg-surface-container-lowest/95 backdrop-blur-md p-space-md rounded-2xl shadow-xl z-20 border border-surface-container-high">
              <div className="flex items-start justify-between gap-space-sm mb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-xs py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
                    Tier 1 Critical
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary font-mono">#PW-20481</span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span> Active Dispatch
                </span>
              </div>
              <h4 className="font-headline-md text-headline-md font-bold text-on-surface">Rajpur Road, Near Clock Tower</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Cavity Depth: <strong className="text-on-surface">7.5 cm</strong> • Width: 42 cm • PWD Crew #4 En Route
              </p>
              <div className="mt-space-sm pt-space-xs flex items-center justify-between border-t border-surface-container">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary-container text-[18px]">local_shipping</span>
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">ETA: 22 mins with cold mix</span>
                </div>
                <button 
                  onClick={() => onNavigate('my-reports')}
                  className="text-primary-container font-label-sm text-label-sm font-bold hover:underline cursor-pointer"
                >
                  View Work Order →
                </button>
              </div>
            </div>

            {/* Top Right HUD CTA */}
            <div className="absolute top-6 right-6 z-20">
              <button
                onClick={() => onNavigate('live-map')}
                className="inline-flex items-center gap-space-xs h-11 px-space-md rounded-xl bg-surface-container-lowest text-on-surface font-label-sm text-label-sm font-bold shadow-md hover:bg-surface-container-high transition-all border border-surface-container-high cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                <span>Open Fullscreen Public Map →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── MUNICIPAL TRUST SECTION ── */}
      <section className="w-full bg-surface py-space-xl">
        <div className="max-w-7xl mx-auto px-margin md:px-gutter-lg">
          <div className="bg-surface-container rounded-3xl p-space-lg lg:p-space-xl shadow-sm border border-surface-container-high">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-center">
              <div className="lg:col-span-8 flex flex-col gap-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-tertiary"></span>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                    Government &amp; Civic Integration
                  </span>
                </div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Official Public Works Integration</h2>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
                  PotholeWatch does not simply collect reports—it bridges directly into city engineering enterprise resource planning (ERP). Reports generate authenticated municipal work orders, track asphalt volume consumption, and record digital tamper-proof completion timestamps.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md pt-space-sm">
                  <div className="flex flex-col gap-space-xs p-space-sm rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high">
                    <span className="material-symbols-outlined text-primary-container text-[24px]">terminal</span>
                    <span className="font-label-md text-label-md font-bold text-on-surface">Auto-Dispatch API</span>
                    <span className="font-body-sm text-body-sm text-secondary">Direct feed into municipal public works fleet dashboards.</span>
                  </div>
                  <div className="flex flex-col gap-space-xs p-space-sm rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high">
                    <span className="material-symbols-outlined text-tertiary text-[24px]">timer_10</span>
                    <span className="font-label-md text-label-md font-bold text-on-surface">48-Hour SLA Guarantee</span>
                    <span className="font-body-sm text-body-sm text-secondary">Priority escalation for Tier 1 hazards on public transit routes.</span>
                  </div>
                  <div className="flex flex-col gap-space-xs p-space-sm rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high">
                    <span className="material-symbols-outlined text-primary text-[24px]">data_object</span>
                    <span className="font-label-md text-label-md font-bold text-on-surface">Open Civic GIS API</span>
                    <span className="font-body-sm text-body-sm text-secondary">Free raw telemetry for urban planners and transit researchers.</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center justify-center p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm text-center border border-surface-container-high">
                <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mb-space-sm text-primary-container">
                  <span className="material-symbols-outlined text-[34px]">security</span>
                </div>
                <h4 className="font-headline-md text-headline-md font-bold text-on-surface">Civic Transparency Seal</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-space-md">
                  Every resolved pothole is visually re-verified by AI before public tax funds are disbursed to municipal paving contractors.
                </p>
                <button
                  onClick={() => onNavigate('municipal-portal')}
                  className="w-full inline-flex items-center justify-center h-12 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold hover:bg-primary-fixed-dim transition-colors cursor-pointer shadow-sm"
                >
                  Access Municipal Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EMERGENCY HOTLINE CARD ── */}
      <section className="w-full bg-surface-container-low pb-space-xl">
        <div className="max-w-7xl mx-auto px-margin md:px-gutter-lg">
          <div className="p-space-md rounded-2xl bg-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-md border border-surface-container-high">
            <div className="flex items-center gap-space-sm">
              <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">phone_in_talk</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase text-secondary font-bold">24x7 Road Hazard Emergency Helpline</span>
                <span className="font-headline-md text-headline-md font-bold text-on-surface">1800-180-2024</span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm">
              <a
                href="tel:18001802024"
                className="inline-flex items-center gap-space-xs h-11 px-space-md rounded-xl bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px]">call</span>
                <span>Immediate Dispatch Hotline</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
