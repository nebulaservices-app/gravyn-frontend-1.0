import React, { useState, useEffect, useRef } from "react";
import styles from "./ProjectCreationModalFlow.module.css";
import InfoTip from "../../InfoTip";
import { getFlagUrl, formatNumberForCountry, getCurrencyInfo } from "../../../utils/GeoUtility";
import notification from "../../../images/icons/notification_blue.svg"
import { formatAmountToWords } from "../../../utils/NumberToWords";
import close from "../../../images/icons/close.svg"
import dropdown  from "../../../images/icons/rightarrow.svg"
import copy  from "../../../images/icons/tasks.svg"


const currencyOptions = [
  { code: "INR", country: "IN" },
  { code: "USD", country: "US" },
  { code: "EUR", country: "EU" },
  { code: "GBP", country: "GB" },
  { code: "AED", country: "AE" },
  { code: "AUD", country: "AU" },
  { code: "CAD", country: "CA" },
];

const timezones = [
  "UTC",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
];

// Custom dropdown with flags
function CurrencyDropdown({ currency, setCurrency }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = currencyOptions.find((c) => c.code === currency);

  return (
    <div ref={dropdownRef} className={styles.customDropdown}>
      <div
        onClick={() => setOpen(!open)}
        className={styles.dropdownHeader}
      >
        {selected && (
          <div className={styles['currency-dropdown']}>
            <img
              src={getFlagUrl(selected.country)}
              alt={selected.country}
              width={24}
              height={18}
              className={styles.flagImg}
            />
            <p>{selected.code}</p>
          </div>
        )}
      </div>
      {open && (
        <div className={styles.dropdownList}>
          {currencyOptions.map(({ code, country }) => (
            <div
              key={code}
              className={`${styles.dropdownItem} ${
                code === currency ? styles.selectedItem : ""
              }`}
              onClick={() => {
                setCurrency(code);
                setOpen(false);
              }}
            >
              <img
                src={getFlagUrl(country)}
                alt={country}
                width={24}
                height={18}
                className={styles.flagImg}
              />
              <p>{code}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepClientConfig({
  clientInvolved,
  setClientInvolved,
  budget,
  setBudget,
  currency,
  setCurrency,
  inviteLinks,
  setInviteLinks,
  timezone,
  setTimezone,
  notes,
  setNotes,
  projectId
}) {
  const [isBudgetRequired, setBudgetRequired] = useState(false);
const [advancePaymentOption, setAdvancePaymentOption] = useState("");

  const [singleLinkMode, setSingleLinkMode] = useState(inviteLinks.length <= 1);
  // ... other states remain
// Generate invite URL
const generateInviteUrl = (projectId, role = "client", position = "project-representative") =>
  `https://localhost:7001/invite/${projectId}?role=${encodeURIComponent(role)}&position=${encodeURIComponent(position)}`;

// Toggle client involvement
const toggleClientInvolved = () => {
  setClientInvolved(prev => !prev);
};


// Generate or clear links based on projectId and clientInvolved
useEffect(() => {
  if (projectId && clientInvolved) {
    const link = generateInviteUrl(projectId);
    setInviteLinks([{
      label: "Default Project Invite Link",
      url: link,
      role: "Client",
      position: "Project Representative",
      customPosition: ""
    }]);
  } else {
    setInviteLinks([]);
  }
}, [clientInvolved]);


  const selectedCurrencyCountry =
    currencyOptions.find((c) => c.code === currency)?.country || "US";

  const handleBudgetChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue) || rawValue === "") {
      setBudget(rawValue);
    }
  };

  const formattedBudget = formatNumberForCountry(budget, selectedCurrencyCountry);

  return (
    <section className={styles["client-config-section"]}>
      <div className={styles["grid-header"]}>
        <p>
          Define client participation configure invitation links to onboard stakeholders
          effectively and budget details.
        </p>
      </div>
<section className={styles["modal-section"]}>
      <div className={styles["client-modal-step"]}>
        <div className={styles["modal-title"]}>
          <p>
            Will this project involve active client collaboration?{" "}
            <InfoTip text="A client-based project involves ongoing interaction with the client to help guide and approve deliverables." />
          </p>
                        <div
          onClick={toggleClientInvolved}
          className={`${styles["client-involment-toggle-wrapper"]} ${
            clientInvolved ? styles["active"] : ""
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") toggleClientInvolved();
          }}
          aria-pressed={clientInvolved}
          aria-label="Toggle client involvement"
        >
          <div className={styles["client-switch"]} />
        </div>
        </div>
      </div>


        {/* Show invite link if client is involved and link available */}
        {clientInvolved && inviteLinks.length > 0 && (
          <div className={styles["invite-link-display"]} style={{ marginTop: 8 }}>
            <p
            >{inviteLinks[0].url}</p>
          </div>
        )}
    </section>

<section className={styles["modal-section"]}>
  <div className={styles["client-modal-step"]}>
    <div className={styles["modal-title"]}>
      <p>
        Is budget involved in this project.{" "}
        <InfoTip text="Templates prefill structure and defaults. Everything remains editable." />
      </p>
    </div>
    <div
      onClick={() => setBudgetRequired(!isBudgetRequired)}
      className={`${styles["client-involment-toggle-wrapper"]} ${
        isBudgetRequired === true ? styles["active"] : ""
      }`}
    >
      <div className={styles["client-switch"]} />
    </div>
  </div>





  {isBudgetRequired && (
    <>
      <div
        className={styles["budget-input-wrapper"]}
        style={{ display: "flex", gap: "7px", alignItems: "center", marginTop: 12 }}
      >
        <CurrencyDropdown currency={currency} setCurrency={setCurrency} />

        <input
          id="budget"
          type="text"
          inputMode="decimal"
          placeholder="e.g., 2,50,000 or 250,000"
          onChange={handleBudgetChange}
          value={formattedBudget !==0 ? formattedBudget : ""}
          style={{ flexGrow: 1, padding: "6px 8px", fontSize: 16 }}
          required
        />
      </div>

      <AdvancePaymentSection budget={budget} currency={currency}/>

    </>
  )}

</section>


<section className={styles["modal-section"]}>
  <div className={styles["client-modal-step"]}>
    <div className={styles["modal-title"]}>
      <p>
        What is timezone for this project{" "}
        <InfoTip text="Templates prefill structure and defaults. Everything remains editable." />
      </p>
    </div>
    
  </div>
  
  </section>
    </section>
  );
}



export function ClientInvitePortal({universalLink , projectId}){
    return (
        <>
        <div className={styles['client-invite-overlay']}>
            <div className={styles['client-invite-portal-wrapper']}>
                <div className={styles['client-invite-portal-header']}>
                    <div className={styles['client-invite-portal-header-i']}>
                        <p>Add clients to project</p>
                        <p>Grant Secure Project Access for Effective Client Collaboration</p>
                    </div>
                    <div className={styles['client-invite-portal-header-i']}>
                      <img src={close}/>
                    </div>
                </div>
                <div className={styles['client-invite-portal-content']}>
                    <div className={styles['client-public-link-wrapper']}>
                      <div className={styles['client-public-link-header']}>
                        <div className={styles['client-public-link-header-i']}>
                          <p>Invite using open link</p>
                        </div>
                        <div className={styles['client-public-link-header-i']}>
                          <div className={styles['public-link-roles']}>
                            <p>Client</p>
                            <img src={dropdown}/>
                          </div>
                        </div>
                      </div>
                      <div className={styles['client-public-link']}>
                        <p>https://pm.gravyn.app/84320409123091241/invite/client?project-role="client"</p>
                        <button className={styles['client-public-copy-wrapper']}>
                          <img src={close} className={styles['copy-img']}/>
                        </button>
                      </div>
                    </div>

                    <div className={styles['client-portal-content-wrapper']}>
                      <div className={styles['client-portal-header']}>
                        <div className={styles['client-portal-header-i']}>
                        </div>
                        <div className={styles['client-portal-header-i']}>

                        </div>
                      </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}


function AdvancePaymentSection({ budget, currency }) {
  const [advanceChecked, setAdvanceChecked] = useState(false);
  let advancePercentage = 15;
  const [advanceTiming, setAdvanceTiming] = useState("immediately");
  const advanceAmount =
    budget && !isNaN(parseFloat(budget))
      ? (parseFloat(budget) * advancePercentage) / 100
      : 0;
const locale = currency === 'INR' ? 'en-IN' : 'en-US';

      const selected = currencyOptions.find((c) => c.code === currency);
      let currencyName = "";
if (selected) {
  const currencyInfo = getCurrencyInfo(selected.country); // pass country code string
  if (currencyInfo) {
    currencyName = currencyInfo.currencyName;
  }
}
const formattedAdvanceAmount = `${new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(advanceAmount)} ${currency}`;

    const [hovered, setHovered] = useState(false);




    const amountInWords = formatAmountToWords(advanceAmount , currency);


  return (
    <div className={styles['advance-payment-wrapper']} style={{ marginTop: 10 }}>
      <div className={styles['advance-checkbox']} style={{ cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={advanceChecked}
          onChange={(e) => setAdvanceChecked(e.target.checked)}
          style={{ marginRight: 8 }}
        />
        <p>Request advance payment</p>
      </div>

      {advanceChecked && (
        <div className={styles['advanced-meta']}>

            <div className={styles['adavnced-meta-i']}>
                <img src={notification}/>
                    <p>
      Gravyn will ping client for advance payment worth {"  "}
      <span
        style={{ position: "relative", cursor: "pointer", fontWeight: "bold" , marginLeft : 5 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
         {" "}{formattedAdvanceAmount}
        {hovered && (
          <div
          className={styles['hover-num-to-words']}
            style={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginBottom: 8,
              padding: "6px 12px",
              color: "white",
              whiteSpace: "nowrap",
              zIndex: 10,
              fontSize: 12,
            }}
          >
            {`${amountInWords} ${currencyName}`}
          </div>
        )}
      </span>
    </p>
            </div>

            <div className={styles['adavnced-meta-i']}>
                <TimingDropdown advanceTiming={advanceTiming} setAdvanceTiming={setAdvanceTiming}/>
            </div>
        </div>
      )}
    </div>
  );
}





const timingOptions = [
  { value: "immediately", label: "Upon Project Creation" },
  { value: "contract", label: "After Contract Signing" },
  { value: "milestone", label: "After First Phase Completion" },
];

function TimingDropdown({ advanceTiming, setAdvanceTiming }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = timingOptions.find(
    (opt) => opt.value === advanceTiming
  )?.label;

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(!open)}
        className={styles['advance-payment-select']}
      >
        <p>{selectedLabel || "Select timing..."}</p>
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: 4,
            marginTop: 2,
            zIndex: 1000,
            maxHeight: 150,
            overflowY: "auto",
          }}
        >
          {timingOptions.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                setAdvanceTiming(opt.value);
                setOpen(false);
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                backgroundColor:
                  opt.value === advanceTiming ? "#e6f7ff" : "transparent",
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StepClientConfig;


