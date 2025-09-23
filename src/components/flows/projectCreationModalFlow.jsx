// ProjectCreationModalFlow.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import continuous from "../../images/graphics/continuous1.png";
import terminal from "../../images/graphics/terminal.png";
import styles from "./ProjectCreationModalFlow.module.css";
import info from "../../images/icons/info.svg";
import calendar from "../../images/icons/calendar.svg";
import add from "../../images/icons/add.svg";
import { getUserById, getUserNameAndImageById } from "../../service/User/UserFetcher";
import dot from "../../images/icons/dot.svg"
import phase from "../../images/icons/phases.svg"
import warning from "../../images/icons/warning.svg"
import {formatFullDate, formatToShortDate} from "../../utils/datetime"

/* ------------------------ Data -------------------------- */
const TEMPLATE_CARDS = {
  terminal: [
    { key: "product_launch", title: "Product Launch", subtitle: "Plan / Build / Release" },
    { key: "client_product", title: "Client product delivery", subtitle: "Kickoff / Discovery / Design / Build / UAT" },
    { key: "design_uplift", title: "Design uplift", subtitle: "Audits / Tokens / Key screens" },
  ],
  contiguous: [
    { key: "maintenance_ops", title: "Maintenance Ops", subtitle: "Reliability • Uptime • MTTR" },
    { key: "support_retainer", title: "Support Retainer", subtitle: "SLA Response/Resolution" },
    { key: "growth_loop", title: "Growth Loop", subtitle: "Monthly experiments" },
  ],
};




// Workspace member userIds provided
const WORKSPACE_MEMBERS = [
  "68221d90e2d6a83803299798",
  "682261a534dad32c4fb247d4",
  "68564c39c9b01c76fa6db939",
  "687e9bed062bfaac21f96c6d",
  "6821e97f0b78b01dae9527bd",
  "68cd5dd8e5ebb256a1454b91",
  "68cda480e5ebb256a1454b92",
];

/* Template library for StepStructure */
const TEMPLATE_LIBRARY = {
  product_launch: {
    terminal: {
      phases: [
        { id: "pln", title: "Plan", weight: 20 },
        { id: "bld", title: "Build", weight: 60 },
        { id: "rls", title: "Release", weight: 20 },
      ],
    },
  },
  client_product: {
    terminal: {
      phases: [
        { id: "1", title: "Kickoff", weight: 10 },
        { id: "2", title: "Discovery", weight: 20 },
        { id: "3", title: "Design", weight: 25 },
        { id: "4", title: "Development", weight: 35 },
        { id: "5", title: "UAT", weight: 10 },
      ],
    },
  },

   maintenance_ops: {
    contiguous: {
      streams: [
        { id: "mnt", title: "Maintenance", cadence: "Monthly", kpis: ["Backlog age", "Patch latency", "Defects closed"] },
        { id: "rel", title: "Reliability", cadence: "Weekly", kpis: ["Uptime", "MTTR", "Incidents"] },
      ],
    },
  },
  support_retainer: {
    contiguous: {
      streams: [
        { id: "sla", title: "SLA Support", cadence: "Daily", kpis: ["First response", "Resolution time", "CSAT"] },
        { id: "tri", title: "Triage & QA", cadence: "Weekly", kpis: ["Bug reopen rate", "Escalations"] },
      ],
    },
  },
  reliability_ops: {
    contiguous: {
      streams: [
        { id: "inc", title: "SRE Incidents", cadence: "Weekly", kpis: ["MTTR", "MTBF", "P1 count"] },
        { id: "obs", title: "Observability", cadence: "Monthly", kpis: ["Coverage", "Alert fatigue"] },
      ],
    },
  },
  devops_ops: {
    contiguous: {
      streams: [
        { id: "cicd", title: "CI/CD", cadence: "Weekly", kpis: ["Deploys/week", "Change failure rate"] },
        { id: "inf", title: "Infrastructure", cadence: "Monthly", kpis: ["Cost", "Capacity headroom"] },
      ],
    },
  },
  growth_loop: {
    contiguous: {
      streams: [
        { id: "exp", title: "Experiments", cadence: "Weekly", kpis: ["Tests/week", "Win rate", "Lift"] },
        { id: "cnt", title: "Content", cadence: "Monthly", kpis: ["Posts", "Leads"] },
      ],
    },
  },
  customer_success: {
    contiguous: {
      streams: [
        { id: "onb", title: "Onboarding", cadence: "Weekly", kpis: ["TTFV", "Activation rate"] },
        { id: "hth", title: "Health & Renewals", cadence: "Monthly", kpis: ["Churn", "NPS"] },
      ],
    },
  },
  empty_project: {
    terminal: { phases: [] },
    contiguous: { streams: [] },
  },
};

/* ----------------------- Utilities ----------------------- */
function InfoTip({ text }) {
  return (
    <span className={styles.tip} role="tooltip" aria-label={text}>
      <span className={styles.tipIcon}><img src={info} alt="" /></span>
      <span className={styles.tipBubble}>{text}</span>
    </span>
  );
}
function formatPrettyDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  } catch { return iso; }
}
function useOutsideClose(onClose) {
  const ref = useRef(null);
  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) onClose?.(); }
    function onKey(e) { if (e.key === "Escape") onClose?.(); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return ref;
}
function getViewportAnchorRect(el) {
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height };
}

/* -------------------- Custom Calendar -------------------- */
function CalendarPopover({ cal, startDate, endDate, onClose, onPickStart, onPickRange }) {
  const ref = useOutsideClose(onClose);
  if (!cal?.anchor) return null;

  const CAL_WIDTH = 300;
  const CAL_HEIGHT = 300;
  const GAP = 10;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const sx = window.scrollX;
  const sy = window.scrollY;

  let left = cal.anchor.left + (cal.anchor.width / 2) - (CAL_WIDTH / 2);
  left = Math.max(sx + 12, Math.min(left, sx + vw - CAL_WIDTH - 12));

  const spaceBelow = (sy + vh) - (cal.anchor.top + cal.anchor.height);
  const spaceAbove = (cal.anchor.top) - sy;
  const placeBelow = spaceBelow >= CAL_HEIGHT + GAP || spaceBelow >= spaceAbove;
  const top = placeBelow ? cal.anchor.top + cal.anchor.height + GAP : cal.anchor.top - CAL_HEIGHT - GAP;

  const isEnd = cal.target === "end";

  return (
    <div
      ref={ref}
      className={styles.calPopover}
      data-placement={placeBelow ? "bottom" : "top"}
      style={{ position: "absolute", top, left, zIndex: 9999 }}
    >
      <MiniCalendar
        key={isEnd ? `end-${startDate || "none"}` : `start`} // force remount on target switch
        initial={cal.initial}
        disablePrevious={isEnd ? (startDate || new Date().toISOString().slice(0,10)) : (startDate ? startDate : new Date().toISOString().slice(0,10))}
        selectedDates={isEnd ? [startDate, endDate].filter(Boolean) : [startDate].filter(Boolean)}
        range={isEnd}
        onSelect={isEnd ? undefined : (iso) => onPickStart?.(iso)}
        onRangeSelect={({ start, end }) => onPickRange?.({ start, end })}
      />
    </div>
  );
}

function MiniCalendar({ initial, onSelect, onRangeSelect, disablePrevious, selectedDates = [], range = false }) {
  const todayISO = new Date().toISOString().slice(0,10);
  const floorISO = (iso) => iso ? new Date(iso).toISOString().slice(0,10) : null;
  const cmp = (a, b) => new Date(a) - new Date(b);
  const isSame = (a, b) => a && b && floorISO(a) === floorISO(b);
  const isBetween = (d, a, b) => a && b && new Date(d) >= new Date(a) && new Date(d) <= new Date(b);

  const minISO = floorISO(disablePrevious) || todayISO;

  const [rangeStart, setRangeStart] = useState(() => (range && selectedDates?.[0]) ? floorISO(selectedDates[0]) : null);
  const [rangeEnd, setRangeEnd] = useState(() => (range && selectedDates?.[1]) ? floorISO(selectedDates[1]) : null);

  useEffect(() => {
    if (range) {
      const seed = Array.isArray(selectedDates) ? selectedDates[0] : null;
      setRangeStart(seed ? floorISO(seed) : null);
      setRangeEnd(null);
    }
  }, [range, selectedDates && selectedDates[0]]); // eslint-disable-line react-hooks/exhaustive-deps

  const init = initial ? new Date(initial) : new Date();
  const [view, setView] = useState(new Date(init.getFullYear(), init.getMonth(), 1));

  const monthName = view.toLocaleString(undefined, { month: "long", year: "numeric" });
  const startWeekday = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

  const prev = () => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1));
  const next = () => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1));

  const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  function handlePick(dayISO) {
    if (range) {
      if (!rangeStart) { setRangeStart(dayISO); return; }
      let s = rangeStart, e = dayISO;
      if (cmp(e, s) < 0) [s, e] = [e, s];
      setRangeStart(s);
      setRangeEnd(e);
      onRangeSelect?.({ start: s, end: e });
    } else {
      onSelect?.(dayISO);
    }
  }

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedSet = new Set((selectedDates || []).map(floorISO).filter(Boolean));

  return (
    <div className={styles.calCard}>
      <div className={styles.calHeader}>
        <div type="button" className={styles.calNav} onClick={prev}>‹</div>
        <div className={styles.calTitle}>{monthName}</div>
        <div type="button" className={styles.calNav} onClick={next}>›</div>
      </div>

      <div className={styles.calWeek}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <div key={d} className={styles.calDow}>{d}</div>)}
      </div>

      <div className={styles.calGrid}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} className={styles.calCellEmpty} />;
          const dayISO = iso(view.getFullYear(), view.getMonth(), d);

          const isDisabled = new Date(dayISO) < new Date(minISO);
          const isSelectedSingle = !range && selectedSet.has(dayISO);
          const isStart = range && isSame(dayISO, rangeStart);
          const isEnd = range && isSame(dayISO, rangeEnd);
          const inRange = range && rangeStart && rangeEnd && isBetween(dayISO, rangeStart, rangeEnd);

          const classNames = [
            styles.calCell,
            isDisabled ? styles.disabled : "",
            isSelectedSingle ? styles.selected : "",
            isStart ? styles.rangeStart : "",
            isEnd ? styles.rangeEnd : "",
            inRange ? styles.inRange : "",
          ].join(" ");

          return (
            <div
              key={i}
              role="button"
              aria-disabled={isDisabled}
              className={classNames}
              onClick={() => !isDisabled && handlePick(dayISO)}
            >
              <p>{d}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------- Stepper ----------------------- */
function PillStepper({ step, setStep, total = 4, ariaLabel = "Project creation steps" }) {
  return (
    <div className={styles.pillBar} role="tablist" aria-label={ariaLabel}>
      {Array.from({ length: total }).map((_, i) => {
        const state = i < step ? "done" : i === step ? "active" : "todo";
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === step}
            aria-current={i === step ? "step" : undefined}
            title={`Step ${i + 1}`}
            className={`${styles.pill} ${styles[state]}`}
            onClick={() => setStep(i)}
          >
            {state === "active" && <span className={styles.pillGlow} aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------- Root Modal ---------------------- */
export default function ProjectCreationModalFlow({ onClose, onCreate }) {
  const [step, setStep] = useState(0);

  const [kind, setKind] = useState("terminal");
  const [isClient, setIsClient] = useState(false);
  const [template, setTemplate] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ongoing, setOngoing] = useState(false);

  const [cal, setCal] = useState(null);

  const [members, setMembers] = useState([]); // [{ userId, name, picture, role }]
  const [openMembers, setOpenMembers] = useState(false);

  const canNext = useMemo(() => {
    if (step === 0) {
      const nameOk = name.trim().length >= 3;
      const dateOk =
        kind === "contiguous" ||
        !startDate ||
        (!endDate && !ongoing) ||
        (startDate && endDate && new Date(startDate) <= new Date(endDate));
      return !!kind && nameOk && dateOk;
    }
    return true;
  }, [step, kind, name, startDate, endDate, ongoing]);

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleCreate = () => {
    const payload = {
      kind,
      isClient,
      template: template || null,
      basics: {
        name: name.trim(),
        description: description.trim(),
        startDate: startDate || null,
        endDate: kind === "contiguous" ? null : (endDate || null),
        ongoing: kind === "contiguous" || ongoing,
      },
      members: members.map(({ userId, role }) => ({ userId, role })),
    };
    onCreate?.(payload);
    onClose?.();
  };

  function openCalendar(nextPayload) { setCal(nextPayload); }
  function closeCalendar() { setCal(null); }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="pcm_title">
      {openMembers && (
        <AddMembersByIdsModal
          userIds={WORKSPACE_MEMBERS}
          initialSelected={members}
          onClose={() => setOpenMembers(false)}
          onSave={(picked) => { setMembers(picked); setOpenMembers(false); }}
        />
      )}

      <CalendarPopover
        cal={cal}
        startDate={startDate}
        endDate={endDate}
        onClose={closeCalendar}
        onPickStart={(iso) => { if (cal?.target === "start") { setStartDate(iso); closeCalendar(); } }}
        onPickRange={({ start, end }) => {
          setStartDate(start);
          setEndDate(kind === "contiguous" ? null : end);
          closeCalendar();
        }}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={styles["main-wrapper"]}
      >
        <header className={styles["modal-header"]}>
          <div className={styles["modal-header-i"]}>
            <p>Create a project</p>
            <p>Set up a project built for how the work really happens</p>
            <p>Choose a structure that matches the timeline, add goals and milestones, and start with sensible defaults—everything stays fully editable as the project evolves.</p>
          </div>
        </header>

        <PillStepper step={step} setStep={setStep} total={4} />

        <div className={styles.body}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="type-basics"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <StepTypeAndBasics
                  kind={kind} setKind={setKind}
                  isClient={isClient} setIsClient={setIsClient}
                  name={name} setName={setName}
                  description={description} setDescription={setDescription}
                  startDate={startDate} setStartDate={setStartDate}
                  endDate={endDate} setEndDate={setEndDate}
                  ongoing={ongoing} setOngoing={setOngoing}
                  onOpenCalendar={(payload) => openCalendar(payload)}
                />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="templates" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
                <StepTemplates
                  kind={kind}
                  template={template}
                  setTemplate={setTemplate}
                  members={members}
                  setMembers={setMembers}
                  openMembers={openMembers}
                  setOpenMembers={setOpenMembers}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="structure" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
                <StepStructure kind={kind} template={template} projectTitle={name} projectDescription={description} projectStartDate={startDate} projectEndDate={endDate}/>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="review" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
                <StepReview
                  kind={kind}
                  isClient={isClient}
                  template={template}
                  name={name}
                  description={description}
                  startDate={startDate ? formatPrettyDate(startDate) : "—"}
                  endDate={kind === "contiguous" ? "— (ongoing)" : (endDate ? formatPrettyDate(endDate) : "—")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className={styles.footer}>
          <div className={styles.ghostBtn} onClick={back} aria-disabled={step === 0}>Back</div>
          {step < 3 && <div className={styles.primaryBtn} onClick={next} aria-disabled={!canNext}>Continue</div>}
          {step === 3 && <div className={styles.primaryBtn} onClick={handleCreate}>Create Project</div>}
        </footer>
      </motion.div>
    </div>
  );
}

/* -------------- Step 1: Details / Dates / Type -------------- */
function StepTypeAndBasics({
  kind, setKind,
  isClient, setIsClient,
  name, setName,
  description, setDescription,
  startDate, setStartDate,
  endDate, setEndDate,
  ongoing, setOngoing,
  onOpenCalendar
}) {
  const isContiguous = kind === "contiguous";


  

  return (
    <div className={styles.grid}>
      <section className={styles["modal-section"]}>
        <div className={styles["modal-title"]}>
          <p>
            Provide project details{" "}
            <InfoTip text="Accurate name, description, and dates are critical—Gravyn’s project‑management AI relies on them." />
          </p>
        </div>

        <div className={styles["form-grid"]}>
          <div>
            <input
              className={styles["input-area"]}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Provide project name , e.g., Gravyn v1 Launch"
            />
          </div>

          <div>
            <textarea
              className={styles["text-area"]}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project"
            />
          </div>
        </div>
      </section>

      <section className={styles["modal-section"]}>
        <div className={styles["modal-title"]}>
          <p>Project dates timeline</p>
        </div>

        <div className={styles.datePreviewBlock}>
          <div className={styles.datePreview} aria-live="polite">
            <div
              className={styles.dateChipWrap}
              onClick={(e) => {
                const anchor = getViewportAnchorRect(e.currentTarget);
                onOpenCalendar?.({
                  target: "start",
                  initial: startDate || new Date().toISOString().slice(0,10),
                  anchor
                });
              }}
            >
              <span className={styles.dateIcon} aria-hidden="true"><img src={calendar} alt="" /></span>
              <span className={styles.dateChipText}>{startDate ? formatPrettyDate(startDate) : "Start date"}</span>
            </div>

            <div className={styles.dateArrowWrap}><span className={styles.dateArrow} aria-hidden="true">→</span></div>

            <div
              className={styles.dateChipWrap}
              onClick={(e) => {
                if (isContiguous) return;
                const anchor = getViewportAnchorRect(e.currentTarget);
                onOpenCalendar?.({
                  target: "end",
                  initial: endDate || startDate || new Date().toISOString().slice(0,10),
                  anchor
                });
              }}
              title={isContiguous ? "Ongoing project" : "Pick end date"}
              aria-disabled={isContiguous}
              style={isContiguous ? { opacity: 0.6, pointerEvents: "none" } : undefined}
            >
              <span className={styles.dateIcon} aria-hidden="true"><img src={calendar} alt="" /></span>
              <span className={styles.dateChipText}>
                {isContiguous ? "Ongoing" : (endDate ? formatPrettyDate(endDate) : "End date")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles["modal-section"]}>
        <div className={styles["modal-title"]}>
          <p>
            Choose a project type to proceed{" "}
            <InfoTip text="Terminal = fixed finish; Contiguous = ongoing operations." />
          </p>
        </div>

        <div className={styles["modal-content-wrapper"]}>
          <div
            className={`${styles["entity-type-wrapper"]} ${kind === "terminal" ? styles.selected : ""}`}
            onClick={() => setKind("terminal")}
            role="button"
            tabIndex={0}
          >
            <div className={`${styles["image-wrapper"]} ${styles["modal-content-wrapper-i"]}`}>
              <img src={terminal} alt="Terminal project" />
            </div>
            <p>Terminal Project</p>
          </div>
          

          <div
            className={`${styles["entity-type-wrapper"]} ${kind === "contiguous" ? styles.selected : ""}`}
            onClick={() => setKind("contiguous")}
            role="button"
            tabIndex={0}
          >
            <div className={`${styles["image-wrapper"]} ${styles["modal-content-wrapper-i"]}`}>
              <img src={continuous} alt="Contiguous project" />
            </div>
            <p>Contiguous Project</p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------------- Step 2: Templates ---------------------- */
function StepTemplates({ kind, template, setTemplate, members, setMembers, openMembers, setOpenMembers }) {
const keys = kind === "terminal"
  ? ["client_product", "product_launch", "empty_project"]
  : ["maintenance_ops", "reliability_ops",  "empty_project"];

const TEMPLATE_ASSETS = {
  product_launch: { title: "Product launch" },
  client_product: { title: "Client product delivery" },
  design_uplift: { title: "Design uplift" },
  maintenance_ops: { title: "Maintenance Ops" },
  support_retainer: { title: "Support Retainer" },
  reliability_ops: { title: "Reliability Ops (SRE)" },
  growth_loop: { title: "Growth Loop" },
  customer_success: { title: "Customer Success" },
  empty_project: { title: "Start blank" },
};

  

  return (
    <div className={styles.grid}>


      <div className={styles['grid-header']}>
        <p>Select a template, outline the plan, and bring the right people in to start strong.</p>
      </div>

      <section className={styles["modal-section"]}>
        <div className={styles["modal-title"]}>
          <p>
            Start from a template{" "}
            <InfoTip text="Templates prefill structure and defaults. Everything remains editable." />
          </p>
        </div>

        <div className={styles.templateGrid}>
          {keys.map((key) => {
            const t = TEMPLATE_ASSETS[key];
            const selected = template === key || (key === "empty_project" && template === "");
            return (
              <div
                key={key}
                role="button"
                tabIndex={0}
                className={`${styles["template-card-wrapper"]} ${selected ? styles.selected : ""}`}
                onClick={() => setTemplate(key === "empty_project" ? "" : key)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setTemplate(key === "empty_project" ? "" : key)}
                aria-pressed={selected}
                aria-label={t.title}
              >
                <div className={styles["template-header"]}>
                  {/* graphics optional */}
                </div>

                <div className={styles["template-footer"]}>
                  <p>{t.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles["modal-section"]}>
        <div className={styles["modal-title"]}>
          <p>
            Select team members from the organisation{" "}
            <InfoTip text="Pick teammates and set permissions inline; changes save with the project." />
          </p>
        </div>

        <div className={styles.inlineRow} style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {members?.length > 0 && (
              <div className={styles.memberChips}>
                {members.slice(0, 5).map((m) => (
                  <div key={m.userId} className={styles.memberChip} title={m.name || m.userId}>
                    {m.picture ? (
                      <div className={styles["mChip"]}>
                        <img src={m.picture} alt="" />
                        <p>{m.name}</p>
                      </div>
                    ) : (
                      <span className={styles.memberFallback}>{(m.name || m.userId).slice(0,1).toUpperCase()}</span>
                    )}
                  </div>
                ))}
                {members.length > 5 && (
                  <div className={`${styles.memberChip} ${styles.moreChip}`} title={`${members.length - 5} more`}>
                    +{members.length - 5}
                  </div>
                )}
              </div>
            )}

            <div type="button" className={styles["add-btn"]} onClick={() => setOpenMembers(true)}>
              <img src={add} alt="" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


// Phase model:
// { id, title, weight, description?, ownerId?, dueDate? }

function PhaseRow({ i, total, phase, onTitle, onWeight, onDesc, onOwner, onDue, onRemove, onMoveUp, onMoveDown }) {
  return (
    <div className={styles.phaseRow}>
      <div className={styles.phaseIndex}>{i + 1}.</div>

      <input
        className={styles.phaseTitle}
        value={phase.title}
        onChange={(e) => onTitle(phase.id, e.target.value)}
        placeholder="Phase title (e.g., Design)"
      />

      <div className={styles.weightWrap}>
        <input
          className={styles.weightInput}
          type="number"
          min="0"
          max="100"
          value={phase.weight}
          onChange={(e) => onWeight(phase.id, e.target.value)}
        />
        <span className={styles.weightUnit}>%</span>
      </div>

      <input
        className={styles.phaseDesc}
        value={phase.description || ""}
        onChange={(e) => onDesc(phase.id, e.target.value)}
        placeholder="Optional description"
      />

      <input
        className={styles.phaseOwner}
        value={phase.ownerId || ""}
        onChange={(e) => onOwner(phase.id, e.target.value)}
        placeholder="Owner (userId or name)"
      />

      <input
        className={styles.phaseDue}
        type="date"
        value={phase.dueDate || ""}
        onChange={(e) => onDue(phase.id, e.target.value)}
      />

      <div className={styles.phaseActions}>
        <button type="button" className={styles.iconBtn} onClick={() => onMoveUp(phase.id)} disabled={i === 0} aria-label="Move up">↑</button>
        <button type="button" className={styles.iconBtn} onClick={() => onMoveDown(phase.id)} disabled={i === total - 1} aria-label="Move down">↓</button>
        <button type="button" className={styles.pillX} onClick={() => onRemove(phase.id)} aria-label="Remove">✕</button>
      </div>
    </div>
  );
}



function StepStructure({
  kind,
  template,
  // Optional props if available from parent; else swap with window.__project* inside analyzeAndSeedFromAI
  projectTitle,
  projectDescription,
  projectStartDate,
  projectEndDate,
  projectPlan,
  projectAiPrompt,
}) {
  const preset = TEMPLATE_LIBRARY[template || "empty_project"] || TEMPLATE_LIBRARY.empty_project;
  const isTerminal = kind === "terminal";

  const [phases, setPhases] = React.useState(() => {
    const base = preset.terminal?.phases?.length ? preset.terminal.phases : TEMPLATE_LIBRARY.empty_project.terminal.phases;
    return seedPhases(base);
  });
  const [streams, setStreams] = React.useState(() => {
    const base = preset.contiguous?.streams?.length ? preset.contiguous.streams : TEMPLATE_LIBRARY.empty_project.contiguous.streams;
    return base;
  });

  const [showPhaseModal, setShowPhaseModal] = React.useState(false);
  const [warn, setWarn] = React.useState("");
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiError, setAiError] = React.useState("");

  React.useEffect(() => {
    const base = TEMPLATE_LIBRARY[template || "empty_project"] || TEMPLATE_LIBRARY.empty_project;
    const terminalBase = base.terminal?.phases?.length ? base.terminal.phases : TEMPLATE_LIBRARY.empty_project.terminal.phases;
    setPhases(seedPhases(terminalBase));
    const contigBase = base.contiguous?.streams?.length ? base.contiguous.streams : TEMPLATE_LIBRARY.empty_project.contiguous.streams;
    setStreams(contigBase);
  }, [template]);

  function seedPhases(list) {
    const src = Array.isArray(list) && list.length ? list : [];
    return src.map((p, i) => ({ order: i, color: p.color || undefined, dueDate: p.dueDate || "", ...p }));
  }
  function uid() { return `ph_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }
  function totalWeight(arr) { return (arr || []).reduce((s, p) => s + (Number(p.weight) || 0), 0); }

  const PHASE_COLORS = ["#60A5FA","#F59E0B","#34D399","#F87171","#A78BFA","#22D3EE","#FB7185","#FBBF24"];
  function colorForPhase(phase, idx = 0) {
    if (phase.color) return phase.color;
    const key = String(phase.id || phase.title || idx);
    let h = 0; for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return PHASE_COLORS[h % PHASE_COLORS.length];
  }
  function formatToShortDate(d) {
    try {
      return d.toISOString().slice(0,10);
    } catch { return "—"; }
  }

  function setWeight(id, w) {
    const val = Math.max(0, Number(w) || 0);
    setPhases(phases.map(p => p.id === id ? { ...p, weight: val } : p));
    setWarn("");
  }
  function setTitle(id, t) { setPhases(phases.map(p => p.id === id ? { ...p, title: t } : p)); }
  function addPhase() {
    const next = [...phases, { id: uid(), title: `Phase ${phases.length + 1}`, weight: 0, order: phases.length }];
    setPhases(next);
  }
  function removePhase(id) {
    const next = phases.filter(p => p.id !== id).map((p, i) => ({ ...p, order: i }));
    setPhases(next);
  }

  function applyResizeWeights(nextWeights) {
    setPhases(phases.map((p, i) => ({ ...p, weight: Math.round(Math.max(0, nextWeights[i] ?? (Number(p.weight) || 0))) })));
  }

  function openNewPhaseModal() { setShowPhaseModal(true); setWarn(""); }
  function addPhaseFromModal(newPhase) {
    const withId = { id: uid(), order: phases.length, ...newPhase };
    const next = [...phases, withId];
    const sum = totalWeight(next);
    if (sum > 100) {
      setWarn(`Total exceeds 100% by ${Math.round(sum - 100)}%. Reduce other weights or lower the new phase weight.`);
      return;
    }
    setWarn("");
    setPhases(next);
    setShowPhaseModal(false);
  }

  function setStreamTitle(id, t) { setStreams(streams.map(s => s.id === id ? { ...s, title: t } : s)); }
  function setStreamCadence(id, c) { setStreams(streams.map(s => s.id === id ? { ...s, cadence: c } : s)); }
  function setStreamKpis(id, val) {
    const arr = val.split(",").map(v => v.trim()).filter(Boolean);
    setStreams(streams.map(s => s.id === id ? { ...s, kpis: arr } : s));
  }
  function addStream() {
    setStreams([...streams, { id: `st_${Date.now()}`, title: `Stream ${streams.length + 1}`, cadence: "Monthly", kpis: [] }]);
  }
  function removeStream(id) {
    const next = streams.filter(s => s.id !== id);
    setStreams(next.length ? next : [{ id: "st1", title: "Stream 1", cadence: "Monthly", kpis: [] }]);
  }

  async function analyzeAndSeedFromAI() {
    try {
      setAiLoading(true);
      setAiError("");
      const payload = {
        title: projectTitle ?? window.__projectTitle ?? "",
        description: projectDescription ?? window.__projectDesc ?? "",
        theme: template || "default",
        kind: isTerminal ? "terminal" : "contiguous",
        startDate: projectStartDate ?? window.__projectStartDate ?? null,
        endDate: isTerminal ? (projectEndDate ?? window.__projectEndDate ?? null) : null,
        plan: projectPlan ?? window.__projectPlan ?? "",
        userPrompt: projectAiPrompt ?? window.__projectAiPrompt ?? ""
      };
      const res = await fetch("http://localhost:5001/api/v1/projects/analyze-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text() || "Analyzer service error");
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || "Analyzer failed");
      const data = json.data || {};


      if (isTerminal) {
        const nextPhases = (data.structure?.phases || []).map((p, i) => ({
          id: p.id || `ph_${Date.now()}_${i}`,
          title: p.title || `Phase ${i + 1}`,
          weight: Number(p.weight) || 0,
          color: p.color || undefined,
          dueDate: p.dueDate || "",
          order: i,
          notes: p.notes || ""
        }));




        setPhases(nextPhases);


        setWarn("");
      } else {
        const nextStreams = (data.structure?.streams || []).map((s, i) => ({
          id: s.id || `st_${Date.now()}_${i}`,
          title: s.title || `Stream ${i + 1}`,
          cadence: s.cadence || "Monthly",
          kpis: Array.isArray(s.kpis) ? s.kpis : [],
          color: s.color || undefined
        }));
        setStreams(nextStreams);
      }
    } catch (err) {
      setAiError(err?.message || "Failed to analyze with AI");
    } finally {
      setAiLoading(false);
    }
  }

function PhaseGraphic({
  isAiLoading = false,
  max1 = "90%",
  max2 = "60%",
  max3 = "80%",
  className = "",
}) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Stop animation when not loading; reset targets
    if (!isAiLoading) {
      el.style.removeProperty("--target-1");
      el.style.removeProperty("--target-2");
      el.style.removeProperty("--target-3");
      return;
    }

    function randPct(maxStr) {
      const max = parseInt(String(maxStr).replace("%","").trim(), 10) || 100;
      const min = 10;
      const cap = Math.max(min, max);
      const v = Math.floor(Math.random() * (cap - min + 1)) + min;
      return `${Math.min(v, cap)}%`;
    }

    function tick() {
      const cs = getComputedStyle(el);
      const ph1Max = cs.getPropertyValue("--ph1-max").trim() || max1;
      const ph2Max = cs.getPropertyValue("--ph2-max").trim() || max2;
      const ph3Max = cs.getPropertyValue("--ph3-max").trim() || max3;

      el.style.setProperty("--target-1", randPct(ph1Max));
      el.style.setProperty("--target-2", randPct(ph2Max));
      el.style.setProperty("--target-3", randPct(ph3Max));
    }

    tick();
    const id = setInterval(tick, 600);
    return () => clearInterval(id);
  }, [isAiLoading, max1, max2, max3]);

  return (
    <div
      ref={ref}
      className={`${styles["phase-graphic"]} ${className}`}
      data-loading={isAiLoading ? "true" : "false"}
      style={{ "--ph1-max": max1, "--ph2-max": max2, "--ph3-max": max3 }}
    >
      <div className={styles["phase-graphic-i"]}>
        <div className={styles["phase-graphic-phase"]} data-row="1" />
      </div>
      <div className={styles["phase-graphic-i"]}>
        <div className={styles["phase-graphic-phase"]} data-row="2" />
      </div>
      <div className={styles["phase-graphic-i"]}>
        <div className={styles["phase-graphic-phase"]} data-row="3" />
      </div>
    </div>
  );
}

  if (isTerminal) {
    const sum = totalWeight(phases);
    const over = sum > 100;

    return (
      <div className={styles.formGrid}>
        <div className={styles["grid-header"]}>
          <p>Define the phases and assign weights to shape your project plan.</p>
        </div>

        <section className={styles["modal-section"]}>
          <div className={styles["modal-title"]}>
            <div className={styles["modal-title-i"]}>
              <p>
                Configure phases or goals for your project
                <InfoTip text="Define clear phases and assign balanced weights so progress, forecast, and reporting stay accurate; weights can be refined anytime as the plan evolves." />
              </p>
            </div>
            <div className={styles["modal-title-action-wrapper"]}>
              <div onClick={openNewPhaseModal} className={`${styles["img"]} ${styles["img-add"]}`}>
                <img src={add} alt="" />
              </div>
              <div className={`${styles["img"]} ${styles["img-dot"]}`} onClick={analyzeAndSeedFromAI} title="AI analyze & generate">
                <img src={dot} alt="" />
              </div>
            </div>
          </div>

          <div className={`${styles["modal-content"]} ${styles["modal-content-phase"]}`}>
            {aiError && <div className={styles.warn}>{aiError}</div>}

            {phases.length === 0 && (
              <div className={styles["no-phases"]}>

                    <PhaseGraphic isAiLoading={aiLoading} max1="90%" max2="55%" max3="70%" />

                {/* <div className={styles['phase-graphic']}>
                   <div className={styles['phase-graphic-i']}>
                       <div className={styles['phase-graphic-phase']}/>
                   </div>
                    <div className={styles['phase-graphic-i']}>
                       <div className={styles['phase-graphic-phase']}/>
                   </div>
                   <div className={styles['phase-graphic-i']}>
                       <div className={styles['phase-graphic-phase']}/>
                   </div>
                </div> */}
                {/* <img src={phase} alt="" /> */}
                <p>{aiLoading ? "Generating ..." : "No active phases."}</p>
              </div>
            )}

            {phases.length > 0 && (
              <div className={styles["phases-wrapper"]}>
                <PhaseWeightBar phases={phases} colorForPhase={colorForPhase} onResize={(nextWeights) => applyResizeWeights(nextWeights)} />
                {over && (
                  <div className={styles.warn}>
                    <img src={warning}/>
                    <p>Total phase weight is {Math.round(sum)}%. Reduce weights so the total does not exceed 100%.</p>
                  </div>
                )}
                {warn && <div className={styles.warn}>{warn}</div>}

                <div className={styles["phases-intital-wrapper"]}>
                  {phases.map((p, idx) => (
                    <div key={p.id || idx} className={styles["phase-row"]}>
                      <div className={styles["phase-row-i"]}>
                        <div className={styles.phaseColorDot} style={{ background: colorForPhase(p, idx) }} />
                        <p className={styles["phase-name"]}>{p.title}</p>
                        <p className={styles["phase-date"]}>
                          {p.dueDate ? formatToShortDate(new Date(p.dueDate)) : "—"}
                        </p>
                        <p>{p.description}</p>
                      </div>
                      <div className={styles["phase-row-i"]}>
                    <div className={styles.weightStepper}>
  <div
    type="button"
    className={styles.stepBtn}
    onClick={() => setWeight(p.id, Math.max(0, (Number(p.weight) || 0) - 1))}
    aria-label="Decrease weight"
  >
    <p>-</p>
  </div>
  <p className={styles.weightReadout}>{Math.round(Number(p.weight) || 0)}%</p>
  <div
    type="button"
    className={styles.stepBtn}
    onClick={() => setWeight(p.id, Math.min(100, (Number(p.weight) || 0) + 1))}
    aria-label="Increase weight"
  >
    <p>+</p>
  </div>
</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {showPhaseModal && (
          <NewPhaseModal
            onCancel={() => setShowPhaseModal(false)}
            onCreate={(p) => addPhaseFromModal(p)}
            defaultWeight={Math.max(0, 100 - totalWeight(phases))}
          />
        )}
      </div>
    );
  }

  return (
    <div className={styles.formGrid}>
      <div className={styles["grid-header"]}>
        <p>Configure the streams, set cadences, and choose KPIs to drive ongoing work.</p>
      </div>

      <div className={styles.inlineRow} style={{ gap: 8, marginBottom: 8 }}>
        <div className={`${styles["img"]} ${styles["img-dot"]}`} onClick={analyzeAndSeedFromAI} title="AI analyze & generate">
          <img src={dot} alt="" />
        </div>
        {aiLoading && <div className={styles.muted}>Analyzing…</div>}
        {aiError && <div className={styles.warn}>{aiError}</div>}
      </div>

      <h3 className={styles.sectionTitle}>Streams (cadence and KPIs)</h3>
      <div className={styles.phaseList}>
        {streams.map((s) => (
          <div key={s.id} className={styles.phaseRow}>
            <div className={styles.phaseColorDot} style={{ background: colorForPhase(s) }} />
            <input
              className={styles.phaseTitle}
              value={s.title}
              onChange={(e) => setStreamTitle(s.id, e.target.value)}
            />
            <select
              className={styles.cadenceSel}
              value={s.cadence}
              onChange={(e) => setStreamCadence(s.id, e.target.value)}
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Biweekly</option>
              <option>Monthly</option>
              <option>Quarterly</option>
            </select>
            <input
              className={styles.kpiInput}
              placeholder="KPIs comma-separated"
              value={(s.kpis || []).join(", ")}
              onChange={(e) => setStreamKpis(s.id, e.target.value)}
            />
            <button className={styles.pillX} onClick={() => removeStream(s.id)}>✕</button>
          </div>
        ))}
      </div>

      <div className={styles.inlineRow} style={{ marginTop: 8 }}>
        <button className={styles.ghostBtn} onClick={addStream}>Add stream</button>
      </div>
    </div>
  );
}

function PhaseWeightBar({ phases, colorForPhase, onResize }) {
  const barRef = React.useRef(null);
  const total = (phases || []).reduce((s, p) => s + (Number(p.weight) || 0), 0) || 1;
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  function startDrag(e, idx) {
    e.preventDefault();
    const bar = barRef.current; if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const startX = e.clientX;
    const startWeights = phases.map(p => Number(p.weight) || 0);

    function onMove(ev) {
      const dx = ev.clientX - startX;
      const pctDelta = (dx / rect.width) * total;
      const wA = startWeights[idx];
      const wB = startWeights[idx + 1];
      if (wB == null) return;

      let newA = clamp(wA + pctDelta, 0, 100);
      let newB = clamp(wB - (newA - wA), 0, 100);
      const appliedDelta = (wB - newB);
      newA = wA + appliedDelta;

      const next = startWeights.slice();
      next[idx] = newA;
      next[idx + 1] = newB;
      onResize?.(next);
    }

    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div ref={barRef} className={styles.phaseBar} aria-label="Phase weights">
      {phases.map((p, i) => {
        const pct = Math.max(0, (Number(p.weight) || 0) * 100 / total);
        const w = `${pct}%`;
        const bg = colorForPhase(p, i);
        const hasHandle = i < phases.length - 1;
        return (
          <div key={p.id || i} className={styles.phaseBarSeg} style={{ width: w, background: bg }}>
            {hasHandle && (
              <span
                className={styles.splitHandle}
                onMouseDown={(e) => startDrag(e, i)}
                role="separator"
                aria-orientation="horizontal"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function NewPhaseModal({ defaultWeight = 25, onCancel, onCreate }) {
  const [title, setTitle] = React.useState("");
  const [weight, setWeight] = React.useState(defaultWeight);
  const [description, setDescription] = React.useState("");
  const [ownerId, setOwnerId] = React.useState("");
  const [dueDate, setDueDate] = React.useState(new Date().toISOString().slice(0,10));

  const canSave = title.trim().length >= 2;

  function submit() {
    if (!canSave) return;
    onCreate?.({
      title: title.trim(),
      weight: Number(weight) || 0,
      description: description.trim() || "",
      ownerId: ownerId.trim() || "",
      dueDate: dueDate || "",
    });
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Add phase">
      <div className={styles.smallModal}>
        <header className={styles.memberHeader}>
          <div>
            <div className={styles.memberTitle}>Add a phase</div>
            <div className={styles.memberSub}>Create a phase and optionally set weight, owner, and due date</div>
          </div>
          <button className={styles.ghostBtn} onClick={onCancel}>Close</button>
        </header>

        <div className={styles.memberBody}>
          <div className={styles.formRow}>
            <label className={styles.label}>Title</label>
            <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Design" />
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>Weight (%)</label>
            <input className={styles.input} type="number" min="0" max="100" value={weight} onChange={(e) => setWeight(e.target.value)} />
            <span className={styles.hint}>Weights do not auto-normalize; total should not exceed 100%.</span>
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>Description (optional)</label>
            <input className={styles.input} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add context" />
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>Owner (optional)</label>
            <input className={styles.input} value={ownerId} onChange={(e) => setOwnerId(e.target.value)} placeholder="userId or name" />
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>Due date (optional)</label>
            <input className={styles.input} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <footer className={styles.memberFooter}>
          <button className={styles["member-footer-ghost-btn"]} onClick={onCancel}>Cancel</button>
          <button className={styles["member-footer-primary-btn"]} onClick={submit} disabled={!canSave}>Create</button>
        </footer>
      </div>
    </div>
  );
}

/* ----------------------- Step 4: Review ------------------------ */
function StepReview({ kind, isClient, template, name, description, startDate, endDate }) {
  return (
    <div className={styles.review}>
      <h3 className={styles.sectionTitle}>Review & Confirm</h3>
      <div className={styles.reviewRow}><span>Type</span><strong>{kind === "terminal" ? "Terminal" : "Contiguous"}</strong></div>
      <div className={styles.reviewRow}><span>Client project</span><strong>{isClient ? "Yes" : "No"}</strong></div>
      <div className={styles.reviewRow}><span>Template</span><strong>{template || "Blank"}</strong></div>
      <div className={styles.reviewRow}><span>Name</span><strong>{name || "—"}</strong></div>
      <div className={styles.reviewRow}><span>Description</span><strong>{description || "—"}</strong></div>
      <div className={styles.reviewRow}><span>Start</span><strong>{startDate}</strong></div>
      <div className={styles.reviewRow}><span>End</span><strong>{endDate}</strong></div>
    </div>
  );
}

/* ---------------------- Add Members Modal ---------------------- */
function MemberRow({ user, picked, onAdd, onRemove, onRole }) {
  const sel = picked.find(p => p.userId === user.userId);
  return (
    <div className={styles.resultItem}>
      <img className={styles.avatar} src={user.picture} alt="" />
      <div className={styles.rMeta}>
        <div className={styles.rName}>{user.name}</div>
        <div className={styles.rHandle}>{user.email || user.userId}</div>
      </div>

      {!sel ? (
        <button type="button" className={styles.primaryBtn} onClick={onAdd}>Add</button>
      ) : (
        <div className={styles.inlineActions}>
          <select className={styles.roleSel} value={sel.role} onChange={(e) => onRole(e.target.value)}>
            <option>Viewer</option>
            <option>Editor</option>
            <option>Admin</option>
          </select>
          <button type="button" className={styles.pillX} onClick={onRemove}>✕</button>
        </div>
      )}
    </div>
  );
}

function AddMembersByIdsModal({ userIds = [], initialSelected = [], onClose, onSave }) {
  const [loading, setLoading] = useState(true);
  const [directory, setDirectory] = useState([]);   // [{ userId, name, picture, email? }]
  const [picked, setPicked] = useState(initialSelected); // [{ userId, name, picture, role }]
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchUser, setSearchUser] = useState(null);

  useEffect(() => {
    let live = true;
    async function load() {
      try {
        const rows = await Promise.all(
          userIds.map(async (id) => {
            try {
              const u = await getUserNameAndImageById(id);
              return { userId: id, name: u?.name || id.slice(-6), picture: u?.picture || "", email: u?.email };
            } catch {
              return { userId: id, name: id.slice(-6), picture: "" };
            }
          })
        );
        if (live) setDirectory(rows);
      } finally {
        if (live) setLoading(false);
      }
    }
    load();
    return () => { live = false; };
  }, [userIds]);

  async function fetchById(id) {
    if (!id) return;
    setSearching(true);
    try {
      const u = await getUserById(id);
      const out = { userId: u?._id || id, name: u?.name || id.slice(-6), picture: u?.picture || "", email: u?.email };
      setSearchUser(out);
    } catch {
      setSearchUser(null);
    } finally {
      setSearching(false);
    }
  }

  function addPick(u) {
    if (picked.find(p => p.userId === u.userId)) return;
    setPicked([...picked, { ...u, role: "Editor" }]);
  }
  function removePick(id) {
    setPicked(picked.filter(p => p.userId !== id));
  }
  function setRole(id, role) {
    setPicked(picked.map(p => p.userId === id ? { ...p, role } : p));
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Add members">
      <div className={styles.memberModal}>
        <header className={styles.memberHeader}>
          <div>
            <div className={styles.memberTitle}>Add members</div>
            <div className={styles.memberSub}>Pick users and set permissions inline</div>
          </div>
          <button className={styles.ghostBtn} onClick={onClose}>Close</button>
        </header>

        <div className={styles.memberBody}>
          <form
            className={styles.searchRow}
            onSubmit={(e) => { e.preventDefault(); fetchById(query.trim()); }}
          >
            <input
              className={styles.addInput}
              placeholder="Enter userId and press Enter"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className={styles.inviteBtn} type="submit" disabled={!query || searching}>
              {searching ? "Fetching…" : "Fetch user"}
            </button>
          </form>

          <div className={styles.resultsList}>
            {searchUser && (
              <MemberRow
                key={`search-${searchUser.userId}`}
                user={searchUser}
                picked={picked}
                onAdd={() => addPick(searchUser)}
                onRemove={() => removePick(searchUser.userId)}
                onRole={(r) => setRole(searchUser.userId, r)}
              />
            )}

            {loading ? (
              <div className={styles.muted}>Loading members…</div>
            ) : (
              directory.map(u => (
                <MemberRow
                  key={u.userId}
                  user={u}
                  picked={picked}
                  onAdd={() => addPick(u)}
                  onRemove={() => removePick(u.userId)}
                  onRole={(r) => setRole(u.userId, r)}
                />
              ))
            )}
          </div>
        </div>

        <footer className={styles.memberFooter}>
          <button className={styles["member-footer-ghost-btn"]} onClick={onClose}>Cancel</button>
          <button className={styles["member-footer-primary-btn"]} onClick={() => onSave(picked)} disabled={picked.length === 0}>
            Add to project
          </button>
        </footer>
      </div>
    </div>
  );
}
