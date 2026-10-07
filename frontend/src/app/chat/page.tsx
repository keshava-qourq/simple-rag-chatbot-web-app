"use client";
// Generated screens hold state and handle events, which a server component
// cannot do. Next.js renders on the server unless a module says otherwise.

/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const { Label } = UI;
const { Plus, Search, X, ChevronRight, Menu, FileText, Clock, Trash, Edit, Download, ArrowRight, AlertCircle } = Icons;

const PANEL = '#141920';
const PANEL_SOFT = '#1A212A';
const BORDER = '#242C36';
const TEXT = '#E7ECF3';
const MUTED = '#8B94A3';
const ACCENT = '#4C8DFF';
const WARN = '#F2B544';
const DANGER = '#B3332F';

const FOCUS =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8DFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1216]';

const LIBRARY = { total: 42, ready: 39, processing: 2, failed: 1 };

const INITIAL_THREADS = [
  {
    id: 'thr_8f21',
    title: 'Contractor notice periods',
    last_activity_label: 'Today 09:42',
    created_label: '7 Oct 2026',
    messages: [
      {
        id: 'm_8f21_1',
        role: 'user',
        content: 'What notice period applies to contractors on rolling monthly agreements?',
        at: '09:38',
      },
      {
        id: 'm_8f21_2',
        role: 'assistant',
        at: '09:38',
        content:
          'Contractors on rolling monthly agreements receive fifteen working days of written notice, and the notice has to be issued by the engaging manager rather than by Finance [1]. Once an engagement has run continuously for more than twelve months that period rises to thirty working days [2]. The uploaded documents do not set out a separate notice period for fixed-term statements of work, so that part of the question is not covered.',
        citations: [
          {
            n: 1,
            document_id: 'doc_17',
            document_name_snapshot: 'Contractor-Agreement-Template-2026.docx',
            location: 'Section 7.2, page 4',
            passage_text:
              'Either party may terminate a rolling monthly engagement by giving fifteen (15) working days written notice. Notice shall be issued by the engaging manager and copied to People Operations.',
            removed: false,
          },
          {
            n: 2,
            document_id: 'doc_04',
            document_name_snapshot: 'Employee-Handbook-v4.pdf',
            location: 'Page 31, "Ending an engagement"',
            passage_text:
              'Where a contractor has been engaged continuously for more than twelve months, the notice period rises to thirty (30) working days for both parties.',
            removed: false,
          },
        ],
      },
      { id: 'm_8f21_3', role: 'user', content: 'And if we end it for cause?', at: '09:41' },
      {
        id: 'm_8f21_4',
        role: 'assistant',
        at: '09:42',
        content:
          'Termination for cause takes effect immediately and no notice period applies, but the reason must be set out in writing within two working days [1]. Payment runs to the termination date only, with no payment in lieu of notice [2].',
        citations: [
          {
            n: 1,
            document_id: 'doc_17',
            document_name_snapshot: 'Contractor-Agreement-Template-2026.docx',
            location: 'Section 7.5, page 5',
            passage_text:
              'Termination for cause is effective immediately on notification. The terminating party shall set out the grounds in writing within two (2) working days.',
            removed: false,
          },
          {
            n: 2,
            document_id: 'doc_04',
            document_name_snapshot: 'Employee-Handbook-v4.pdf',
            location: 'Page 32, "Final payment"',
            passage_text:
              'Fees are payable up to and including the termination date. No payment in lieu of notice is made where an engagement ends for cause.',
            removed: false,
          },
        ],
      },
    ],
  },
  {
    id: 'thr_7c40',
    title: 'What changed in the retention policy',
    last_activity_label: 'Yesterday 17:05',
    created_label: '6 Oct 2026',
    messages: [
      {
        id: 'm_7c40_1',
        role: 'user',
        content: 'What changed in the data retention policy this quarter?',
        at: '17:02',
      },
      {
        id: 'm_7c40_2',
        role: 'assistant',
        at: '17:05',
        content:
          'Two things changed. Support tickets now carry a twenty-four month retention window instead of thirty-six [1], and exported CSV reports are removed from object storage after seven days rather than being kept indefinitely [2]. The second point comes from a document that has since been deleted from the library, so that passage can no longer be opened.',
        citations: [
          {
            n: 1,
            document_id: 'doc_22',
            document_name_snapshot: 'Data-Retention-Policy-v3.txt',
            location: 'Lines 48 to 61',
            passage_text:
              'Support tickets and their attachments are retained for twenty-four (24) months from the date of closure, reduced from thirty-six (36) months with effect from 1 September 2026.',
            removed: false,
          },
          {
            n: 2,
            document_id: 'doc_09',
            document_name_snapshot: 'Ops-Change-Log-Sept.md',
            location: 'Heading "Storage", bullet 3',
            passage_text: '',
            removed: true,
          },
        ],
      },
    ],
  },
  {
    id: 'thr_6b11',
    title: 'Acme vendor security review findings',
    last_activity_label: '6 Oct, 11:20',
    created_label: '6 Oct 2026',
    messages: [
      {
        id: 'm_6b11_1',
        role: 'user',
        content: 'Summarise the open findings from the Acme security review.',
        at: '11:18',
      },
      {
        id: 'm_6b11_2',
        role: 'assistant',
        at: '11:20',
        content:
          'Three findings are still open. Acme has no documented key rotation schedule for the shared bucket, and their subprocessor list was last updated in March 2025 [1]. Penetration test evidence was supplied as a summary letter rather than the full report [2]. Neither document gives remediation dates.',
        citations: [
          {
            n: 1,
            document_id: 'doc_31',
            document_name_snapshot: 'Vendor-Security-Review-Acme.docx',
            location: 'Findings table, page 9',
            passage_text:
              'F-02 No documented key rotation schedule for the shared object storage bucket. F-03 Subprocessor list last reviewed 14 March 2025; no evidence of annual review.',
            removed: false,
          },
          {
            n: 2,
            document_id: 'doc_33',
            document_name_snapshot: 'Acme-Pentest-Summary-2026.pdf',
            location: 'Page 2, paragraph 3',
            passage_text:
              'This letter summarises the testing performed. The full technical report is available to Acme customers on request and is not included here.',
            removed: false,
          },
        ],
      },
    ],
  },
  {
    id: 'thr_5a02',
    title: 'Q3 revenue split by region',
    last_activity_label: '3 Oct, 16:48',
    created_label: '3 Oct 2026',
    messages: [
      { id: 'm_5a02_1', role: 'user', content: 'How did Q3 revenue split across regions?', at: '16:45' },
      {
        id: 'm_5a02_2',
        role: 'assistant',
        at: '16:48',
        content:
          'Q3 closed at 4.18m, split 52 percent EMEA, 31 percent North America and 17 percent APAC [1]. EMEA growth came mainly from two public sector renewals signed in August [2]. The board pack does not break APAC down by country, so that detail is not in the documents.',
        citations: [
          {
            n: 1,
            document_id: 'doc_02',
            document_name_snapshot: 'Q3-2026-Board-Pack.pdf',
            location: 'Page 6, revenue by region',
            passage_text:
              'Total recognised revenue for Q3 2026 was 4.18m (EMEA 2.17m / 52%, North America 1.30m / 31%, APAC 0.71m / 17%).',
            removed: false,
          },
          {
            n: 2,
            document_id: 'doc_05',
            document_name_snapshot: 'Sales-Commentary-Q3.docx',
            location: 'Section 2, "EMEA"',
            passage_text:
              'Two public sector renewals closed in August and account for roughly three quarters of the EMEA increase over Q2.',
            removed: false,
          },
        ],
      },
    ],
  },
  {
    id: 'thr_4d93',
    title: 'Sabbatical eligibility',
    last_activity_label: '2 Oct, 10:12',
    created_label: '2 Oct 2026',
    messages: [
      {
        id: 'm_4d93_1',
        role: 'user',
        content: 'Does the handbook say anything about sabbatical eligibility after five years?',
        at: '10:11',
      },
      {
        id: 'm_4d93_2',
        role: 'assistant',
        at: '10:12',
        notFound: true,
        content:
          'I could not find an answer to that in the uploaded documents. Nothing in the shared library covers sabbaticals or long service leave, so there is nothing to cite and I am not going to answer from general knowledge. If a policy exists, add it to the library and ask again.',
        citations: [],
      },
    ],
  },
  {
    id: 'thr_3e58',
    title: 'Postmortem action owners',
    last_activity_label: '30 Sep, 15:33',
    created_label: '30 Sep 2026',
    messages: [
      {
        id: 'm_3e58_1',
        role: 'user',
        content: 'Who owns the follow-up actions from the 14 August incident?',
        at: '15:32',
      },
      {
        id: 'm_3e58_2',
        role: 'assistant',
        at: '15:33',
        incomplete: true,
        content:
          'Three actions were assigned. The alerting gap on the ingest worker is owned by Priya Raman with a due date of 5 September [1], the runbook update is owned by',
        citations: [
          {
            n: 1,
            document_id: 'doc_12',
            document_name_snapshot: 'Incident-Postmortem-2026-08-14.md',
            location: 'Action table, row 1',
            passage_text:
              '| A-1 | Add alerting on ingest worker queue depth | Priya Raman | 2026-09-05 | Open |',
            removed: false,
          },
        ],
      },
      {
        id: 'm_3e58_3',
        role: 'error',
        at: '15:33',
        content: 'The connection dropped while the answer was streaming. The partial answer above has been kept.',
        question: 'Who owns the follow-up actions from the 14 August incident?',
      },
    ],
  },
];

const KNOWLEDGE = [
  {
    keys: ['retention', 'retain', 'purge', 'delete after', 'how long do we keep'],
    content:
      'Retention is set per data type. Support tickets are kept for twenty-four months from closure and exported reports for seven days [1]. Chat transcripts and uploaded documents have no automatic expiry and stay until someone deletes them [2].',
    citations: [
      {
        n: 1,
        document_id: 'doc_22',
        document_name_snapshot: 'Data-Retention-Policy-v3.txt',
        location: 'Lines 48 to 61',
        passage_text:
          'Support tickets and their attachments are retained for twenty-four (24) months from the date of closure. Exported CSV reports are deleted from object storage seven (7) days after generation.',
        removed: false,
      },
      {
        n: 2,
        document_id: 'doc_23',
        document_name_snapshot: 'Internal-Tooling-Standards.md',
        location: 'Section "Data lifecycle"',
        passage_text:
          'Internal knowledge tools have no automatic deletion. Content persists until a team member removes it manually.',
        removed: false,
      },
    ],
  },
  {
    keys: ['acme', 'vendor', 'security review', 'pentest', 'penetration', 'subprocessor'],
    content:
      'The Acme review has three open findings: no documented key rotation schedule, a subprocessor list last reviewed in March 2025 [1], and pentest evidence supplied only as a summary letter [2]. No remediation dates were agreed in either document.',
    citations: [
      {
        n: 1,
        document_id: 'doc_31',
        document_name_snapshot: 'Vendor-Security-Review-Acme.docx',
        location: 'Findings table, page 9',
        passage_text:
          'F-02 No documented key rotation schedule for the shared object storage bucket. F-03 Subprocessor list last reviewed 14 March 2025.',
        removed: false,
      },
      {
        n: 2,
        document_id: 'doc_33',
        document_name_snapshot: 'Acme-Pentest-Summary-2026.pdf',
        location: 'Page 2, paragraph 3',
        passage_text:
          'This letter summarises the testing performed. The full technical report is available on request and is not included here.',
        removed: false,
      },
    ],
  },
  {
    keys: ['notice', 'contractor', 'terminate', 'termination', 'leaving'],
    content:
      'Rolling monthly contractor engagements end on fifteen working days of written notice, rising to thirty working days after twelve continuous months [1]. Termination for cause is immediate, with the grounds given in writing within two working days [2].',
    citations: [
      {
        n: 1,
        document_id: 'doc_04',
        document_name_snapshot: 'Employee-Handbook-v4.pdf',
        location: 'Page 31, "Ending an engagement"',
        passage_text:
          'Where a contractor has been engaged continuously for more than twelve months, the notice period rises to thirty (30) working days for both parties.',
        removed: false,
      },
      {
        n: 2,
        document_id: 'doc_17',
        document_name_snapshot: 'Contractor-Agreement-Template-2026.docx',
        location: 'Section 7.5, page 5',
        passage_text:
          'Termination for cause is effective immediately on notification. The terminating party shall set out the grounds in writing within two (2) working days.',
        removed: false,
      },
    ],
  },
  {
    keys: ['revenue', 'q3', 'region', 'board', 'arr', 'growth', 'emea'],
    content:
      'Q3 2026 revenue was 4.18m: EMEA 52 percent, North America 31 percent, APAC 17 percent [1]. Most of the EMEA increase came from two public sector renewals signed in August [2]. The documents do not break APAC down by country.',
    citations: [
      {
        n: 1,
        document_id: 'doc_02',
        document_name_snapshot: 'Q3-2026-Board-Pack.pdf',
        location: 'Page 6, revenue by region',
        passage_text:
          'Total recognised revenue for Q3 2026 was 4.18m (EMEA 2.17m / 52%, North America 1.30m / 31%, APAC 0.71m / 17%).',
        removed: false,
      },
      {
        n: 2,
        document_id: 'doc_05',
        document_name_snapshot: 'Sales-Commentary-Q3.docx',
        location: 'Section 2, "EMEA"',
        passage_text:
          'Two public sector renewals closed in August and account for roughly three quarters of the EMEA increase over Q2.',
        removed: false,
      },
    ],
  },
  {
    keys: ['incident', 'postmortem', 'outage', 'alerting', 'action'],
    content:
      'The 14 August postmortem assigned three actions: alerting on ingest worker queue depth to Priya Raman by 5 September, the runbook rewrite to Tom Okafor by 12 September, and a load test of the embedding queue to Dana Whitfield with no date set [1]. All three were still open when the document was uploaded.',
    citations: [
      {
        n: 1,
        document_id: 'doc_12',
        document_name_snapshot: 'Incident-Postmortem-2026-08-14.md',
        location: 'Action table, rows 1 to 3',
        passage_text:
          '| A-1 | Add alerting on ingest worker queue depth | Priya Raman | 2026-09-05 | Open |\n| A-2 | Rewrite ingest runbook | Tom Okafor | 2026-09-12 | Open |\n| A-3 | Load test embedding queue | Dana Whitfield | TBC | Open |',
        removed: false,
      },
    ],
  },
  {
    keys: ['onboarding', 'laptop', 'new starter', 'new hire', 'first day'],
    content:
      'New starters are issued a laptop from the pooled stock on day one and get library access through the shared link, with no account to create [1]. The runbook asks the buddy to walk through the document library in week one [2].',
    citations: [
      {
        n: 1,
        document_id: 'doc_41',
        document_name_snapshot: 'Onboarding-Runbook.md',
        location: 'Section "Day one"',
        passage_text:
          'Issue a laptop from pooled stock and send the internal tool links. None of the internal tools require an account.',
        removed: false,
      },
      {
        n: 2,
        document_id: 'doc_41',
        document_name_snapshot: 'Onboarding-Runbook.md',
        location: 'Section "Week one"',
        passage_text: 'The buddy walks the new starter through the shared document library and the chat tool.',
        removed: false,
      },
    ],
  },
];

const NOT_FOUND =
  'I could not find an answer to that in the uploaded documents. Nothing retrieved from the shared library was relevant, so there is nothing to cite and I will not answer from general knowledge. If the material exists, upload it to the library and ask again.';

const SUGGESTIONS = [
  'What changed in the data retention policy this quarter?',
  'Summarise the open findings from the Acme security review.',
  'Who owns the follow-up actions from the 14 August incident?',
];

const DRAFT = '__draft__';

export default function Screen() {
  const navigate = useNavigate();
  const [threads, setThreads] = React.useState(INITIAL_THREADS);
  const [activeId, setActiveId] = React.useState(INITIAL_THREADS[0].id);
  const [query, setQuery] = React.useState('');
  const [input, setInput] = React.useState('');
  const [stream, setStream] = React.useState(null);
  const [citation, setCitation] = React.useState(null);
  const [editing, setEditing] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState('');
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [railOpen, setRailOpen] = React.useState(false);
  const [toast, setToast] = React.useState('');

  const searchRef = React.useRef(null);
  const composerRef = React.useRef(null);
  const scrollRef = React.useRef(null);
  const confirmRef = React.useRef(null);
  const deleteTriggerRef = React.useRef(null);
  const titleRef = React.useRef(null);

  const activeThread = threads.find((t) => t.id === activeId) || null;
  const isDraft = activeId === DRAFT;
  const messages = activeThread ? activeThread.messages : [];

  const filtered = threads.filter((t) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    if (t.title.toLowerCase().includes(q)) return true;
    return t.messages.some((m) => (m.content || '').toLowerCase().includes(q));
  });

  /* ---------- streaming ---------- */
  React.useEffect(() => {
    if (!stream) return undefined;
    if (stream.retrieving) {
      const t = window.setTimeout(() => setStream((s) => (s ? { ...s, retrieving: false } : s)), 750);
      return () => window.clearTimeout(t);
    }
    if (stream.idx >= stream.words.length) {
      setThreads((prev) =>
        prev.map((th) =>
          th.id === stream.threadId
            ? {
                ...th,
                messages: th.messages.map((m) =>
                  m.id === stream.messageId
                    ? { ...m, streaming: false, citations: stream.citations, notFound: stream.citations.length === 0 }
                    : m
                ),
              }
            : th
        )
      );
      setToast(
        stream.citations.length === 0
          ? 'Answer complete. No citations: nothing relevant was found in the library.'
          : 'Answer complete with ' + stream.citations.length + ' citation(s).'
      );
      setStream(null);
      return undefined;
    }
    const t = window.setTimeout(() => {
      const next = Math.min(stream.idx + 2, stream.words.length);
      const partial = stream.words.slice(0, next).join(' ');
      setThreads((prev) =>
        prev.map((th) =>
          th.id === stream.threadId
            ? { ...th, messages: th.messages.map((m) => (m.id === stream.messageId ? { ...m, content: partial } : m)) }
            : th
        )
      );
      setStream((s) => (s ? { ...s, idx: next } : s));
    }, 45);
    return () => window.clearTimeout(t);
  }, [stream]);

  /* ---------- keyboard shortcuts ---------- */
  React.useEffect(() => {
    const onKey = (e) => {
      const tag = e.target && e.target.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA';
      if (e.key === '/' && !typing) {
        e.preventDefault();
        setRailOpen(true);
        if (searchRef.current) searchRef.current.focus();
      }
      if (e.key === 'Escape') {
        setCitation(null);
        setConfirmOpen(false);
        setEditing(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const msgCount = messages.length;
  const streamIdx = stream ? stream.idx : -1;
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeId, msgCount, streamIdx]);

  React.useEffect(() => {
    if (confirmOpen && confirmRef.current) confirmRef.current.focus();
  }, [confirmOpen]);

  React.useEffect(() => {
    if (editing && titleRef.current) titleRef.current.focus();
  }, [editing]);

  /* ---------- helpers ---------- */
  const uid = (p) => p + '_' + Math.random().toString(36).slice(2, 8);

  const answerFor = (q) => {
    const lower = q.toLowerCase();
    const hit = KNOWLEDGE.find((k) => k.keys.some((key) => lower.includes(key)));
    if (!hit) return { content: NOT_FOUND, citations: [] };
    return { content: hit.content, citations: hit.citations };
  };

  const autoTitle = (q) => {
    const clean = q.replace(/\s+/g, ' ').replace(/[?.!]+$/, '').trim();
    const short = clean.length > 46 ? clean.slice(0, 46).trim() + '…' : clean;
    return short.charAt(0).toUpperCase() + short.slice(1);
  };

  const askQuestion = (question, targetThreadId, dropMessageId) => {
    const text = question.trim();
    if (!text || stream) return;
    const { content, citations } = answerFor(text);
    const userMsg = { id: uid('m'), role: 'user', content: text, at: 'now' };
    const botMsg = { id: uid('m'), role: 'assistant', content: '', at: 'now', streaming: true, citations: [] };

    if (targetThreadId === DRAFT) {
      const newId = uid('thr');
      const newThread = {
        id: newId,
        title: autoTitle(text),
        last_activity_label: 'Today, just now',
        created_label: '7 Oct 2026',
        messages: [userMsg, botMsg],
      };
      setThreads((prev) => [newThread, ...prev]);
      setActiveId(newId);
      setStream({ threadId: newId, messageId: botMsg.id, words: content.split(' '), idx: 0, citations, retrieving: true });
    } else {
      setThreads((prev) => {
        const target = prev.find((t) => t.id === targetThreadId);
        if (!target) return prev;
        const kept = target.messages.filter((m) => m.id !== dropMessageId);
        const updated = {
          ...target,
          last_activity_label: 'Today, just now',
          messages: [...kept, userMsg, botMsg],
        };
        return [updated, ...prev.filter((t) => t.id !== targetThreadId)];
      });
      setStream({
        threadId: targetThreadId,
        messageId: botMsg.id,
        words: content.split(' '),
        idx: 0,
        citations,
        retrieving: true,
      });
    }
    setToast('Question sent. Searching the shared library.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    askQuestion(input, activeId, null);
    setInput('');
  };

  const startNewChat = () => {
    setActiveId(DRAFT);
    setCitation(null);
    setEditing(false);
    setInput('');
    setRailOpen(false);
    if (composerRef.current) composerRef.current.focus();
  };

  const openThread = (id) => {
    setActiveId(id);
    setCitation(null);
    setEditing(false);
    setRailOpen(false);
  };

  const saveTitle = (e) => {
    e.preventDefault();
    const next = titleDraft.trim();
    if (!next) return;
    setThreads((prev) => prev.map((t) => (t.id === activeId ? { ...t, title: next } : t)));
    setEditing(false);
    setToast('Thread renamed to ' + next + '.');
  };

  const deleteThread = () => {
    const remaining = threads.filter((t) => t.id !== activeId);
    setThreads(remaining);
    setActiveId(remaining.length ? remaining[0].id : DRAFT);
    setConfirmOpen(false);
    setCitation(null);
    setToast('Thread deleted for the whole workspace.');
  };

  const renderContent = (text, citations) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      const m = part.match(/^\[(\d+)\]$/);
      const c = m && (citations || []).find((x) => x.n === Number(m[1]));
      if (!c) return <React.Fragment key={i}>{part}</React.Fragment>;
      if (c.removed) {
        return (
          <span
            key={i}
            className="mx-0.5 rounded border px-1 text-[11px] line-through"
            style={{ borderColor: '#4A3B2A', color: WARN }}
          >
            [{c.n}]<span className="sr-only"> citation to removed document {c.document_name_snapshot}</span>
          </span>
        );
      }
      return (
        <button
          key={i}
          type="button"
          onClick={() => setCitation(c)}
          aria-label={'Show citation ' + c.n + ' from ' + c.document_name_snapshot}
          className={'mx-0.5 rounded border px-1 text-[11px] font-medium align-baseline hover:bg-[#1B2533] ' + FOCUS}
          style={{ borderColor: 'rgba(76,141,255,0.45)', color: ACCENT }}
        >
          [{c.n}]
        </button>
      );
    });
  };

  const panelStyle = { backgroundColor: PANEL, borderColor: BORDER, borderRadius: brand.radius };

  return (
    <div
      className="flex h-[calc(100vh-7rem)] min-h-[620px] w-full gap-3"
      style={{ fontFamily: brand.fontBody, color: TEXT, backgroundColor: brand.backgroundColor }}
    >
      <p aria-live="polite" className="sr-only">
        {toast}
      </p>

      {/* Thread rail */}
      <aside
        className={(railOpen ? 'flex ' : 'hidden ') + 'w-64 shrink-0 flex-col border md:flex'}
        style={panelStyle}
        aria-label="Saved threads"
      >
        <div className="flex items-center justify-between gap-2 px-3 pt-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: MUTED, fontFamily: brand.fontHeading }}>
            Threads
          </h2>
          <button
            type="button"
            onClick={startNewChat}
            className={'inline-flex items-center gap-1 rounded px-2 py-1 text-[12px] font-medium ' + FOCUS}
            style={{ backgroundColor: brand.primaryColor, color: '#0A0E14', borderRadius: brand.radius }}
          >
            <Icons.Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New chat
          </button>
        </div>

        <div className="px-3 pt-3">
          <Label htmlFor="thread-search" className="sr-only">
            Search threads
          </Label>
          <div className="relative">
            <Icons.Search
              className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: MUTED }}
              aria-hidden="true"
            />
            <input
              id="thread-search"
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search threads"
              className={'w-full border py-1.5 pl-7 pr-2 text-[12.5px] placeholder:text-[#6F7988] ' + FOCUS}
              style={{ backgroundColor: '#0F141A', borderColor: BORDER, color: TEXT, borderRadius: brand.radius }}
            />
          </div>
          <p className="mt-1.5 text-[11px]" style={{ color: MUTED }}>
            Press <kbd className="rounded border px-1" style={{ borderColor: BORDER }}>/</kbd> to search from anywhere
          </p>
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {filtered.length === 0 ? (
            <div className="px-2 py-8 text-center">
              <p className="text-[12.5px]" style={{ color: TEXT }}>
                No threads match “{query}”.
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className={'mt-2 rounded border px-2 py-1 text-[12px] ' + FOCUS}
                style={{ borderColor: BORDER, color: TEXT, borderRadius: brand.radius }}
              >
                Clear search
              </button>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {filtered.map((t) => {
                const active = t.id === activeId;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => openThread(t.id)}
                      aria-current={active ? 'true' : undefined}
                      className={'w-full border-l-2 px-2.5 py-2 text-left hover:bg-[#1A212A] ' + FOCUS}
                      style={{
                        borderLeftColor: active ? brand.primaryColor : 'transparent',
                        backgroundColor: active ? PANEL_SOFT : 'transparent',
                        borderRadius: '0 ' + brand.radius + ' ' + brand.radius + ' 0',
                      }}
                    >
                      <span className="block truncate text-[12.5px] font-medium" style={{ color: TEXT }}>
                        {t.title}
                      </span>
                      <span className="mt-0.5 block text-[11px]" style={{ color: MUTED }}>
                        {t.last_activity_label} · {t.messages.filter((m) => m.role !== 'error').length} messages
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t px-3 py-2.5" style={{ borderColor: BORDER }}>
          <p className="text-[11px]" style={{ color: MUTED }}>
            Shared workspace · no sign-in
          </p>
        </div>
      </aside>

      {/* Chat column */}
      <section className="flex min-w-0 flex-1 flex-col border" style={panelStyle} aria-label="Conversation">
        <header className="border-b px-4 py-3" style={{ borderColor: BORDER }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1
                className={'truncate text-[17px] font-semibold leading-tight ' + (editing ? 'sr-only' : '')}
                style={{ fontFamily: brand.fontHeading, color: TEXT }}
              >
                {isDraft ? 'New chat' : activeThread ? activeThread.title : 'Chat'}
              </h1>
              {editing && activeThread ? (
                <form onSubmit={saveTitle} className="flex flex-wrap items-end gap-2">
                  <div>
                    <Label htmlFor="thread-title" className="block text-[11px]" style={{ color: MUTED }}>
                      Thread title
                    </Label>
                    <input
                      id="thread-title"
                      ref={titleRef}
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      className={'mt-1 w-64 border px-2 py-1 text-[13px] ' + FOCUS}
                      style={{ backgroundColor: '#0F141A', borderColor: BORDER, color: TEXT, borderRadius: brand.radius }}
                    />
                  </div>
                  <button
                    type="submit"
                    className={'rounded px-2.5 py-1.5 text-[12px] font-medium ' + FOCUS}
                    style={{ backgroundColor: brand.primaryColor, color: '#0A0E14', borderRadius: brand.radius }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className={'rounded border px-2.5 py-1.5 text-[12px] ' + FOCUS}
                    style={{ borderColor: BORDER, color: TEXT, borderRadius: brand.radius }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <p className="mt-1 text-[11.5px]" style={{ color: MUTED }}>
                  {isDraft
                    ? 'Nothing sent yet · empty threads are not saved'
                    : 'Started ' +
                      (activeThread ? activeThread.created_label : '') +
                      ' · last activity ' +
                      (activeThread ? activeThread.last_activity_label : '') +
                      ' · visible to everyone'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRailOpen((v) => !v)}
                aria-expanded={railOpen}
                className={'rounded border px-2 py-1.5 text-[12px] md:hidden ' + FOCUS}
                style={{ borderColor: BORDER, color: TEXT, borderRadius: brand.radius }}
              >
                <Icons.Menu className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                Threads
              </button>
              {!isDraft && activeThread && (
                <React.Fragment>
                  <button
                    type="button"
                    onClick={() => {
                      setTitleDraft(activeThread.title);
                      setEditing(true);
                    }}
                    className={'rounded border px-2 py-1.5 text-[12px] hover:bg-[#1A212A] ' + FOCUS}
                    style={{ borderColor: BORDER, color: TEXT, borderRadius: brand.radius }}
                  >
                    <Icons.Edit className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                    Rename
                  </button>
                  <button
                    type="button"
                    ref={deleteTriggerRef}
                    onClick={() => setConfirmOpen(true)}
                    className={'rounded border px-2 py-1.5 text-[12px] hover:bg-[#241A1A] ' + FOCUS}
                    style={{ borderColor: BORDER, color: TEXT, borderRadius: brand.radius }}
                  >
                    <Icons.Trash className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                    Delete
                  </button>
                </React.Fragment>
              )}
              <button
                type="button"
                onClick={() => navigate('library')}
                className={'rounded border px-2 py-1.5 text-[12px] hover:bg-[#1A212A] ' + FOCUS}
                style={{ borderColor: BORDER, color: TEXT, borderRadius: brand.radius }}
              >
                <Icons.FileText className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                Document library
              </button>
            </div>
          </div>

          <p className="mt-2 text-[11.5px]" style={{ color: MUTED }}>
            Answers are drawn from the whole shared library: {LIBRARY.total} documents, {LIBRARY.ready} Ready,{' '}
            {LIBRARY.processing} Processing, {LIBRARY.failed} Failed. Only Ready documents are searched.
          </p>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {isDraft ? (
            <div className="mx-auto max-w-xl py-10 text-center">
              <h2 className="text-[15px] font-semibold" style={{ fontFamily: brand.fontHeading, color: TEXT }}>
                Ask the shared library
              </h2>
              <p className="mt-2 text-[13px] leading-6" style={{ color: MUTED }}>
                Every question searches all {LIBRARY.ready} Ready documents. If nothing relevant is found, the answer
                says so rather than guessing.
              </p>
              <ul className="mt-5 space-y-2 text-left">
                {SUGGESTIONS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => {
                        setInput(s);
                        if (composerRef.current) composerRef.current.focus();
                      }}
                      className={'w-full border px-3 py-2 text-left text-[12.5px] hover:bg-[#1A212A] ' + FOCUS}
                      style={{ borderColor: BORDER, color: TEXT, borderRadius: brand.radius }}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ol className="mx-auto max-w-3xl space-y-5">
              {messages.map((m) => {
                const isStreamingMsg = m.streaming && stream && stream.messageId === m.id;
                const retrieving = isStreamingMsg && stream.retrieving;
                if (m.role === 'error') {
                  return (
                    <li key={m.id}>
                      <div
                        className="border px-3.5 py-3"
                        style={{ backgroundColor: '#1D1512', borderColor: '#4A3B2A', borderRadius: brand.radius }}
                      >
                        <p className="flex items-center gap-2 text-[12px] font-medium" style={{ color: WARN }}>
                          <Icons.AlertCircle className="h-4 w-4" aria-hidden="true" />
                          Answer interrupted
                        </p>
                        <p className="mt-1.5 text-[13px] leading-6" style={{ color: TEXT }}>
                          {m.content}
                        </p>
                        <button
                          type="button"
                          onClick={() => askQuestion(m.question, activeId, m.id)}
                          disabled={!!stream}
                          className={'mt-2.5 rounded px-2.5 py-1.5 text-[12px] font-medium disabled:opacity-50 ' + FOCUS}
                          style={{ backgroundColor: brand.primaryColor, color: '#0A0E14', borderRadius: brand.radius }}
                        >
                          Resend question
                        </button>
                      </div>
                    </li>
                  );
                }
                const isUser = m.role === 'user';
                return (
                  <li key={m.id}>
                    <div className="flex items-baseline gap-2">
                      <h3
                        className="text-[11px] font-semibold uppercase tracking-[0.08em]"
                        style={{ color: isUser ? MUTED : ACCENT, fontFamily: brand.fontHeading }}
                      >
                        {isUser ? 'You' : 'Night Desk'}
                      </h3>
                      <span className="text-[11px]" style={{ color: MUTED }}>
                        {m.at}
                      </span>
                      {m.incomplete && (
                        <span
                          className="rounded border px-1.5 py-0.5 text-[10.5px] font-medium"
                          style={{ borderColor: '#4A3B2A', color: WARN }}
                        >
                          Incomplete
                        </span>
                      )}
                      {m.notFound && !m.streaming && (
                        <span
                          className="rounded border px-1.5 py-0.5 text-[10.5px] font-medium"
                          style={{ borderColor: BORDER, color: MUTED }}
                        >
                          No citations
                        </span>
                      )}
                    </div>

                    <div
                      className="mt-1.5 border px-3.5 py-2.5 text-[13.5px] leading-6"
                      style={{
                        backgroundColor: isUser ? PANEL_SOFT : 'transparent',
                        borderColor: BORDER,
                        borderRadius: brand.radius,
                        color: TEXT,
                      }}
                      aria-busy={isStreamingMsg ? 'true' : undefined}
                    >
                      {retrieving ? (
                        <p role="status" className="flex items-center gap-2 text-[12.5px]" style={{ color: MUTED }}>
                          <Icons.Clock className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
                          Searching the library for relevant passages…
                        </p>
                      ) : (
                        <p>
                          {renderContent(m.content, m.citations || [])}
                          {isStreamingMsg && (
                            <span
                              className="ml-0.5 inline-block h-[14px] w-[7px] translate-y-[2px] animate-pulse"
                              style={{ backgroundColor: ACCENT }}
                              aria-hidden="true"
                            />
                          )}
                        </p>
                      )}
                    </div>

                    {!isUser && !m.streaming && m.citations && m.citations.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: MUTED }}>
                          Sources
                        </h4>
                        <ul className="mt-1.5 space-y-1">
                          {m.citations.map((c) => (
                            <li key={c.n}>
                              {c.removed ? (
                                <span
                                  className="flex flex-wrap items-center gap-x-2 gap-y-1 border px-2.5 py-1.5 text-[12px]"
                                  style={{ borderColor: '#4A3B2A', borderRadius: brand.radius, color: MUTED }}
                                >
                                  <span className="font-medium line-through">
                                    [{c.n}] {c.document_name_snapshot}
                                  </span>
                                  <span className="inline-flex items-center gap-1" style={{ color: WARN }}>
                                    <Icons.AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                    Removed from library · passage no longer retrievable
                                  </span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setCitation(c)}
                                  className={
                                    'flex w-full flex-wrap items-center gap-x-2 gap-y-1 border px-2.5 py-1.5 text-left text-[12px] hover:bg-[#1A212A] ' +
                                    FOCUS
                                  }
                                  style={{ borderColor: BORDER, borderRadius: brand.radius, color: TEXT }}
                                >
                                  <span className="font-medium">
                                    [{c.n}] {c.document_name_snapshot}
                                  </span>
                                  <span style={{ color: MUTED }}>{c.location}</span>
                                  <Icons.ChevronRight className="ml-auto h-3.5 w-3.5" style={{ color: MUTED }} aria-hidden="true" />
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {m.incomplete && (
                      <button
                        type="button"
                        onClick={() => askQuestion('Who owns the follow-up actions from the 14 August incident?', activeId, null)}
                        disabled={!!stream}
                        className={'mt-2 rounded border px-2.5 py-1.5 text-[12px] disabled:opacity-50 ' + FOCUS}
                        style={{ borderColor: BORDER, color: TEXT, borderRadius: brand.radius }}
                      >
                        Ask again to complete this answer
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Composer */}
        <form onSubmit={handleSubmit} className="border-t px-4 py-3" style={{ borderColor: BORDER }}>
          <div className="mx-auto max-w-3xl">
            <Label htmlFor="question" className="block text-[11px] font-medium" style={{ color: MUTED }}>
              Ask a question about the shared library
            </Label>
            <div className="mt-1.5 flex items-end gap-2">
              <textarea
                id="question"
                ref={composerRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="For example: what is the retention window for support tickets?"
                className={'min-h-[52px] flex-1 resize-none border px-3 py-2 text-[13.5px] leading-6 placeholder:text-[#6F7988] ' + FOCUS}
                style={{ backgroundColor: '#0F141A', borderColor: BORDER, color: TEXT, borderRadius: brand.radius }}
              />
              <button
                type="submit"
                disabled={!input.trim() || !!stream}
                className={'inline-flex h-[40px] items-center gap-1.5 px-3.5 text-[13px] font-medium disabled:opacity-45 ' + FOCUS}
                style={{ backgroundColor: brand.primaryColor, color: '#0A0E14', borderRadius: brand.radius }}
              >
                {stream ? 'Answering…' : 'Send'}
                <Icons.ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-1.5 text-[11px]" style={{ color: MUTED }}>
              Enter sends, Shift + Enter adds a line. Retrieval always covers the whole library.
            </p>
          </div>
        </form>
      </section>

      {/* Citation passage drawer */}
      {citation && (
        <aside
          className="hidden w-[320px] shrink-0 flex-col border lg:flex"
          style={panelStyle}
          aria-labelledby="passage-heading"
        >
          <div className="flex items-start justify-between gap-2 border-b px-3.5 py-3" style={{ borderColor: BORDER }}>
            <div>
              <h2 id="passage-heading" className="text-[13px] font-semibold" style={{ fontFamily: brand.fontHeading, color: TEXT }}>
                Cited passage
              </h2>
              <p className="mt-0.5 text-[11px]" style={{ color: MUTED }}>
                Citation [{citation.n}]
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCitation(null)}
              aria-label="Close cited passage"
              className={'rounded border p-1 hover:bg-[#1A212A] ' + FOCUS}
              style={{ borderColor: BORDER, color: TEXT, borderRadius: brand.radius }}
            >
              <Icons.X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
            <h3 className="text-[12.5px] font-medium" style={{ color: TEXT }}>
              {citation.document_name_snapshot}
            </h3>
            <p className="mt-0.5 text-[11.5px]" style={{ color: MUTED }}>
              {citation.location}
            </p>
            <blockquote
              className="mt-3 whitespace-pre-line border-l-2 px-3 py-2 text-[12.5px] leading-6"
              style={{ borderLeftColor: brand.primaryColor, backgroundColor: '#0F141A', color: TEXT }}
            >
              {citation.passage_text}
            </blockquote>
            <button
              type="button"
              onClick={() => navigate('library')}
              className={'mt-3 w-full rounded border px-2.5 py-1.5 text-[12px] hover:bg-[#1A212A] ' + FOCUS}
              style={{ borderColor: BORDER, color: TEXT, borderRadius: brand.radius }}
            >
              <Icons.Download className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
              Open original file
            </button>
          </div>
        </aside>
      )}

      {/* Delete confirmation */}
      {confirmOpen && activeThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(8,10,13,0.75)' }}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
            className="w-full max-w-md border p-5"
            style={panelStyle}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setConfirmOpen(false);
                if (deleteTriggerRef.current) deleteTriggerRef.current.focus();
              }
            }}
          >
            <h2 id="confirm-title" className="text-[15px] font-semibold" style={{ fontFamily: brand.fontHeading, color: TEXT }}>
              Delete “{activeThread.title}”?
            </h2>
            <p id="confirm-desc" className="mt-2 text-[13px] leading-6" style={{ color: MUTED }}>
              This thread and all {activeThread.messages.filter((m) => m.role !== 'error').length} messages are removed
              for the whole shared workspace, not just for you. It cannot be undone. Documents cited in the thread stay
              in the library.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  if (deleteTriggerRef.current) deleteTriggerRef.current.focus();
                }}
                className={'rounded border px-3 py-1.5 text-[12.5px] ' + FOCUS}
                style={{ borderColor: BORDER, color: TEXT, borderRadius: brand.radius }}
              >
                Cancel
              </button>
              <button
                type="button"
                ref={confirmRef}
                onClick={deleteThread}
                className={'rounded px-3 py-1.5 text-[12.5px] font-medium ' + FOCUS}
                style={{ backgroundColor: DANGER, color: '#FFFFFF', borderRadius: brand.radius }}
              >
                Delete for everyone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
