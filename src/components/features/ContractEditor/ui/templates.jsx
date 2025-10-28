import { v4 as uuidv4 } from "uuid";
const uid = (p="") => p + uuidv4().slice(0,8);

export const CLAUSES = {
  intro: {
    title: "Introduction",
    body: "This Agreement is entered into between {{ClientName}} and {{VendorName}} effective {{EffectiveDate}}.",
  },
  confidentiality: {
    title: "Confidentiality",
    body: "Both parties agree to keep Confidential Information private, excluding info that is public or independently developed.",
  },
  payment: {
    title: "Payment Terms",
    body: "Fees: {{Currency}} {{FeeAmount}} payable within {{NetDays}} days of invoice.",
  },
  termination: {
    title: "Termination",
    body: "Either party may terminate with {{NoticeDays}} days notice for convenience.",
  },
};

export const VARIABLES_SCHEMA = [
  { key: "ClientName", label: "Client Name", type: "text" },
  { key: "VendorName", label: "Vendor Name", type: "text" },
  { key: "EffectiveDate", label: "Effective Date", type: "date" },
  { key: "Currency", label: "Currency", type: "text", default: "USD" },
  { key: "FeeAmount", label: "Fee Amount", type: "number" },
  { key: "NetDays", label: "Net Terms (days)", type: "number", default: 15 },
  { key: "NoticeDays", label: "Notice (days)", type: "number", default: 30 },
];

export const makeClauseBlocks = (x,y, title, body) => ([
  { id: uid("h"), type: "text", content: title, x, y, width: 600, height: 40, fontSize: 22, color:"#111", padding:6, borderRadius:4, editable:true, alignContent:"left", backgroundColor:"transparent", opacity:1 },
  { id: uid("p"), type: "paragraph", content: body, x, y: y+46, width: 650, height: 200, fontSize: 16, color:"#333", padding:8, borderRadius:4, editable:true, alignContent:"justify", backgroundColor:"transparent", opacity:1 },
]);

export const TEMPLATES = {
  professionalLetterhead: (logoSrc) => ([
    { id: uid("logo"), type:"image", src: logoSrc || "https://placehold.co/180x60", x: 90, y: 40, width: 180, height: 60, editable:false, padding:0, borderRadius:4, backgroundColor:"transparent", opacity:1 },
    { id: uid("h"), type:"text", content:"Board Resolution", x: 90, y: 125, width: 600, height: 50, fontSize: 28, color:"#111", padding:6, borderRadius:4, editable:true, alignContent:"left", opacity:1, backgroundColor:"transparent" },
  ]),
  msa: (vars) => ([
    ...makeClauseBlocks(90, 200, "Master Services Agreement", `Between {{ClientName}} and {{VendorName}} effective {{EffectiveDate}}.`),
    ...makeClauseBlocks(90, 340, "Scope of Services", "Vendor will provide services per SOW(s)."),
    ...makeClauseBlocks(90, 500, "Fees and Payment", "Fees: {{Currency}} {{FeeAmount}} within {{NetDays}} days."),
    ...makeClauseBlocks(90, 680, "Termination", "Either party may terminate with {{NoticeDays}} days notice."),
  ]),
};

export const initialPages = [
  {
    id: "page1",
    name: "Page 1",
    width: 850,
    height: 1500,
    margin: { top: 80, right: 80, bottom: 100, left: 80 },
    header: { enabled: true, height: 70 },
    footer: { enabled: false, height: 70 },
    backgroundColor: "#fff",
    borderRadius: 10,
    borderColor: "#e3e7ff",
    borderWidth: 1,
    blocks: [
      { id: uid("t"), type: "text", content: "Contract Title Page 1", x: 120, y: 40, width: 600, height: 60, fontSize: 28, color:"#222", backgroundColor:"transparent", padding:8, borderRadius:5, editable:true, alignContent:"left", opacity:1 },
      { id: uid("p"), type: "paragraph", content: "This is the first page of the contract.", x: 120, y: 120, width: 600, height: 130, fontSize: 16, color:"#444", backgroundColor:"transparent", padding:8, borderRadius:5, editable:true, alignContent:"justify", opacity:1 },
    ],
  },
];
