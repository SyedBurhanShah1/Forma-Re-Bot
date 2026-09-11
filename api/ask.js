// ============================================================
// FORMA RE — Studio Assistant backend (Vercel serverless function)
// ------------------------------------------------------------
// Runs server-side only. The Anthropic API key never reaches the
// browser. The frontend calls POST /api/ask with { question },
// and this function returns { answer, related, found }.
// ============================================================

const KNOWLEDGE_BASE = `
--- Time Off and Leave Policies ---

Request Procedure:
All leave requests must be submitted via the Leave Request Form
(https://docs.google.com/forms/d/e/1FAIpQLSfxp4C-wvZDvH6NFWhAQdFh2SdvIyxBZvnehDJA8hX3KrmPwQ/viewform)
at least one week before your planned leave. Leave requests should be submitted one week or, at minimum,
two days prior to the leave day so leads and management can manage workflow around it.

After applying for leave via the form, the employee should also inform HR directly.

Leave Types:
- Full Day Leave: for personal, vacation, or medical reasons.
- Half-Day Leave: personal or medical reasons, taken in either the first or second half of the day.
- Blackout Periods: during busy periods or critical project deadlines, taking leave may be difficult.
  Employee understanding and cooperation is appreciated during these times.

Leave Entitlement:
- 15 days of annual leave
- 5 days of casual leave
- 10 days of medical leave
- Employees on probation are limited in the leave they can take (emergencies excluded).

Note: Two half-days count as one full day off, deducted from the employee's allotted leave. Any short
leave longer than two hours is counted as a half-day.

Annual Leave:
- Entitlement: 15 days of annual leave per year.
- Accrual: the full annual leave entitlement is granted at the start of the year.

Casual Leave:
- Entitlement: available for personal reasons or emergencies.
- Notice period: employees should give reasonable notice for casual leave unless it's an emergency.

Special Leaves:
- Bereavement Leave: in the event of the death of an immediate family member, employees are entitled
  to a specified number of days of compassionate/bereavement leave.
- Maternity/Paternity Leave: aligned with local laws, so employees can take the time they need to
  welcome a new family member. Duration, eligibility, and the request/approval process are defined
  by this policy.
- Unpaid Leave: if an employee takes leave without notice and without informing anyone, it is treated
  as unpaid leave. Exceeding the allotted number of leave days also results in unpaid leave.

Blackout Period Policy:
- A Blackout Period is a critical project phase where deadlines and client deliverables require full
  team availability.
- During a Blackout Period, employees generally cannot take leave except in emergencies and with
  management approval. This exists to protect timely project completion and avoid overloading the
  rest of the team.
- Approved leave outside Blackout Periods is processed per normal company policy. Unapproved leave or
  absence may be treated as unpaid leave and may be reflected in the employee's performance evaluation.
- The company can declare Blackout Periods based on business and project needs.

Leave Procedure:
- Employees must inform HR and submit a leave form before taking leave.
- HR consults the relevant lead(s) about ongoing tasks, deadlines, and project needs before approving.
- Leave applied for on the same day is generally not considered, except in genuine emergencies.
- Approved leaves are paid; unapproved/unauthorized absences are unpaid.
- Employees must make sure both the leave form is submitted AND HR is informed, for proper
  record-keeping and approval.

--- (Add further firm policies and SOPs below this line as they're provided) ---

--- Work Schedule and Timings ---

Office hours:
- Monday to Thursday: 1:00 PM to 9:30 PM
- Friday: 2:30 PM to 9:30 PM
Everyone is expected to follow these hours unless management has approved a different schedule ahead
of time. Being present during these hours matters for keeping work on track.

Time tracking:
- Everyone must sign in and out using the Jibble time-tracking app and keep their log work running.
  This is how work hours and attendance are officially recorded.

Weekly hours requirement:
- Employees need to complete 42.5 working hours a week.
- Falling short is treated as a breach of the work-hour requirement. A warning is issued each time
  this happens, up to three warnings.
- After three warnings, if it keeps happening, further action may follow, which can include
  deducting days from the employee's leave allotment.
- Employees should plan ahead and give a heads-up if something might stop them from meeting the
  required hours.

Break timings:
- Monday to Thursday: 4:30 PM to 5:15 PM
- Friday (Jumma break): 5:30 PM to 6:15 PM
- A 10-minute break is allowed for Zuhr, Asar, and Maghrib prayers. Employees should coordinate any
  specific needs with their supervisor or HR.

Punctuality:
- Official arrival time is 1:00 PM, with a 10-minute grace period (so up to 1:10 PM).
- If an employee is late 3 times in a month, their salary will be deducted and it will affect their
  performance evaluation.
- If running late, the employee must inform HR before 1:00 PM.

--- Employment Classifications / Working Environment ---

- Full-Time Employees: work regular hours and are eligible for the company's full range of
  performance-based rewards.
- Part-Time Employees: not a standard offering, but may be considered in exceptional cases. Any
  benefits would be prorated based on hours worked.
- Temporary Employees: typically project-specific or for a defined period. Not every position is
  eligible for temporary status, and benefits may differ from full-time employees.
- Interns: the firm is not currently hiring interns. As a rule, we don't take on students, since balancing an internship alongside coursework tends to create difficulties for both project work and the student's studies. (If this changes, hiring will be announced separately.)
- Hybrid Employees: work some days in the office and the rest remotely, offered selectively based on
  circumstances and business needs. Salary is calculated based on the agreed number of days worked.

--- Salary, Reimbursements & Procurement ---

Salary disbursement:
- Salaries are processed and paid out between the 28th and the 2nd of every month.

Reimbursements & work tools:
- Before buying any software, tool, subscription, or other work-related expense, the employee must
  first discuss it with HR.
- Once approved, submit the Reimbursement Form
  (https://docs.google.com/forms/d/e/1FAIpQLSc8BpijrXbrIG9ztsDXm2kU3bRsWZhcUKg_vHkpcMqrUDuehg/viewform)
  along with receipts or invoices. Anything bought without prior approval may not be reimbursed.

Procurement:
- Any other office purchase needs HR's approval first — nothing should be ordered without permission,
  or it won't be reimbursed.
- Approved procurement reimbursements are normally paid out in the following month's payroll cycle,
  though this can be released sooner if there's an urgent need.

--- Performance Management, Promotions & Appraisals ---

- Career growth at the firm is entirely performance-based — promotions are tied to demonstrated
  achievements and contributions.
- Eligibility for promotion is based on clear, objective performance metrics and impact, kept
  transparent so employees know what's expected.
- The process is merit-driven: consistent high performance and real contributions are what count.
- Employees are encouraged to talk about their career goals and growth plans with their lead/management.

--- Overtime Policy ---

Eligibility:
- Overtime applies when someone works beyond 9:30 PM, or on weekends/public holidays.
- It must be assigned or approved by the lead or management in advance — simply staying late without
  approval does not count as overtime.
- Overtime work can be done from the office or remotely, subject to approval.

Notification:
- The lead must tell HR whenever someone is assigned overtime, and the employee should also let HR
  know they're working overtime (whether from office or home), ideally before it starts.
- HR keeps the overtime record for payroll purposes.

Logging:
- Jibble/log work must stay running throughout the overtime period — overtime is verified against
  this activity record. Unlogged or unverifiable overtime may not be compensated.

Compensation rates:
- Normal working days (Mon–Fri): 1.5× hourly rate
- Weekends: 2× hourly rate
- Public holidays: 2× hourly rate
- Example: at a PKR 600 hourly rate, normal-day overtime is PKR 900/hour, and weekend/holiday
  overtime is PKR 1,200/hour.

Role-specific overtime eligibility:
- Architects: do not get overtime pay for extra hours on regular weekdays. Architects are only paid
  overtime for working on national/public holidays and weekends, at 2× their hourly rate.
- Draftsmen: do get overtime pay for extra hours on weekdays, in addition to weekends and public
  holidays, following the standard compensation rates above.

Dinner while working overtime:
- Employees still in the office past 9:30 PM can order dinner — see the Overtime / Dinner Ordering
  Procedure (https://docs.google.com/document/d/1ALrw9omlrk2pXBqUsidEoD3aYPzlezeC3AJfZo7WCzQ/edit?tab=t.0#heading=h.6b5mpvrrp878)
  for details.

Important: overtime must be authorized and properly logged to be compensated — just staying past
9:30 PM on your own doesn't count as approved overtime.

--- Office Food Ordering Procedure ---

Regular orders (during the workday):
- An office boy takes food orders from each employee before the break.
- Regular meals are at the employee's own expense, ordered from any vendor of their choice.

Dinner during overtime:
- Anyone working past 9:30 PM is eligible for a company-paid dinner, up to PKR 500 per person.
- They can order any meal within that budget, or order from the company's referred home-based dinner
  provider (WhatsApp 0322 5391506 to see the menu).
- This is meant for people genuinely required to work late with assigned/approved overtime — not for
  staying after hours without a task.
- For assigned overtime, HR must be informed first. At month-end, HR shares a sheet where employees
  mark the overtime hours/days they worked, so notify HR to get on that sheet.

--- Office Property & Confidentiality of Work ---

- All office assets, work, and materials belong to the firm and can't be shared with outsiders unless
  officially released by the firm.
- Current employees may not share office work, files, or portfolios with former employees or outside
  individuals — including to help build someone's personal portfolio. This is a serious violation and
  can lead to immediate termination.
- Employees are responsible for taking care of office property (laptops, equipment, etc.), whether
  used in the office or at home.
- Any damage or loss must be reported to management right away — employees may be held liable for
  damage that happens while property is in their care.
- All office property must be returned when asked, when a project ends, or when employment ends.
- Office property can't be lent out or transferred without explicit company authorization.

--- Dress Code & Professional Conduct ---

Dress code:
- Keep a formal, clean, professional appearance during office hours.
- Avoid casual, inappropriate, or overly revealing clothing.

Conduct:
- Communicate respectfully and professionally with colleagues, leads, and management.
- Shouting, aggressive language, or raised voices aren't acceptable — handle disagreements calmly.

Music & noise:
- Music at a reasonable volume is fine as long as it doesn't disturb others, and content should be
  appropriate. Loud music, videos, or conversations that disrupt others' work aren't allowed.

Phone calls:
- Step outside for lengthy or personal calls; short calls at the desk are fine if they don't disturb
  others. Keep phones on silent or low volume during work hours.

Attendance & work logging:
- Arrive by 1:00 PM (grace period until 1:10 PM). Late arrivals can affect salary and performance
  evaluation. If running late, inform HR before 1:00 PM.
- Start the work log immediately after checking in on Jibble.
- If there's no assigned task, message the crew group and tag the relevant lead(s) to request work,
  rather than staying idle.

Compliance:
- Repeated or serious violations can lead to HR counseling, a formal warning, or further disciplinary
  action.

General expectation: a respectful, professional, and cooperative workplace — courtesy and integrity
toward colleagues, clients, and the workplace itself.

--- Employment Conclusion (Termination) Procedures ---

Grounds for termination can include poor performance, policy violations, or conduct that goes
against the company's values — reasons are always communicated clearly.

Typical process:
1. A verbal discussion first covers the concern and what improvement is needed.
2. A formal performance evaluation follows, with a defined period to fix the issues.
3. If things haven't improved by then, management reviews whether the employee continues.
4. If employment is ending, a formal notice and conclusion letter are issued per the employment
   agreement and policy.
5. Final salary and dues are calculated and paid on the normal payroll cycle, minus any applicable
   adjustments or recoveries.
6. The employee completes management/IT clearance, returns company property, and makes sure no
   company data remains on personal devices.
7. Confidentiality obligations continue after employment ends — no retaining, disclosing, or
   misusing company information.
8. An experience letter is issued once clearance and management approval are complete.

Notice period:
- A minimum of two weeks' notice is expected. If the employee is on a project that needs their
  presence, they may need to stay until it's done, or help arrange a substitute if they need to
  leave sooner. During notice, employees are expected to keep doing their job and help hand things
  over smoothly.

--- Confidential Matters ---

- Sensitive company information (financial data, project details, operational strategy) can't be
  shared with unauthorized people.
- Discussing or asking about a colleague's salary is strictly off-limits.
- Sharing a colleague's personal information without their consent isn't allowed.
- Violating confidentiality can lead to disciplinary action, up to termination.
- Current employees can't share office work, files, or portfolios with former employees or outsiders,
  including to help with someone's personal portfolio — a serious violation that can mean immediate
  termination.
- Social media: individual expression is fine, but keep confidentiality, avoid disparaging the
  company or colleagues, and stay professional online.

Client Protection & Non-Solicitation:
- Employees can't directly or indirectly contact, approach, or solicit any company client to offer
  freelance or alternative services outside their role at the firm — this applies during employment
  and for 3 years after leaving, regardless of the reason for leaving.
- If a client reaches out to an employee directly proposing to work independently, the employee must
  report it to management right away, and can't take on that work without written permission from
  the firm.
- For up to 3 years after leaving, former employees can't directly or indirectly provide services to,
  or solicit business from, any client they worked with or learned about while employed here.
- Breaking this policy is treated as a serious breach of professional ethics and can lead to legal
  action, including seeking damages or injunctive relief.

--- Events & Benefits ---

- The firm marks occasions like Independence Day, Defence Day, and other notable days with events.
- Dinner vouchers or treats are given from time to time to encourage and motivate employees.

--- Company Background ---

- Roushan Builds (Forma Re) started on January 1, 2023, blending traditional values with
  contemporary design solutions.
- Mission: to create timeless, innovative, and sustainable designs, combining creativity,
  precision, and integrity, with a lasting impact on the built environment.
- The employee handbook is a guide, not a binding contract — the company can update it at its
  discretion, and employment is at-will.

--- Equal Opportunity, Anti-Harassment & Support ---

- Roushan Builds is an equal-opportunity employer, committed to an inclusive workplace. Hiring,
  promotion, and retention decisions are based on qualifications, skills, and performance,
  regardless of race, color, religion, gender, national origin, age, disability, or other protected
  characteristics.
- The workplace should be free from harassment and discrimination — everyone is expected to treat
  each other with respect and dignity.
- Anyone who experiences harassment, discrimination, or discomfort at work is encouraged to go
  straight to HR. Reports are handled confidentially and discreetly, and HR is committed to
  addressing concerns promptly.

--- Probationary Period ---

- New hires typically go through a 3-month probationary period to assess performance and fit.
- Successful completion may lead to confirmation, but a pay increment after confirmation isn't
  guaranteed — it depends on continued strong performance.
- Expectations are communicated clearly, with regular check-ins and feedback during probation.
- If performance during probation isn't clearly defined either way, the company can extend a
  1-month grace period to reevaluate before deciding on continued employment.

--- Compensatory Time Off for Public Holidays ---

- Employees who work on a public holiday are eligible for compensatory time off — a day off in
  place of the public holiday they worked. (This is separate from the paid overtime rate that also
  applies to public-holiday work.)

--- Unsolicited Advice ---

- Constructive feedback and suggestions are welcome in meetings and relevant discussions.
- Employees should avoid giving unsolicited advice to colleagues about personal work habits, task
  management, app usage, or how to approach leadership, unless it's actually asked for. If there's a
  concern about a colleague, raise it with them directly and privately instead.

--- Drug & Alcohol Policy ---

- Zero tolerance for unlawful use, possession, or distribution of drugs or alcohol in the workplace.
- Employees are expected to come to work fit for duty, and may not consume alcohol or illegal
  substances during working hours.

--- Workplace Safety, Security & Technology ---

- Safety: follow workplace safety guidelines, report hazards promptly, and take part in safety
  training when it's offered.
- Emergencies: know the evacuation plan, emergency contacts, and designated assembly points.
- Security: comply with access controls, ID protocols, and report anything suspicious.
- Technology: company tech is for work use, handled responsibly and ethically. Unauthorized access,
  sharing confidential info, or anything that compromises cybersecurity is not allowed.
- Data protection: employees must safeguard company and client data; mishandling or unauthorized
  disclosure of data can lead to disciplinary action.

--- Exit Interview ---

- When someone leaves, they may go through an exit interview to share feedback about their time at
  the company and raise any lingering questions — useful for the company to keep improving.

--- Smoking Breaks ---

- Smoking is not allowed inside the office.
- Employees who smoke can step outside office premises to do so during their break time.

--- Attendance & Work Tracking Tools ---

- Jibble is used for attendance, and is also integrated with Slack as a backup way to mark
  attendance.
- Log Work is used for tracking project and task work.
- The usual flow is: clock in on Jibble first, then start logging work in Log Work.
- Anyone who hasn't been set up on Slack or Log Work yet, or needs help with the setup, should
  contact HR directly for assistance.

--- Ex-Employees & Portfolio Use ---

- Former employees are allowed to include work in their personal portfolio, as long as it isn't
  confidential.
- They should clearly describe which parts of the work were their own contribution.
- Anything included must stay within the bounds of the NDA they signed — nothing that would breach
  its confidentiality terms.

--- Meeting & Virtual Conduct SOPs ---

Camera compliance:
- Cameras must stay on for the full duration of every official meeting, for everyone — whether
  leading, contributing, or just observing — regardless of whether a client or outside participant
  has their camera on or off.
- Employees should be properly framed, well-lit, and use a neutral, professional background —
  no distracting virtual backgrounds.
- Joining with the camera off isn't allowed without prior approval; if the camera genuinely isn't
  working, tell the Office Admin right away so it can be sorted out. Excuses like bad lighting or low
  bandwidth aren't accepted as a reason to keep it off.

Meeting recordings & notes:
- After every official meeting, team members must watch the recording before starting any revisions
  or updates — relying on memory alone isn't acceptable, since details can be missed.
- Meeting notes are kept in the designated notes section and should be checked before implementing
  changes.
- Recordings should be stored in the shared folder and not shared outside the company without
  approval, and shouldn't be deleted.

Official display pictures:
- Employees must use the official firm-issued display picture across all work platforms — LinkedIn,
  Zoom, official email, Logwork, ClickUp, Google Chat, Upwork, and WhatsApp.
- No personal photos, avatars, nicknames, or informal display names on any of these platforms; if a
  personal WhatsApp picture is used it should still be professional and appropriate.
- Contact the Office Admin if you haven't received your official picture yet.

Zoom meeting etiquette:
- Join on time — 2 minutes early counts as on time.
- Mute when not speaking, use a quiet distraction-free space, and dress professionally as if in the
  office.
- Keep your display name as your real full name.
- Don't join late without notifying the host, use a bed/bedroom as your background, eat or drink
  visibly on camera, or leave without telling the host.

Meeting appearance & presentability:
- Attend meetings — whether from home or the office — from a clean, decent, appropriately lit space.
- Dress and grooming should be appropriate for an official meeting, and background noise should be
  minimal so you're clearly audible. Working from home doesn't lower these standards.

Client meeting communication (SOP 06):
- In client meetings, communicate clearly and professionally in English — appropriate vocabulary,
  correct pronunciation, and professional language.
- Keep improving English speaking, vocabulary, spelling, and pronunciation for effective client
  communication. Review relevant technical or project terminology before a meeting if needed.
- Do: speak clearly and professionally, use appropriate vocabulary and terminology, review
  unfamiliar words/technical terms beforehand, keep improving speaking/vocabulary/spelling/
  pronunciation, and ask for clarification when needed.
- Don't: use slang or overly casual language, use incorrect or unfamiliar terminology, ignore
  repeated spelling or pronunciation errors, speak unclearly or too quickly, or guess when
  clarification is actually needed.

--- Downloadable Documents ---

- The full Employee Handbook and the SOPs – Professional Conduct Standards documents are linked
  directly within this assistant, as Google Docs employees can open and read.
- Employees are expected to read both. HR will provide PDF copies of these documents for employees
  to sign and acknowledge for the SOPs and the Handbook.

--- Non-Disclosure Agreement (NDA) Terms — applies to all employees ---

Purpose: employees may access confidential, proprietary, sensitive, and personal information during
their employment. This information must stay strictly confidential and must not be disclosed,
misused, or exploited in any way that could harm the company or people associated with it.

What counts as confidential:
- Personal information about the employer (conversations, schedules, financial details, etc.)
- Business strategies, plans, financial data, marketing strategy, and operational methods
- Client lists, vendor details, partnerships, and related business contacts
- Employee information — salaries, roles, personal details, internal communications
- Internal processes, workflows, and proprietary methods
- Login credentials, passwords, access codes, and security measures for any company system
- Any internal document, email, message, or communication
- Anything marked, or reasonably understood, as confidential

Employee obligations:
- Don't disclose confidential information to anyone unauthorized — including friends, family,
  mentors, teachers, competitors, or other outsiders.
- Don't take, share, publish, or distribute screenshots, photos, recordings, or copies of company
  work, systems, or client material on personal or public platforms.
- Don't use confidential information for anything outside the scope of the job.
- Safeguard all physical and digital information, documents, and system access provided by the
  company, and report any suspected or actual breach or unauthorized access immediately.
- If asked about work or projects by someone outside the company, the answer should be that you're
  bound by an NDA and can't share details.

Internal processes & SOPs:
- All internal processes, SOPs, workflows, and methods are confidential. They can't be copied,
  reproduced, used to train others, disclosed, or reused outside the company without prior written
  approval — and this obligation continues even after employment ends.

Access & system security:
- Never share passwords, logins, or system access with anyone else, including former employees, or
  grant access to company files/tools/data without written authorization. Unauthorized sharing is a
  serious breach and can lead to termination, legal action, and financial liability.

Public disclosure exception:
- Confidential information can only be discussed externally if the company has already made the
  same information public itself, and even then only at a high level — no internal details or
  non-public specifics.

Ownership of work:
- All work, designs, content, projects, IP, data, and client-related information created or handled
  during employment belongs solely to Roushan Builds, which stays the credited originating entity.
- Employees can't claim ownership, reproduce, reuse, sell, license, or distribute this work without
  written consent — and neither can family members, relatives, or associates acting on their behalf,
  at any time, including after leaving. Doing so is treated as a serious breach.

Non-solicitation of clients, work & business opportunities:
- During employment and for an indefinite period after leaving, employees can't solicit, approach,
  or engage any client, former client, prospective client, vendor, or business contact of the firm
  for personal or professional gain.
- Can't use the firm's name, portfolio, work, reputation, or internal information to get outside
  work or financial gain, and can't help a family member or associate do so either.
- Can't divert or interfere with a business opportunity or project belonging to the firm.
- This applies whether the solicitation is direct or indirect, and whether the client reaches out
  first or not. Violating this is a material breach that can lead to legal action and damages.

Return of materials:
- When employment ends, or if asked, employees must return all company documents, devices,
  credentials, and materials, permanently delete any company data from personal devices/accounts,
  and not keep copies in any form.

Duration:
- The NDA applies throughout employment and continues indefinitely afterward, unless the company
  states otherwise in writing.

Consequences of breach:
- A breach can mean immediate termination, legal action, and financial penalties, damages, or
  injunctive relief as permitted by law.

Governing law:
- The NDA is governed by the laws of the Islamic Republic of Pakistan. It can only be changed in
  writing, signed by both parties.

--- Punctuality & Late Arrivals (additional detail) ---

- Late arrivals are recorded automatically, and the employee gets an automatic Slack notification
  whenever a late arrival is logged.
- If someone arrives late, they're expected to make up the lost time by staying later that day,
  where that's possible.

--- Log Work Requirements ---

- Log work should be started within 10–15 minutes of arriving at the office — not delayed for
  coffee, casual chats, or other non-work activities.
- Work activity needs to be properly logged for the time worked.
- For work discussions, Zoom is the preferred way to talk things through.
- If a discussion can't happen over Zoom, the employee should: start their log work, open the
  relevant project/work on screen, and have that discussion with the work visible on screen.
- While working or logging hours, the employee's screen should be showing actual work-related
  activity.

--- Overtime Verification ---

- Overtime has to be backed up by matching log work and Slack activity/records — without that, it
  can't be verified and won't be paid. The rule is simple: no records, no overtime payment. Make
  sure overtime hours are properly logged as they happen.

--- Breaks & Lunch (General Guidance) ---

- Break time is counted from the moment someone leaves their workstation until they return.
- Lunch/break duration is generally expected to be around 30 minutes, and employees should return
  to work promptly afterward. (Note: specific scheduled break windows are covered separately under
  Work Schedule and Timings — this is general guidance on how break time itself is tracked.)

--- Deadlines & Task Accountability ---

- Employees are responsible for completing their assigned tasks by the deadline — missing a
  deadline is treated as a performance/accountability issue.
- Whoever a task is assigned to is responsible for following it through to completion.
- If someone has no task assigned, they're expected to proactively look for productive work rather
  than stay idle (see also: message the crew group and tag a lead, under Dress Code & Professional
  Conduct).
- Performance is judged on actual work and results, not personal opinions.

--- Instructions & Communication ---

- Instructions from management or leads are to be followed, not treated as optional suggestions.
- Official office messages and work-related communications count as part of the job — employees
  should stay on top of relevant workplace communications.
- Communication should stay professional and work-related.

--- Professional Conduct & Teamwork (additional detail) ---

- Avoid unnecessary workplace gossip or talking about colleagues behind their back.
- The workplace should stay focused on collaboration, productivity, and professional teamwork, with
  everyone cooperating and keeping things respectful.
- Professional hierarchy should be respected — team leads are responsible for leading their teams,
  and employees are expected to follow their leads' legitimate instructions.

--- Workplace Environment ---

- Maintain appropriate workplace behavior and posture, and keep workstations clean and organized.
- Use the designated waste bins and dispose of waste properly.
- General workplace matters — lights, AC, chairs, washroom issues — go to Administration, not HR.

--- Coffee ---

- Employees are limited to one coffee per day.

--- Writing & AI-Assisted Communication ---

- Communicate professionally and clearly. Grammarly and ChatGPT can be used to help improve
  writing, grammar, and clarity where useful.
- Even with AI assistance, writing should still sound natural, professional, and relevant to the
  actual work.
`;

const SYSTEM_PROMPT = `You are the internal Studio Assistant for FORMA RE, an architecture firm.
Employees will ask short questions about the firm's policies and standard operating procedures (SOPs).

Answer ONLY using the knowledge base below. Use plain, everyday wording — avoid legal or corporate
phrasing, jargon, or overly formal language even if the source text is written that way. Say things
the way you'd explain them out loud to a coworker. Keep the answer brief: 2-4 sentences for most
questions, a short bullet list only when the question genuinely calls for steps. If a relevant link
or form URL is in the knowledge base, include it plainly.

The knowledge base is organized into named sections marked with "--- Section Name ---". When your
answer is drawn from a specific section, end it with a short reference in parentheses using that
exact section name, e.g. "(see: Meeting & Virtual Conduct SOPs)" or "(see: Time Off and Leave
Policies)" — so the employee knows where to read more in the Handbook or SOPs. Skip this reference
if the question is general and doesn't map cleanly to one section.

If the knowledge base does not contain the answer, set the "answer" field to exactly this style of
message: "This knowledge is not yet updated, please contact HR for this query." — adapt the wording
naturally to the question if needed, but keep that core meaning. Set "found" to false and return an
empty "related" list.

Respond with ONLY a JSON object, no preamble, no markdown code fences, in exactly this shape:
{"answer": "the answer text, in plain wording", "related": ["follow-up question 1", "follow-up question 2", "follow-up question 3"], "found": true}

Rules for "found":
- Set it to true if the knowledge base actually contains a real answer to the question.
- Set it to false if the knowledge base does NOT cover the question and you had to say so and point
  them to HR instead. This is used to flag the question for HR's attention, so be honest about it —
  don't mark "found": true just because you gave a polite response.

Rules for "related":
- Suggest 2-3 short, natural follow-up questions an employee would plausibly ask next.
- Base them ONLY on topics that are actually covered in the knowledge base below — never invent a
  follow-up about something the knowledge base doesn't mention.
- Phrase each as a real question, the way an employee would type it (e.g. "What counts as an emergency?").
- If the knowledge base doesn't clearly support any follow-up questions, return an empty array.

--- KNOWLEDGE BASE ---
${KNOWLEDGE_BASE}
--- END KNOWLEDGE BASE ---`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { question } = req.body || {};
  if (!question || typeof question !== 'string' || !question.trim()) {
    res.status(400).json({ error: 'Missing "question" in request body' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY. Set it in your Vercel project environment variables.' });
    return;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: question }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: `Anthropic API error: ${errText}` });
      return;
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((b) => b.type === 'text');
    const raw = textBlock ? textBlock.text : '';
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();

    let result;
    try {
      const parsed = JSON.parse(cleaned);
      result = {
        answer: parsed.answer || "I couldn't generate a response — please try again.",
        related: Array.isArray(parsed.related) ? parsed.related.slice(0, 3) : [],
        found: parsed.found !== false
      };
    } catch (parseErr) {
      result = { answer: raw || "I couldn't generate a response — please try again.", related: [], found: true };
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
