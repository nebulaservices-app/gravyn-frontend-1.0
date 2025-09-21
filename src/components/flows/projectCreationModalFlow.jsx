import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import continuous from "../../images/graphics/continuous1.png";
import terminal from "../../images/graphics/terminal.png";
import styles from "./ProjectCreationModalFlow.module.css";
import info from "../../images/icons/info.svg";
import calendar from "../../images/icons/calendar.svg";
import Orbiez from "../ui/Orbiez"
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

function CalendarPopover({ anchor, onClose, onSelect, initial }) {
  const ref = useOutsideClose(onClose);
  if (!anchor) return null;

  // Keep in sync with CSS .calCard width/height
  const CAL_WIDTH = 0;
  const CAL_HEIGHT = 300;
  const GAP = 10;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const sx = window.scrollX;
  const sy = window.scrollY;

  // Center to chip horizontally, clamp to viewport edges
  let left = (anchor.left + (anchor.width / 2)) - (CAL_WIDTH / 2);
  left = Math.max(sx + 12, Math.min(left, sx + vw - CAL_WIDTH - 12));


  // alert(JSON.stringify(left + " " + anchor.left))

  // Choose below if there is more room or enough space, else above
  const spaceBelow = (sy + vh) - (anchor.top + anchor.height);
  const spaceAbove = (anchor.top) - sy;
  const placeBelow = spaceBelow >= CAL_HEIGHT + GAP || spaceBelow >= spaceAbove;

  const top = placeBelow
    ? anchor.top + anchor.height + GAP
    : anchor.top - CAL_HEIGHT - GAP;

  return (
    <div
      ref={ref}
      className={styles.calPopover}
      data-placement={placeBelow ? "bottom" : "top"}
      style={{ position: "absolute", top, left, zIndex: 9999 }}
    >
      <MiniCalendar initial={initial} onSelect={(iso) => { onSelect(iso); onClose(); }} />
    </div>
  );
}

function MiniCalendar({ initial, onSelect }) {
  const init = initial ? new Date(initial) : new Date();
  const [view, setView] = useState(new Date(init.getFullYear(), init.getMonth(), 1));

  const monthName = view.toLocaleString(undefined, { month: "long", year: "numeric" });
  const startWeekday = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1));
  const next = () => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1));

  const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className={styles.calCard}>
      <div className={styles.calHeader}>
        <button type="button" className={styles.calNav} onClick={prev}>‹</button>
        <div className={styles.calTitle}>{monthName}</div>
        <button type="button" className={styles.calNav} onClick={next}>›</button>
      </div>

      <div className={styles.calWeek}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <div key={d} className={styles.calDow}>{d}</div>)}
      </div>

      <div className={styles.calGrid}>
        {cells.map((d, i) => d
          ? <button key={i} type="button" className={styles.calCell} onClick={() => onSelect(iso(view.getFullYear(), view.getMonth(), d))}>{d}</button>
          : <div key={i} className={styles.calCellEmpty} />
        )}
      </div>
    </div>
  );
}

/* ----------------------- Stepper ------------------------- */

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

/* ------------------------ Data -------------------------- */

const TEMPLATE_CARDS = {
  terminal: [
    { key: "product_launch", title: "Product Launch", subtitle: "Plan / Build / Release" },
    { key: "client_website", title: "Client Website", subtitle: "Kickoff / Discovery / Design / Dev / UAT" },
    { key: "design_sprint", title: "Design Sprint", subtitle: "1‑week sprint • Review gate" },
  ],
  contiguous: [
    { key: "maintenance_ops", title: "Maintenance Ops", subtitle: "Reliability • Uptime • MTTR" },
    { key: "support_retainer", title: "Support Retainer", subtitle: "SLA Response/Resolution" },
    { key: "growth_loop", title: "Growth Loop", subtitle: "Monthly experiments" },
  ],
};

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

  // Calendar state at overlay level
  const [cal, setCal] = useState(null); // { target, initial, anchor:{top,left,width,height} }

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
    };
    onCreate?.(payload);
    onClose?.();
  };

  function openCalendar(next) { setCal(next); }
  function closeCalendar() { setCal(null); }
  function handleSelect(iso) {
    if (!cal) return;
    if (cal.target === "start") setStartDate(iso);
    else setEndDate(iso);
    closeCalendar();
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="pcm_title">
      {/* Calendar lives under overlay to use viewport coords */}
      <CalendarPopover anchor={cal?.anchor} initial={cal?.initial} onClose={closeCalendar} onSelect={handleSelect} />
      {/* <Orbiez/> */}
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
                <StepTemplates kind={kind} template={template} setTemplate={setTemplate} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="structure" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
                <StepStructure kind={kind} />
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

  function openCal(target, e) {
    const anchor = getViewportAnchorRect(e.currentTarget);
    onOpenCalendar?.({
      target,
      initial: target === "start" ? startDate : endDate,
      anchor
    });
  }

  return (
    <div className={styles.grid}>
      <section className={styles["modal-section"]}>
        <div className={styles["modal-title"]}>
          <p>
            Provide project details{" "}
            <InfoTip text="Accurate name, description, and dates are critical—Gravyn’s project‑management AI relies on them to analyze timelines, flag risks, and produce sharper status insights and forecasts." />
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
            <div className={styles.dateChipWrap} onClick={(e) => openCal("start", e)}>
              <span className={styles.dateIcon} aria-hidden="true"><img src={calendar} alt="" /></span>
              <span className={styles.dateChipText}>{startDate ? formatPrettyDate(startDate) : "Start date"}</span>
            </div>

            <div className={styles.dateArrowWrap}><span className={styles.dateArrow} aria-hidden="true">→</span></div>

            <div
              className={styles.dateChipWrap}
              onClick={(e) => !isContiguous && openCal("end", e)}
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
            <InfoTip text="Terminal ends at delivery; Contiguous runs continuously with streams and KPIs. This choice shapes setup and reporting." />
          </p>
        </div>

        <div className={styles["modal-content-wrapper"]}>
          <div
            className={`${styles["entity-type-wrapper"]} ${isContiguous ? styles.selected : ""}`}
            onClick={() => setKind("contiguous")}
            role="button"
            tabIndex={0}
          >
            <div className={`${styles["image-wrapper"]} ${styles["modal-content-wrapper-i"]}`}>
              <img src={continuous} alt="Contiguous project" />
            </div>
            <p>Contiguous Project</p>
          </div>

          <div
            className={`${styles["entity-type-wrapper"]} ${!isContiguous ? styles.selected : ""}`}
            onClick={() => setKind("terminal")}
            role="button"
            tabIndex={0}
          >
            <div className={`${styles["image-wrapper"]} ${styles["modal-content-wrapper-i"]}`}>
              <img src={terminal} alt="Terminal project" />
            </div>
            <p>Terminal Project</p>
          </div>
        </div>
      </section>

      <section className={styles["modal-section"]}>
        <div className={styles.inlineRow}>
          <label className={styles.toggle}>
            <input type="checkbox" checked={isClient} onChange={(e) => setIsClient(e.target.checked)} />
            <span>Client project (approvals, milestones, portal)</span>
          </label>
        </div>
      </section>
    </div>
  );
}

/* ---------------------- Step 2: Templates ---------------------- */

function StepTemplates({ kind, template, setTemplate }) {
  const templates = TEMPLATE_CARDS[kind];
  return (
    <div className={styles.grid}>
      <section className={styles["modal-section"]}>
        <div className={styles["modal-title"]}>
          <p>
            Start from a template{" "}
            <InfoTip text="Templates prefill phases/streams and defaults. Everything stays editable after selection." />
          </p>
        </div>

        <div className={styles.templateGrid}>
          {templates.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`${styles.templateCard} ${template === t.key ? styles.selected : ""}`}
              onClick={() => setTemplate(t.key)}
            >
              <div className={styles.templateThumb}><div className={styles.sparkline} /></div>
              <div className={styles.templateMeta}>
                <div className={styles.templateTitle}>{t.title}</div>
                <div className={styles.templateSubtitle}>{t.subtitle}</div>
              </div>
            </button>
          ))}

          <button
            type="button"
            className={`${styles.templateCard} ${template === "" ? styles.selected : ""}`}
            onClick={() => setTemplate("")}
          >
            <div className={styles.templateThumb}><div className={styles.blankIcon}>＋</div></div>
            <div className={styles.templateMeta}>
              <div className={styles.templateTitle}>Start blank</div>
              <div className={styles.templateSubtitle}>Add goals, milestones, and tasks later</div>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}

/* ---------------------- Step 3: Structure ---------------------- */

function StepStructure({ kind }) {
  return (
    <div className={styles.formGrid}>
      <h3 className={styles.sectionTitle}>
        {kind === "terminal" ? "Phases (weights must total 100%)" : "Streams (cadence and KPIs)"}
      </h3>
      <div className={styles.phasePlaceholder}>
        {kind === "terminal" ? (
          <>
            <div className={styles.phaseRow}><div className={styles.pill}>Plan</div><div className={styles.pillMuted}>Weight: 20%</div></div>
            <div className={styles.phaseRow}><div className={styles.pill}>Build</div><div className={styles.pillMuted}>Weight: 60%</div></div>
            <div className={styles.phaseRow}><div className={styles.pill}>Release</div><div className={styles.pillMuted}>Weight: 20%</div></div>
          </>
        ) : (
          <>
            <div className={styles.phaseRow}><div className={styles.pill}>Maintenance</div><div className={styles.pillMuted}>Cadence: Monthly</div></div>
            <div className={styles.phaseRow}><div className={styles.pill}>Reliability</div><div className={styles.pillMuted}>Cadence: Weekly</div></div>
          </>
        )}
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
